# Frontend (Vite)
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY scraper_platform/frontend/package.json ./
COPY scraper_platform/frontend/package-lock.json ./

RUN npm ci

COPY scraper_platform/frontend ./
RUN npm run build


# Backend (FastAPI + Playwright)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    VITE_API_URL=http://localhost:8000

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    build-essential \
    libglib2.0-0 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libgtk-3-0 \
 && rm -rf /var/lib/apt/lists/*

COPY scraper_platform/backend/pyproject.toml ./
COPY README.md ./
COPY scraper_platform ./scraper_platform

RUN pip install --upgrade pip \
 && pip install --no-cache-dir .



RUN playwright install chromium \
 && rm -rf /ms-playwright/.cache || true

COPY --from=frontend-builder /app/frontend/dist ./frontend

EXPOSE 8000

CMD ["uvicorn", "scraper_platform.main:app", "--host", "0.0.0.0", "--port", "8000"]