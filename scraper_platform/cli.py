from __future__ import annotations

import argparse
import asyncio

from .core.config import get_settings
from .core.db import init_db
from .worker import worker_main_async


def _run(coro):
    return asyncio.run(coro)


def main() -> None:
    parser = argparse.ArgumentParser(prog="scraper-platform")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("api")
    worker_parser = sub.add_parser("worker")
    worker_parser.add_argument("--once", action="store_true", help="Process a single job and exit")
    sub.add_parser("init-db")

    args = parser.parse_args()
    if args.command == "api":
        api_main()
    elif args.command == "worker":
        worker_main(once=args.once)
    elif args.command == "init-db":
        init_db_main()


def api_main() -> None:
    settings = get_settings()
    import uvicorn

    uvicorn.run(
        "scraper_platform.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.environment == "development",
    )


def worker_main(once: bool = False) -> None:
    _run(worker_main_async(once=once))


def init_db_main() -> None:
    _run(init_db())

