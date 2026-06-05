from fastapi import APIRouter
from .routers.proxies import router as proxies_router
from .routers.jobs import router as jobs_router

api_v1 = APIRouter(prefix="/v1")

api_v1.include_router(jobs_router)
api_v1.include_router(proxies_router)
