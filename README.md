# Scraper Platform

Distributed scraping platform built around Playwright, PostgreSQL, FastAPI, rotating proxies, queue workers, and an AI extraction layer.

This repository started as a tiny OLX parser. It now contains:

- a PostgreSQL-backed durable job queue
- a FastAPI control plane
- worker processes that claim jobs with `FOR UPDATE SKIP LOCKED`
- rotating proxy selection with health tracking
- Playwright-based browser rendering
- OpenAI-backed structured extraction with a safe fallback path
- OLX-specific parsing helpers for the existing use case

## Quick start

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `OPENAI_API_KEY` if you want AI extraction.
2. Start PostgreSQL.
3. Install dependencies:

```bash
pip install -e .
playwright install chromium
```

4. Initialize the database:

```bash
scraper-init-db
```

5. Start the API:

```bash
scraper-api
```

6. Start one or more workers:

```bash
scraper-worker
```

## Common API calls

Create a job:

```bash
curl -X POST http://localhost:8000/v1/jobs \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://example.com",
    "source_type": "generic",
    "priority": 5,
    "metadata": {"project": "demo"}
  }'
```

Check job status:

```bash
curl http://localhost:8000/v1/jobs/<job-id>
```

Register a proxy:

```bash
curl -X POST http://localhost:8000/v1/proxies \
  -H 'Content-Type: application/json' \
  -d '{
    "label": "residential-eu-1",
    "proxy_url": "http://user:pass@proxy.example.com:8000",
    "country": "DE"
  }'
```

## Docker

```bash
docker compose up --build
```

The API will be available on `http://localhost:8000`.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the runtime flow and service boundaries.

## Further reading

- [API reference](docs/api.md)
- [Extraction layer](docs/extraction.md)
- [Deployment notes](docs/deployment.md)
- [Usage guide](docs/usage.md)
