import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import type { JobStatus, ScrapeJobRead } from '@/types/api'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

const steps: { key: string; label: string; match: JobStatus[] }[] = [
  { key: 'created', label: 'Created', match: ['queued', 'running', 'succeeded', 'failed', 'cancelled', 'dead_lettered'] },
  { key: 'claimed', label: 'Claimed', match: ['running', 'succeeded', 'failed', 'dead_lettered'] },
  { key: 'running', label: 'Running', match: ['running', 'succeeded', 'failed', 'dead_lettered'] },
  { key: 'done', label: 'Completed', match: ['succeeded'] },
  { key: 'failed', label: 'Failed', match: ['failed', 'dead_lettered', 'cancelled'] },
]

function stepState(job: ScrapeJobRead, stepKey: string): 'done' | 'active' | 'pending' | 'error' {
  if (stepKey === 'failed') {
    if (['failed', 'dead_lettered', 'cancelled'].includes(job.status)) return 'error'
    return 'pending'
  }
  if (stepKey === 'done' && job.status === 'succeeded') return 'done'
  if (stepKey === 'running' && job.status === 'running') return 'active'
  if (stepKey === 'claimed' && job.locked_by) return 'done'
  if (stepKey === 'created') return 'done'
  if (stepKey === 'running' && ['succeeded', 'failed'].includes(job.status)) return 'done'
  if (stepKey === 'claimed' && ['succeeded', 'failed', 'running'].includes(job.status)) return 'done'
  return 'pending'
}

export function JobTimeline({ job }: { job: ScrapeJobRead }) {
  const visibleSteps = steps.filter((s) => s.key !== 'failed' || stepState(job, 'failed') !== 'pending')

  return (
    <ol className="relative space-y-0">
      {visibleSteps.map((step, i) => {
        const state = stepState(job, step.key)
        const Icon =
          state === 'done' ? CheckCircle2 : state === 'error' ? XCircle : state === 'active' ? Loader2 : Circle
        return (
          <li key={step.key} className="flex gap-3 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  state === 'done' && 'text-[var(--success)]',
                  state === 'error' && 'text-[var(--error)]',
                  state === 'active' && 'text-[var(--primary)] animate-spin',
                  state === 'pending' && 'text-[var(--border)]',
                )}
              />
              {i < visibleSteps.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-[var(--border)] min-h-[24px]" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{step.label}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {step.key === 'created' && formatDate(job.created_at)}
                {step.key === 'claimed' && (job.locked_by ? `Worker ${job.locked_by}` : '—')}
                {step.key === 'running' && job.lease_expires_at && `Lease until ${formatDate(job.lease_expires_at)}`}
                {step.key === 'done' && formatDate(job.completed_at)}
                {step.key === 'failed' && (job.last_error ?? job.status)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
