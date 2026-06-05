# Scraper Platform — Frontend

Production-ready React dashboard for the distributed web scraping platform (FastAPI + PostgreSQL + Playwright workers).

## Stack

- React 18+ / Vite / TypeScript
- React Router · TanStack Query · Axios · Zustand
- React Hook Form · Zod · Tailwind CSS v4
- Lucide React · Recharts · Framer Motion · Sonner (toasts)

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Ensure the API is running (`scraper-api` on port 8000). Vite proxies `/api` → `http://localhost:8000` (see `vite.config.ts`).

## Environment

Copy `.env.example` to `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | API base (use proxy in dev) |
| `VITE_APP_NAME` | Scraper Platform | UI title |

## Architecture

```
src/
├── app/           # Providers (QueryClient, toasts)
├── routes/        # Route definitions
├── pages/         # Route-level screens
├── features/      # Domain UI (e.g. create job modal)
├── components/
│   ├── layout/    # Sidebar, header, shell
│   ├── charts/    # Recharts wrappers
│   └── ui/        # Design system primitives
├── services/      # Axios API + mock workers
├── hooks/         # React Query hooks
├── store/         # Zustand (theme, UI)
├── types/         # DTOs from backend models
└── utils/         # Formatting, job aggregates
```

### Data layer

| Layer | Role |
|-------|------|
| `services/api-client.ts` | Axios instance, error normalization |
| `services/*.service.ts` | REST calls matching `docs/api.md` |
| `hooks/use-*.ts` | TanStack Query + mutations + polling |
| `types/api.ts` | Types aligned with `scraper_platform/models.py` |

### API coverage (source of truth: `docs/api.md`)

| Endpoint | UI |
|----------|-----|
| `GET /health` | Sidebar status, health page |
| `GET/POST /v1/jobs` | Jobs list, create modal, dashboard |
| `GET /v1/jobs/{id}` | Job detail |
| `DELETE /v1/jobs/{id}` | Cancel job |
| `GET/POST /v1/proxies` | Proxy management |

**Not in API (mock or derived):**

- Workers → `services/mock/workers.mock.ts`
- Dashboard/queue charts → aggregated from job list polling
- Retry → re-enqueue via `POST /v1/jobs` with same URL
- Proxy edit/disable/delete → UI disabled with notice
- WebSockets → **not supported**; polling (5–15s) per React Query `refetchInterval`

### Theme

Light/dark/system via Zustand + `localStorage` key `scraper-theme`. CSS variables in `src/index.css`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build

## Related docs

Backend documentation lives in the repository root `docs/` folder:

- `api.md` — endpoints
- `architecture.md` — control plane / workers / queue
- `extraction.md` — AI extraction
- `usage.md` — job payloads
- `deployment.md` — environment variables
