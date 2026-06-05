from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.config import get_settings
from .core.db import dispose_db, init_db
from .api import api_v1
from .routers.health import router as health_router

API_PREFIX = "/api"

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await dispose_db()


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(api_v1, prefix=API_PREFIX)
app.include_router(health_router, prefix=API_PREFIX)

app.mount(
    "/",
    StaticFiles(directory="frontend", html=True),
    name="frontend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
