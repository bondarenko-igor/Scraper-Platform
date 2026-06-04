from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, Literal
from uuid import UUID, uuid4

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field
from sqlalchemy import JSON, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from .core.db import Base


class JobStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    succeeded = "succeeded"
    failed = "failed"
    cancelled = "cancelled"
    dead_lettered = "dead_lettered"


class ProxyStatus(str, enum.Enum):
    healthy = "healthy"
    suspect = "suspect"
    unhealthy = "unhealthy"
    disabled = "disabled"


class ScrapeJob(Base):
    __tablename__ = "scrape_jobs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    url: Mapped[str] = mapped_column(String(2048), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(String(64), nullable=False, default="generic")
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, name="job_status"), nullable=False, default=JobStatus.queued, index=True
    )
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=0, index=True)
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    next_attempt_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )
    lease_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    locked_by: Mapped[str | None] = mapped_column(String(128), nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    extraction_instruction: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_schema: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    job_metadata: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, nullable=False, default=dict)
    render_wait_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=1500)
    final_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    page_title: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    html: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    source_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    proxy_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Proxy(Base):
    __tablename__ = "proxies"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    label: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    proxy_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    status: Mapped[ProxyStatus] = mapped_column(
        Enum(ProxyStatus, name="proxy_status"), nullable=False, default=ProxyStatus.healthy, index=True
    )
    country: Mapped[str | None] = mapped_column(String(32), nullable=True)
    success_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failure_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cooldown_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class ProxyCreate(BaseModel):
    label: str
    proxy_url: str
    country: str | None = None


class ProxyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    label: str
    proxy_url: str
    status: ProxyStatus
    country: str | None = None
    success_count: int
    failure_count: int
    cooldown_until: datetime | None = None
    last_used_at: datetime | None = None
    last_error: str | None = None
    created_at: datetime
    updated_at: datetime

class ScrapeJobCreate(BaseModel):
    url: AnyHttpUrl
    source_type: Literal["generic", "olx"] = "generic"
    priority: int = 0
    max_attempts: int = 3
    extraction_instruction: str | None = None
    output_schema: dict[str, Any] | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    render_wait_ms: int = 1500


class ScrapeJobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    url: str
    source_type: str
    status: JobStatus
    priority: int
    attempts: int
    max_attempts: int
    next_attempt_at: datetime
    lease_expires_at: datetime | None = None
    locked_by: str | None = None
    last_error: str | None = None
    extraction_instruction: str | None = None
    output_schema: dict[str, Any] | None = None
    metadata: dict[str, Any] = Field(validation_alias="job_metadata")
    render_wait_ms: int
    final_url: str | None = None
    page_title: str | None = None
    html: str | None = None
    extracted_json: dict[str, Any] | None = None
    source_json: dict[str, Any] | None = None
    proxy_id: UUID | None = None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None

class JobListResponse(BaseModel):
    items: list[ScrapeJobRead]
    total: int


class ClaimResult(BaseModel):
    job: ScrapeJobRead | None = None
    worker_id: str
