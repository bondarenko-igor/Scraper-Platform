/** Mock types — no worker API in backend yet (see docs/api.md) */

export type WorkerStatus = 'idle' | 'busy' | 'offline' | 'error'

export interface WorkerSummary {
  id: string
  status: WorkerStatus
  currentJobId: string | null
  currentJobUrl: string | null
  lastHeartbeat: string
  jobsCompleted: number
  errorCount: number
}

export interface WorkerDetail extends WorkerSummary {
  assignedJobIds: string[]
  logs: { timestamp: string; level: 'info' | 'warn' | 'error'; message: string }[]
  metrics: {
    avgProcessingMs: number
    successRate: number
    jobsLast24h: number
  }
}
