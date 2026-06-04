from decimal import Decimal

from scraper_platform.sources.olx import olx_source_hints, parse_olx_json_ld


HTML = """
<html lang="uk">
  <head>
    <title>Test Listing</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Test Listing",
      "offers": {
        "price": "12345",
        "priceCurrency": "UAH",
        "sku": "abc-123"
      }
    }
    </script>
  </head>
  <body>hello</body>
</html>
"""


def test_parse_olx_json_ld() -> None:
    listing = parse_olx_json_ld(HTML, "https://www.olx.ua/d/uk/obyavlenie/example")
    assert listing.title == "Test Listing"
    assert listing.price == Decimal("12345")
    assert listing.currency == "UAH"
    assert listing.olx_listing_id == "abc-123"


def test_olx_source_hints_wraps_listing() -> None:
    hints = olx_source_hints(HTML, "https://www.olx.ua/d/uk/obyavlenie/example")
    assert hints["listing"]["olx_listing_id"] == "abc-123"

