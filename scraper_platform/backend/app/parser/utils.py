from __future__ import annotations

from urllib.parse import urlparse, urlunparse


def format_url(url: str) -> str:
    value = url.strip()
    if not value.startswith(("http://", "https://")):
        value = f"https://{value}"
    parsed = urlparse(value)
    path = parsed.path or "/"
    cleaned = parsed._replace(path=path, query="", fragment="")
    return urlunparse(cleaned)


def normalize_olx_url(url: str) -> str:
    return format_url(url)


def is_valid_olx_url(url: str) -> bool:
    host = urlparse(format_url(url)).netloc.lower()
    return "olx." in host

