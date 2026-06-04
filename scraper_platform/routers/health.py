from fastapi import APIRouter, Depends

from ..service import ScraperService
from .utils import service_dep

router = APIRouter(prefix="/health")

@router.get("")
async def health(service: ScraperService = Depends(service_dep)) -> dict:
    return await service.health()
