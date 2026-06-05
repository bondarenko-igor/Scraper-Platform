/** Types aligned with scraper_platform/models.py and docs/api.md */

export type JobStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'dead_lettered'

export type ProxyStatus = 'healthy' | 'suspect' | 'unhealthy' | 'disabled'

export type SourceType = 'generic' | 'olx'

export interface ScrapeJobRead {
  id: string
  url: string
  source_type: string
  status: JobStatus
  priority: number
  attempts: number
  max_attempts: number
  next_attempt_at: string
  lease_expires_at: string | null
  locked_by: string | null
  last_error: string | null
  extraction_instruction: string | null
  output_schema: Record<string, unknown> | null
  metadata: Record<string, unknown>
  render_wait_ms: number
  final_url: string | null
  page_title: string | null
  html: string | null
  extracted_json: Record<string, unknown> | null
  source_json: Record<string, unknown> | null
  proxy_id: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface ScrapeJobCreate {
  url: string
  source_type?: SourceType
  priority?: number
  max_attempts?: number
  extraction_instruction?: string | null
  output_schema?: Record<string, unknown> | null
  metadata?: Record<string, unknown>
  render_wait_ms?: number
}

export interface JobListResponse {
  items: ScrapeJobRead[]
  total: number
}

export interface ProxyRead {
  id: string
  label: string
  proxy_url: string
  status: ProxyStatus
  country: string | null
  success_count: number
  failure_count: number
  cooldown_until: string | null
  last_used_at: string | null
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface ProxyCreate {
  label: string
  proxy_url: string
  country?: string | null
}

export interface HealthResponse {
  status: string
  timestamp: string
}

export interface JobListParams {
  status?: JobStatus
  limit?: number
  offset?: number
}
