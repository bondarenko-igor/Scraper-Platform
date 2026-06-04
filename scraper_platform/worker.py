from __future__ import annotations

import asyncio
import os
import socket
from contextlib import suppress

from .parser.browser import BrowserManager
from .core.config import Settings, get_settings
from .core.db import SessionLocal, dispose_db, init_db
from .parser.extractor import AIExtractor
from .service import ScraperService


class Worker:
    def __init__(self, settings: Settings, worker_id: str | None = None) -> None:
        self.settings = settings
        self.worker_id = worker_id or self._default_worker_id()
        self.browser = BrowserManager(settings)

    def _default_worker_id(self) -> str:
        return f"{socket.gethostname()}:{os.getpid()}"

    async def run(self) -> None:
        await init_db()
        await self.browser.start()
        try:
            while True:
                processed = await self._run_batch_once()
                if processed == 0:
                    await asyncio.sleep(self.settings.worker_poll_interval_seconds)
        finally:
            await self.browser.stop()
            await dispose_db()

    async def run_once(self) -> int:
        await init_db()
        await self.browser.start()
        try:
            return await self._run_batch_once()
        finally:
            await self.browser.stop()
            await dispose_db()

    async def _run_batch_once(self) -> int:
        tasks = [self._process_one() for _ in range(self.settings.worker_concurrency)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return sum(1 for item in results if item is True)

    async def _process_one(self) -> bool:
        async with SessionLocal() as session:
            extractor = AIExtractor(self.settings)
            service = ScraperService(session, extractor)
            job = await service.claim_job(self.worker_id, self.settings.worker_lease_seconds)
            if job is None:
                return False
            proxy = await service.proxies.select_proxy()
            try:
                context = await self.browser.open_context(proxy)
                try:
                    page = await context.new_page()
                    await page.goto(
                        job.url,
                        wait_until="domcontentloaded",
                        timeout=self.settings.default_job_timeout_seconds * 1000,
                    )
                    snapshot = await self.browser.snapshot(page, wait_ms=job.render_wait_ms)
                finally:
                    await context.close()
                await service.process_snapshot(job, snapshot, proxy=proxy)
                return True
            except Exception as exc:
                with suppress(Exception):
                    if proxy is not None:
                        await service.proxies.record_failure(proxy, str(exc))
                await service.process_failure(job, str(exc), proxy=None)
                return True


async def worker_main_async(once: bool = False) -> int:
    settings = get_settings()
    worker = Worker(settings)
    if once:
        return await worker.run_once()
    await worker.run()
    return 0
