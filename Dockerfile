FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    libpq-dev \
    libglib2.0-0 \
    libnss3 \
    libatk-bridge2.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libxkbcommon0 \
    libasound2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libgtk-3-0 \
    libxcb1 \
    libx11-xcb1 \
    ca-certificates \
    curl \
 && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY scraper_platform ./scraper_platform

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip \
 && pip install .

RUN playwright install chromium

EXPOSE 8000