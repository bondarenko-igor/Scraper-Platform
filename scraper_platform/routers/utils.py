from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_session
from ..core.config import get_settings
from ..service import ScraperService
from ..parser.extractor import AIExtractor


def service_dep(session: AsyncSession = Depends(get_session)) -> ScraperService:
    settings = get_settings()
    return ScraperService(session, AIExtractor(settings))
