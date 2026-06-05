import type { JobStatus, ScrapeJobRead } from '@/types/api'

export interface JobStatusCounts {
  queued: number
  running: number
  succeeded: number
  failed: number
  cancelled: number
  dead_lettered: number
  total: number
}

const ALL_STATUSES: JobStatus[] = [
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
  'dead_lettered',
]

export function emptyJobCounts(): JobStatusCounts {
  return {
    queued: 0,
    running: 0,
    succeeded: 0,
    failed: 0,
    cancelled: 0,
    dead_lettered: 0,
    total: 0,
  }
}

export function countJobsByStatus(jobs: ScrapeJobRead[]): JobStatusCounts {
  const counts = emptyJobCounts()
  for (const job of jobs) {
    counts[job.status] += 1
    counts.total += 1
  }
  return counts
}

export function extractionSuccessRate(counts: JobStatusCounts): number {
  const finished = counts.succeeded + counts.failed + counts.dead_lettered
  if (finished === 0) return 0
  return counts.succeeded / finished
}

export function jobsOverTime(jobs: ScrapeJobRead[], days = 7): { date: string; count: number }[] {
  const map = new Map<string, number>()
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    map.set(key, 0)
  }
  for (const job of jobs) {
    const key = job.created_at.slice(0, 10)
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1)
    }
  }
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }))
}

export function successFailureTrend(
  jobs: ScrapeJobRead[],
  days = 7,
): { date: string; succeeded: number; failed: number }[] {
  const map = new Map<string, { succeeded: number; failed: number }>()
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    map.set(d.toISOString().slice(0, 10), { succeeded: 0, failed: 0 })
  }
  for (const job of jobs) {
    if (!job.completed_at) continue
    const key = job.completed_at.slice(0, 10)
    const entry = map.get(key)
    if (!entry) continue
    if (job.status === 'succeeded') entry.succeeded += 1
    if (job.status === 'failed' || job.status === 'dead_lettered') entry.failed += 1
  }
  return Array.from(map.entries()).map(([date, v]) => ({ date, ...v }))
}

export { ALL_STATUSES }
