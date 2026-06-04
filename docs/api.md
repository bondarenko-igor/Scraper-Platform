# API

## Health

`GET /health`

Returns service status and database connectivity.

## Jobs

`POST /v1/jobs`

Create a scrape job.

Example:

```json
{
  "url": "https://www.olx.ua/d/uk/obyavlenie/example-ID.html",
  "source_type": "olx",
  "priority": 10,
  "max_attempts": 3,
  "output_schema": null,
  "extraction_instruction": "Extract listing title, price, currency, location, and seller information."
}
```

`GET /v1/jobs/{job_id}`

Fetch status and result for a single job.

`GET /v1/jobs`

List jobs with optional status filtering.

## Proxies

`POST /v1/proxies`

Register a proxy in the rotation pool.

`GET /v1/proxies`

Inspect proxy health and usage.

