import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkerStatusBadge } from '@/components/ui/status-badge'
import { MetricCard } from '@/components/ui/metric-card'
import { ErrorState } from '@/components/ui/error-state'
import { TableSkeleton } from '@/components/ui/skeleton'
import { useWorker } from '@/hooks/use-workers'
import { formatDate, formatPercent } from '@/utils/format'

export function WorkerDetailPage() {
  const { workerId = '' } = useParams()
  const { data: worker, isLoading, isError, error, refetch } = useWorker(workerId)

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />
  }

  if (isLoading || !worker) {
    return <TableSkeleton rows={4} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/workers"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-[var(--surface)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold font-mono">{worker.id}</h1>
            <WorkerStatusBadge status={worker.status} />
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Mock worker detail</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Jobs completed" value={worker.jobsCompleted} />
        <MetricCard label="Success rate" value={formatPercent(worker.metrics.successRate)} />
        <MetricCard label="Jobs (24h)" value={worker.metrics.jobsLast24h} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <span className="text-[var(--text-secondary)]">Avg processing: </span>
              {(worker.metrics.avgProcessingMs / 1000).toFixed(1)}s
            </p>
            <p>
              <span className="text-[var(--text-secondary)]">Errors: </span>
              {worker.errorCount}
            </p>
            <p>
              <span className="text-[var(--text-secondary)]">Last heartbeat: </span>
              {formatDate(worker.lastHeartbeat)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assigned jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {worker.assignedJobIds.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No active assignments</p>
            ) : (
              <ul className="font-mono text-xs space-y-1">
                {worker.assignedJobIds.map((id) => (
                  <li key={id}>
                    <Link to={`/jobs/${id}`} className="text-[var(--primary)] hover:underline">
                      {id}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent className="font-mono text-xs space-y-2">
          {worker.logs.map((log, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-[var(--text-secondary)] shrink-0">{formatDate(log.timestamp)}</span>
              <span
                className={
                  log.level === 'error'
                    ? 'text-[var(--error)]'
                    : log.level === 'warn'
                      ? 'text-[var(--warning)]'
                      : ''
                }
              >
                [{log.level}] {log.message}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
