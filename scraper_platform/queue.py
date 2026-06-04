from __future__ import annotations

import random
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import JobStatus, Proxy, ProxyStatus, ScrapeJob


class JobQueue:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def enqueue(self, payload: ScrapeJob) -> ScrapeJob:
        self.session.add(payload)
        await self.session.commit()
        await self.session.refresh(payload)
        return payload

    async def list_jobs(self, status: JobStatus | None = None, limit: int = 50, offset: int = 0) -> tuple[list[ScrapeJob], int]:
        filters = []
        if status is not None:
            filters.append(ScrapeJob.status == status)
        stmt = select(ScrapeJob)
        if filters:
            stmt = stmt.where(*filters)
        stmt = stmt.order_by(ScrapeJob.created_at.desc()).limit(limit).offset(offset)
        items = list((await self.session.execute(stmt)).scalars().all())
        count_stmt = select(func.count()).select_from(ScrapeJob)
        if filters:
            count_stmt = count_stmt.where(*filters)
        total = int((await self.session.execute(count_stmt)).scalar_one())
        return items, total

    async def get_job(self, job_id: UUID) -> ScrapeJob | None:
        return await self.session.get(ScrapeJob, job_id)

    async def claim_next_job(self, worker_id: str, lease_seconds: int) -> ScrapeJob | None:
        await self.requeue_expired_jobs()
        async with self.session.begin():
            stmt = (
                select(ScrapeJob)
                .where(
                    ScrapeJob.status == JobStatus.queued,
                    ScrapeJob.next_attempt_at <= func.now(),
                )
                .order_by(ScrapeJob.priority.desc(), ScrapeJob.created_at.asc())
                .with_for_update(skip_locked=True)
                .limit(1)
            )
            job = (await self.session.execute(stmt)).scalars().first()
            if job is None:
                return None
            job.status = JobStatus.running
            job.attempts += 1
            job.locked_by = worker_id
            job.lease_expires_at = datetime.now(UTC) + timedelta(seconds=lease_seconds)
            job.updated_at = datetime.now(UTC)
            await self.session.flush()
            return job

    async def complete_job(
        self,
        job: ScrapeJob,
        *,
        final_url: str | None,
        page_title: str | None,
        html: str | None,
        extracted_json: dict | None,
        source_json: dict | None,
        proxy_id: UUID | None,
    ) -> ScrapeJob:
        job.status = JobStatus.succeeded
        job.final_url = final_url
        job.page_title = page_title
        job.html = html
        job.extracted_json = extracted_json
        job.source_json = source_json
        job.proxy_id = proxy_id
        job.completed_at = datetime.now(UTC)
        job.lease_expires_at = None
        job.last_error = None
        await self.session.commit()
        await self.session.refresh(job)
        return job

    async def fail_job(self, job: ScrapeJob, error: str) -> ScrapeJob:
        retries_left = job.max_attempts - job.attempts
        job.last_error = error[:4000]
        job.lease_expires_at = None
        job.updated_at = datetime.now(UTC)
        if retries_left <= 0:
            job.status = JobStatus.dead_lettered
            job.completed_at = datetime.now(UTC)
        else:
            job.status = JobStatus.queued
            delay_seconds = min(300, 5 * (2 ** max(job.attempts - 1, 0)))
            job.next_attempt_at = datetime.now(UTC) + timedelta(seconds=delay_seconds)
        await self.session.commit()
        await self.session.refresh(job)
        return job

    async def cancel_job(self, job_id: UUID) -> ScrapeJob | None:
        job = await self.session.get(ScrapeJob, job_id)
        if not job:
            return None
        job.status = JobStatus.cancelled
        job.completed_at = datetime.now(UTC)
        await self.session.commit()
        await self.session.refresh(job)
        return job

    async def requeue_expired_jobs(self) -> int:
        async with self.session.begin():
            stmt = (
                select(ScrapeJob)
                .where(
                    ScrapeJob.status == JobStatus.running,
                    ScrapeJob.lease_expires_at.is_not(None),
                    ScrapeJob.lease_expires_at <= func.now(),
                )
                .with_for_update(skip_locked=True)
            )
            jobs = list((await self.session.execute(stmt)).scalars().all())
            for job in jobs:
                job.status = JobStatus.queued
                job.lease_expires_at = None
                job.locked_by = None
                job.next_attempt_at = datetime.now(UTC)
                job.last_error = "Lease expired and job was requeued"
            if jobs:
                await self.session.flush()
            return len(jobs)


class ProxyPool:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add_proxy(self, proxy: Proxy) -> Proxy:
        self.session.add(proxy)
        await self.session.commit()
        await self.session.refresh(proxy)
        return proxy

    async def list_proxies(self) -> list[Proxy]:
        stmt = select(Proxy).order_by(Proxy.created_at.asc())
        return list((await self.session.execute(stmt)).scalars().all())

    async def select_proxy(self) -> Proxy | None:
        stmt = select(Proxy).where(
            Proxy.status.in_([ProxyStatus.healthy, ProxyStatus.suspect]),
            or_(Proxy.cooldown_until.is_(None), Proxy.cooldown_until <= func.now()),
        )
        proxies = list((await self.session.execute(stmt)).scalars().all())
        if not proxies:
            return None
        weights = [max(1, p.success_count + 1 - p.failure_count) for p in proxies]
        return random.choices(proxies, weights=weights, k=1)[0]

    async def record_success(self, proxy: Proxy) -> Proxy:
        proxy.success_count += 1
        proxy.last_used_at = datetime.now(UTC)
        proxy.status = ProxyStatus.healthy
        proxy.cooldown_until = None
        await self.session.commit()
        await self.session.refresh(proxy)
        return proxy

    async def record_failure(self, proxy: Proxy, error: str) -> Proxy:
        proxy.failure_count += 1
        proxy.last_used_at = datetime.now(UTC)
        proxy.last_error = error[:4000]
        proxy.status = ProxyStatus.suspect if proxy.failure_count < 3 else ProxyStatus.unhealthy
        backoff = min(900, 30 * (2 ** max(proxy.failure_count - 1, 0)))
        proxy.cooldown_until = datetime.now(UTC) + timedelta(seconds=backoff)
        await self.session.commit()
        await self.session.refresh(proxy)
        return proxy
