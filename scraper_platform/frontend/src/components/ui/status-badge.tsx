import type { JobStatus, ProxyStatus } from '@/types/api'
import type { WorkerStatus } from '@/types/worker'
import { Badge } from './badge'
import { cn } from '@/utils/cn'

const jobStyles: Record<JobStatus, string> = {
  queued: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  running: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  succeeded: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  cancelled: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  dead_lettered: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200',
}

const proxyStyles: Record<ProxyStatus, string> = {
  healthy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  suspect: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  unhealthy: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  disabled: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

const workerStyles: Record<WorkerStatus, string> = {
  idle: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  busy: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  offline: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge className={cn(jobStyles[status])}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

export function ProxyStatusBadge({ status }: { status: ProxyStatus }) {
  return <Badge className={cn(proxyStyles[status])}>{status}</Badge>
}

export function WorkerStatusBadge({ status }: { status: WorkerStatus }) {
  return <Badge className={cn(workerStyles[status])}>{status}</Badge>
}
