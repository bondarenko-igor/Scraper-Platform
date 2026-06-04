from scraper_platform.parser.utils import format_url, is_valid_olx_url


def test_format_url_adds_scheme_and_strips_query() -> None:
    assert format_url("olx.ua/some/listing?reason=tracking") == "https://olx.ua/some/listing"


def test_is_valid_olx_url_detects_domain() -> None:
    assert is_valid_olx_url("https://www.olx.ua/d/uk/obyavlenie/example")
    assert not is_valid_olx_url("https://example.com")

