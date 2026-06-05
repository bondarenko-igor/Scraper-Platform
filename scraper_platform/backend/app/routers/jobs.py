from fastapi import APIRouter, HTTPException, Query, Depends
from uuid import UUID

from .utils import service_dep
from ..core.config import get_settings

from ..models import (
    JobListResponse,
    JobStatus,
    ScrapeJobCreate,
    ScrapeJobRead,)

from ..service import ScraperService


router = APIRouter(prefix="/jobs", tags=["Scraper"])

settings = get_settings()


@router.post("", response_model=ScrapeJobRead)
async def create_job(payload: ScrapeJobCreate, service: ScraperService = Depends(service_dep)) -> ScrapeJobRead:
    return await service.create_job(payload)

@router.get("", response_model=JobListResponse)
async def list_jobs(
    status: JobStatus | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    service: ScraperService = Depends(service_dep),
) -> JobListResponse:
    items, total = await service.list_jobs(status, limit, offset)
    return JobListResponse(items=items, total=total)

@router.get("/{job_id}", response_model=ScrapeJobRead)
async def get_job(job_id: str, service: ScraperService = Depends(service_dep)) -> ScrapeJobRead:
    job = await service.get_job(UUID(job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.delete("/{job_id}", response_model=ScrapeJobRead)
async def cancel_job(job_id: str, service: ScraperService = Depends(service_dep)) -> ScrapeJobRead:
    job = await service.cancel_job(UUID(job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
