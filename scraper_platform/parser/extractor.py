from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from bs4 import BeautifulSoup
from jsonschema import Draft202012Validator

from ..core.config import Settings
from .browser import PageSnapshot


def clean_text_from_html(html: str, limit: int = 60_000) -> str:
    soup = BeautifulSoup(html, "lxml")
    for node in soup(["script", "style", "noscript", "svg", "canvas"]):
        node.decompose()
    text = soup.get_text("\n", strip=True)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    compact = "\n".join(lines)
    return compact[:limit]


def html_metadata(html: str) -> dict[str, Any]:
    soup = BeautifulSoup(html, "lxml")
    title = soup.title.string.strip() if soup.title and soup.title.string else None
    description = None
    canonical = None
    language = soup.html.get("lang") if soup.html else None
    for meta in soup.find_all("meta"):
        name = (meta.get("name") or meta.get("property") or "").lower()
        if name == "description" and meta.get("content"):
            description = meta["content"].strip()
        if name == "og:title" and not title and meta.get("content"):
            title = meta["content"].strip()
    for link in soup.find_all("link"):
        rel_value = link.get("rel") or []
        if isinstance(rel_value, str):
            rel_value = [rel_value]
        if any(str(part).lower() == "canonical" for part in rel_value) and link.get("href"):
            canonical = link["href"]
            break
    return {
        "title": title,
        "description": description,
        "canonical_url": canonical,
        "language": language,
    }


def heuristic_page_type(url: str, text: str) -> str:
    lowered = f"{url}\n{text[:2000]}".lower()
    if "olx." in lowered:
        return "marketplace_listing"
    if any(keyword in lowered for keyword in ["article", "news", "blog"]):
        return "article"
    if any(keyword in lowered for keyword in ["product", "price", "add to cart"]):
        return "product"
    return "webpage"


@dataclass
class ExtractionResult:
    data: dict[str, Any]
    model: str | None
    strategy: str
    raw_model_output: str | None = None


class AIExtractor:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client = None

    def _client_or_none(self):
        if not self.settings.openai_api_key:
            return None
        if self._client is None:
            from openai import AsyncOpenAI

            self._client = AsyncOpenAI(api_key=self.settings.openai_api_key)
        return self._client

    def build_default_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "page_type": {"type": "string"},
                "title": {"type": ["string", "null"]},
                "summary": {"type": ["string", "null"]},
                "canonical_url": {"type": ["string", "null"]},
                "language": {"type": ["string", "null"]},
                "key_facts": {"type": "array", "items": {"type": "string"}},
                "entities": {"type": "array", "items": {"type": "string"}},
                "links": {"type": "array", "items": {"type": "string"}},
                "metadata": {"type": "object"},
            },
            "required": ["page_type", "metadata"],
            "additionalProperties": True,
        }

    def extract_fallback(self, snapshot: PageSnapshot, source_json: dict[str, Any] | None = None) -> ExtractionResult:
        metadata = html_metadata(snapshot.html)
        text = clean_text_from_html(snapshot.html)
        data = {
            "page_type": heuristic_page_type(snapshot.final_url, text),
            "title": metadata.get("title") or snapshot.title,
            "summary": text[:500] if text else None,
            "canonical_url": metadata.get("canonical_url") or snapshot.final_url,
            "language": metadata.get("language"),
            "key_facts": [],
            "entities": [],
            "links": snapshot.links[:50],
            "metadata": {
                **metadata,
                "final_url": snapshot.final_url,
                "text_length": len(text),
                "source_json": source_json or {},
            },
        }
        return ExtractionResult(data=data, model=None, strategy="heuristic")

    def _compose_payload(
        self,
        snapshot: PageSnapshot,
        output_schema: dict[str, Any] | None,
        instruction: str | None,
        source_json: dict[str, Any] | None,
    ) -> tuple[str, str]:
        text = clean_text_from_html(snapshot.html, self.settings.ai_max_input_chars)
        metadata = html_metadata(snapshot.html)
        schema = output_schema or self.build_default_schema()
        prompt = f"""
You are extracting structured data from a webpage.
Return JSON only. Do not wrap in markdown.

Target schema:
{json.dumps(schema, ensure_ascii=False, indent=2)}

Webpage metadata:
{json.dumps({**metadata, "url": snapshot.final_url, "source_json": source_json or {}}, ensure_ascii=False, indent=2)}

User instruction:
{instruction or "Extract the most useful fields for this page."}

Cleaned page text:
{text}
""".strip()
        return prompt, text

    def _parse_json(self, raw: str) -> dict[str, Any]:
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.strip("`")
            raw = raw.removeprefix("json").strip()
        return json.loads(raw)

    def _validate_schema(self, data: dict[str, Any], schema: dict[str, Any] | None) -> None:
        if schema:
            Draft202012Validator(schema).validate(data)

    async def extract(
        self,
        snapshot: PageSnapshot,
        *,
        output_schema: dict[str, Any] | None = None,
        instruction: str | None = None,
        source_json: dict[str, Any] | None = None,
    ) -> ExtractionResult:
        client = self._client_or_none()
        if client is None:
            return self.extract_fallback(snapshot, source_json=source_json)

        prompt, _ = self._compose_payload(snapshot, output_schema, instruction, source_json)
        model = self.settings.ai_model
        response = await client.responses.create(
            model=model,
            input=prompt,
        )
        raw = getattr(response, "output_text", None) or ""
        try:
            data = self._parse_json(raw)
            self._validate_schema(data, output_schema)
            return ExtractionResult(data=data, model=model, strategy="openai", raw_model_output=raw)
        except Exception:
            repaired_prompt = f"""
The previous output was invalid JSON or did not match the schema.
Fix it and return JSON only.

Original prompt:
{prompt}

Invalid output:
{raw}
""".strip()
            repaired = await client.responses.create(model=model, input=repaired_prompt)
            repaired_raw = getattr(repaired, "output_text", None) or ""
            data = self._parse_json(repaired_raw)
            self._validate_schema(data, output_schema)
            return ExtractionResult(data=data, model=model, strategy="openai-repaired", raw_model_output=repaired_raw)
