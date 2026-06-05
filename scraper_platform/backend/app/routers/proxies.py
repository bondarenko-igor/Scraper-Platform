from fastapi import APIRouter, Depends

from .utils import service_dep
from ..core.config import get_settings
from ..models import ProxyCreate, ProxyRead
from ..service import ScraperService


router = APIRouter(prefix="/proxies", tags=["Scraper"])

settings = get_settings()

@router.post("", response_model=ProxyRead)
async def add_proxy(payload: ProxyCreate, service: ScraperService = Depends(service_dep)) -> ProxyRead:
    return await service.add_proxy(payload)

@router.get("", response_model=list[ProxyRead])
async def list_proxies(service: ScraperService = Depends(service_dep)) -> list[ProxyRead]:
    return await service.list_proxies()
