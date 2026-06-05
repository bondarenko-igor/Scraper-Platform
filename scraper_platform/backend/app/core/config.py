from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="Scraper Platform", alias="APP_NAME")
    environment: Literal["development", "staging", "production"] = Field(
        default="development", alias="ENVIRONMENT"
    )
    database_url: str = Field(
        default="postgresql+asyncpg://scraper:scraper@localhost:5432/scraper",
        alias="DATABASE_URL",
    )
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    ai_model: str = Field(default="gpt-5.4-mini", alias="AI_MODEL")
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    worker_concurrency: int = Field(default=2, alias="WORKER_CONCURRENCY")
    worker_poll_interval_seconds: float = Field(default=2.0, alias="WORKER_POLL_INTERVAL_SECONDS")
    worker_lease_seconds: int = Field(default=600, alias="WORKER_LEASE_SECONDS")
    browser_headless: bool = Field(default=True, alias="BROWSER_HEADLESS")
    default_job_timeout_seconds: int = Field(default=60, alias="DEFAULT_JOB_TIMEOUT_SECONDS")
    ai_max_input_chars: int = Field(default=60_000, alias="AI_MAX_INPUT_CHARS")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

