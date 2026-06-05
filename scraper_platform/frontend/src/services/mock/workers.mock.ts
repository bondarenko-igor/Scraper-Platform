import type { WorkerDetail, WorkerSummary } from '@/types/worker'

/** Mock worker fleet — backend has no worker HTTP API yet */

const MOCK_WORKERS: WorkerSummary[] = [
  {
    id: 'worker-01',
    status: 'busy',
    currentJobId: null,
    currentJobUrl: null,
    lastHeartbeat: new Date().toISOString(),
    jobsCompleted: 142,
    errorCount: 3,
  },
  {
    id: 'worker-02',
    status: 'idle',
    currentJobId: null,
    currentJobUrl: null,
    lastHeartbeat: new Date(Date.now() - 5_000).toISOString(),
    jobsCompleted: 98,
    errorCount: 1,
  },
  {
    id: 'worker-03',
    status: 'offline',
    currentJobId: null,
    currentJobUrl: null,
    lastHeartbeat: new Date(Date.now() - 3600_000).toISOString(),
    jobsCompleted: 201,
    errorCount: 8,
  },
]

export const workersMockService = {
  async list(): Promise<WorkerSummary[]> {
    await delay(200)
    return MOCK_WORKERS.map((w) => ({
      ...w,
      lastHeartbeat: w.status === 'offline' ? w.lastHeartbeat : new Date().toISOString(),
    }))
  },

  async getById(id: string): Promise<WorkerDetail | null> {
    await delay(200)
    const base = MOCK_WORKERS.find((w) => w.id === id)
    if (!base) return null
    return {
      ...base,
      assignedJobIds: base.currentJobId ? [base.currentJobId] : [],
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Worker ${id} heartbeat OK`,
        },
        {
          timestamp: new Date(Date.now() - 60_000).toISOString(),
          level: 'info',
          message: 'Claimed job from PostgreSQL queue',
        },
      ],
      metrics: {
        avgProcessingMs: 12_400,
        successRate: 0.94,
        jobsLast24h: 28,
      },
    }
  },
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
