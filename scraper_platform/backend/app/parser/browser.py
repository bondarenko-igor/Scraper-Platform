from __future__ import annotations

from dataclasses import dataclass
from contextlib import suppress

from playwright.async_api import Browser, BrowserContext, Page, async_playwright

from ..core.config import Settings
from ..models import Proxy


@dataclass
class PageSnapshot:
    url: str
    final_url: str
    title: str
    html: str
    text: str
    links: list[str]


class BrowserManager:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._playwright = None
        self._browser: Browser | None = None

    async def start(self) -> None:
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(headless=self.settings.browser_headless)

    async def stop(self) -> None:
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None

    async def open_context(self, proxy: Proxy | None = None) -> BrowserContext:
        assert self._browser is not None
        proxy_cfg = None
        if proxy is not None:
            proxy_cfg = self._parse_proxy_url(proxy.proxy_url)
        return await self._browser.new_context(
            proxy=proxy_cfg,
            viewport={"width": 1440, "height": 1800},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            ),
        )

    async def snapshot(self, page: Page, wait_ms: int = 1500) -> PageSnapshot:
        with suppress(Exception):
            await page.wait_for_load_state("networkidle", timeout=5000)
        if wait_ms:
            await page.wait_for_timeout(wait_ms)
        html = await page.content()
        try:
            text = await page.locator("body").inner_text(timeout=5000)
        except Exception:
            text = await page.evaluate("() => document.body ? document.body.innerText : ''")
        links = await page.locator("a[href]").evaluate_all(
            """els => els.map(el => el.href).filter(Boolean).slice(0, 200)"""
        )
        return PageSnapshot(
            url=page.url,
            final_url=page.url,
            title=await page.title(),
            html=html,
            text=text,
            links=list(links),
        )

    def _parse_proxy_url(self, proxy_url: str) -> dict[str, str]:
        from urllib.parse import urlparse

        parsed = urlparse(proxy_url)
        host = parsed.hostname or "localhost"
        if parsed.port:
            server = f"{parsed.scheme}://{host}:{parsed.port}"
        else:
            server = f"{parsed.scheme}://{host}"
        payload = {"server": server}
        if parsed.username:
            payload["username"] = parsed.username
        if parsed.password:
            payload["password"] = parsed.password
        return payload
