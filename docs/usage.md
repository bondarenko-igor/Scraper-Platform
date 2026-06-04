# Usage

## Enqueue a scrape

Use `POST /v1/jobs` to enqueue a page.

Minimal generic job:

```json
{
  "url": "https://example.com",
  "source_type": "generic"
}
```

OLX job:

```json
{
  "url": "https://www.olx.ua/d/uk/obyavlenie/example-ID.html",
  "source_type": "olx",
  "priority": 10,
  "extraction_instruction": "Extract title, price, currency, location, and seller details.",
  "metadata": {
    "category": "vehicles"
  }
}
```

## Reading results

The job record holds:

- `status`
- `attempts`
- `last_error`
- `source_json`
- `extracted_json`
- `html`
- `final_url`
- `page_title`

## Worker model

Each worker process:

1. claims a queued job from PostgreSQL
2. picks a proxy if one is available
3. renders the page in Playwright
4. extracts source hints and AI JSON
5. stores the final payload back in PostgreSQL

This means you can scale by running more worker processes rather than changing the API.

