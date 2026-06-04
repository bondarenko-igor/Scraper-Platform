# Deployment

## Environment variables

Set these before starting the API or worker:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `AI_MODEL`
- `WORKER_CONCURRENCY`
- `WORKER_POLL_INTERVAL_SECONDS`
- `WORKER_LEASE_SECONDS`
- `BROWSER_HEADLESS`

## Local development

1. Start PostgreSQL.
2. Copy `.env.example` to `.env`.
3. Install dependencies with `pip install -e .`.
4. Run `scraper-init-db`.
5. Start `scraper-api`.
6. Start one or more `scraper-worker` processes.

## Docker Compose

The compose file includes:

- PostgreSQL
- API service
- worker service

Scale workers horizontally with:

```bash
docker compose up --build --scale worker=3
```

## Operational notes

- The queue is durable because job state is stored in PostgreSQL.
- Workers are safe to run on multiple machines as long as they share the same database.
- Proxy health is tracked in the `proxies` table and decays automatically on failures.

