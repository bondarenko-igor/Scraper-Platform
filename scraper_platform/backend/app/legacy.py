from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal


@dataclass(slots=True)
class ParsedListing:
    title: str
    price: Decimal
    currency: str
    olx_listing_id: str

