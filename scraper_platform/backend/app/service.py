from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from .parser.browser import PageSnapshot
from .parser.extractor import AIExtractor
from .models import JobStatus, Proxy, ProxyCreate, ProxyRead, ScrapeJob, ScrapeJobCreate, ScrapeJobRead
from .queue import JobQueue, ProxyPool
from .sources.olx import olx_source_hints
from .parser.utils import format_url, is_valid_olx_url


class ScraperService:
    def __init__(self, session: AsyncSession, extractor: AIExtractor) -> None:
        self.session = session
        self.jobs = JobQueue(session)
        self.proxies = ProxyPool(session)
        self.extractor = extractor

    async def create_job(self, payload: ScrapeJobCreate) -> ScrapeJobRead:
        job = ScrapeJob(
            url=format_url(str(payload.url)),
            source_type=payload.source_type,
            priority=payload.priority,
            max_attempts=payload.max_attempts,
            extraction_instruction=payload.extraction_instruction,
            output_schema=payload.output_schema,
            job_metadata=payload.metadata,
            render_wait_ms=payload.render_wait_ms,
        )
        saved = await self.jobs.enqueue(job)
        return ScrapeJobRead.model_validate(saved)

    async def list_jobs(self, status: JobStatus | None, limit: int, offset: int) -> tuple[list[ScrapeJobRead], int]:
        items, total = await self.jobs.list_jobs(status=status, limit=limit, offset=offset)
        return [ScrapeJobRead.model_validate(item) for item in items], total

    async def get_job(self, job_id: UUID) -> ScrapeJobRead | None:
        job = await self.jobs.get_job(job_id)
        return ScrapeJobRead.model_validate(job) if job else None

    async def cancel_job(self, job_id: UUID) -> ScrapeJobRead | None:
        job = await self.jobs.cancel_job(job_id)
        return ScrapeJobRead.model_validate(job) if job else None

    async def add_proxy(self, payload: ProxyCreate) -> ProxyRead:
        proxy = Proxy(label=payload.label, proxy_url=payload.proxy_url, country=payload.country)
        saved = await self.proxies.add_proxy(proxy)
        return ProxyRead.model_validate(saved)

    async def list_proxies(self) -> list[ProxyRead]:
        proxies = await self.proxies.list_proxies()
        return [ProxyRead.model_validate(proxy) for proxy in proxies]

    async def claim_job(self, worker_id: str, lease_seconds: int) -> ScrapeJob | None:
        return await self.jobs.claim_next_job(worker_id, lease_seconds)

    async def process_snapshot(self, job: ScrapeJob, snapshot: PageSnapshot, *, proxy: Proxy | None) -> ScrapeJob:
        source_json: dict[str, Any] | None = None
        if job.source_type == "olx" or is_valid_olx_url(job.url):
            source_json = olx_source_hints(snapshot.html, snapshot.final_url)
        extraction = await self.extractor.extract(
            snapshot,
            output_schema=job.output_schema,
            instruction=job.extraction_instruction,
            source_json=source_json,
        )
        if proxy is not None:
            await self.proxies.record_success(proxy)
        return await self.jobs.complete_job(
            job,
            final_url=snapshot.final_url,
            page_title=snapshot.title,
            html=snapshot.html,
            extracted_json=extraction.data,
            source_json=source_json,
            proxy_id=proxy.id if proxy else None,
        )

    async def process_failure(self, job: ScrapeJob, error: str, proxy: Proxy | None = None) -> ScrapeJob:
        if proxy is not None:
            await self.proxies.record_failure(proxy, error)
        return await self.jobs.fail_job(job, error)

    async def health(self) -> dict[str, Any]:
        await self.session.execute(text("SELECT 1"))
        return {"status": "ok", "timestamp": datetime.now(UTC).isoformat()}
