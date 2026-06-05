from __future__ import annotations

import json
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Any

from bs4 import BeautifulSoup

from ..parser.utils import format_url, is_valid_olx_url


@dataclass
class ParsedListing:
    title: str
    price: Decimal
    currency: str
    olx_listing_id: str
    url: str


def parse_olx_json_ld(html: str, url: str) -> ParsedListing:
    soup = BeautifulSoup(html, "lxml")
    scripts = soup.find_all("script", attrs={"type": "application/ld+json"})
   
    for script in scripts:
        if not script.string:
       
            continue
        try:
            payload = json.loads(script.string)
        except json.JSONDecodeError:
            continue

        if isinstance(payload, list):
            payload = next((item for item in payload if isinstance(item, dict) and item.get("@type")), None)

        if not isinstance(payload, dict):
            continue

        offers = payload.get("offers") or {}
        raw_price = offers.get("price")
        listing_id = str(offers.get("sku") or payload.get("sku") or "")
        if not listing_id or raw_price is None:
            continue

        try:
            price = Decimal(str(raw_price))
        except (InvalidOperation, TypeError) as exc:
            raise ValueError(f"Invalid OLX price value: {raw_price}") from exc

        title = str(payload.get("name") or "Unknown listing").strip()
        currency = str(offers.get("priceCurrency") or "UAH")

        return ParsedListing(
            title=title,
            price=price,
            currency=currency,
            olx_listing_id=listing_id,
            url=format_url(url),
        )

    raise ValueError("OLX JSON-LD listing payload not found")


def olx_source_hints(html: str, url: str) -> dict[str, Any]:
    try:
        listing = parse_olx_json_ld(html, url)
        return {
            "listing": {
                "title": listing.title,
                "price": str(listing.price),
                "currency": listing.currency,
                "olx_listing_id": listing.olx_listing_id,
                "url": listing.url,
            }
        }
    except Exception:
        return {"listing": None, "detected": is_valid_olx_url(url)}

