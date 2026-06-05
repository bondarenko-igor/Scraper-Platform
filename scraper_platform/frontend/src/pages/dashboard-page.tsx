import { Link } from 'react-router-dom'
import {
  Briefcase,
  CheckCircle,
  Globe,
  Play,
  Server,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCardSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { JobStatusBadge } from '@/components/ui/status-badge'
import {
  JobsOverTimeChart,
  ProxyHealthChart,
  SuccessFailureChart,
} from '@/components/charts/jobs-chart'
import { useJobsSample } from '@/hooks/use-jobs'
import { useProxies } from '@/hooks/use-proxies'
import { useWorkers } from '@/hooks/use-workers'
import { useHealth } from '@/hooks/use-health'
import {
  countJobsByStatus,
  extractionSuccessRate,
  jobsOverTime,
  successFailureTrend,
} from '@/utils/job-stats'
import { formatPercent, formatRelative } from '@/utils/format'
import type { ProxyStatus } from '@/types/api'

export function DashboardPage() {
  const jobsQuery = useJobsSample(200)
  const proxiesQuery = useProxies()
  const workersQuery = useWorkers()
  const healthQuery = useHealth()

  if (jobsQuery.isError) {
    return <ErrorState message={jobsQuery.error.message} onRetry={() => void jobsQuery.refetch()} />
  }

  const jobs = jobsQuery.data?.items ?? []
  const counts = countJobsByStatus(jobs)
  const totalReported = jobsQuery.data?.total ?? counts.total
  const proxies = proxiesQuery.data ?? []
  const healthyProxies = proxies.filter((p) => p.status === 'healthy').length
  const workers = workersQuery.data ?? []
  const activeWorkers = workers.filter((w) => w.status !== 'offline').length

  const proxyChart = (['healthy', 'suspect', 'unhealthy', 'disabled'] as ProxyStatus[]).map(
    (status) => ({
      name: status,
      value: proxies.filter((p) => p.status === status).length,
      fill:
        status === 'healthy'
          ? 'var(--success)'
          : status === 'suspect'
            ? 'var(--warning)'
            : status === 'unhealthy'
              ? 'var(--error)'
              : 'var(--text-secondary)',
    }),
  )

  const recent = [...jobs]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 8)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[var(--text-secondary)]">
          System overview · metrics derived from job & proxy APIs (polling)
        </p>
      </div>

      {jobsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total jobs" value={totalReported} icon={Briefcase} />
          <MetricCard label="Running" value={counts.running} icon={Play} subtext={`${counts.queued} queued`} />
          <MetricCard label="Completed" value={counts.succeeded} icon={CheckCircle} />
          <MetricCard label="Failed" value={counts.failed + counts.dead_lettered} icon={XCircle} />
          <MetricCard label="Active workers" value={activeWorkers} icon={Server} subtext="Mock data" />
          <MetricCard label="Healthy proxies" value={healthyProxies} icon={Globe} subtext={`${proxies.length} total`} />
          <MetricCard
            label="Extraction success"
            value={formatPercent(extractionSuccessRate(counts))}
            icon={Sparkles}
          />
          <MetricCard
            label="API status"
            value={healthQuery.data?.status === 'ok' ? 'Healthy' : '—'}
            subtext={healthQuery.data ? formatRelative(healthQuery.data.timestamp) : undefined}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Jobs processed over time</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsQuery.isLoading ? (
              <div className="h-[240px] animate-pulse bg-[var(--border)]/30 rounded" />
            ) : (
              <JobsOverTimeChart data={jobsOverTime(jobs)} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Success vs failure</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsQuery.isLoading ? (
              <div className="h-[240px] animate-pulse bg-[var(--border)]/30 rounded" />
            ) : (
              <SuccessFailureChart data={successFailureTrend(jobs)} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No jobs yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {recent.map((job) => (
                  <li key={job.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-sm font-medium text-[var(--primary)] hover:underline truncate block"
                      >
                        {job.url}
                      </Link>
                      <p className="text-xs text-[var(--text-secondary)]">{formatRelative(job.updated_at)}</p>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Proxy health</CardTitle>
          </CardHeader>
          <CardContent>
            <ProxyHealthChart data={proxyChart} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System health summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-[var(--text-secondary)]">Database</p>
            <p className="font-medium">{healthQuery.data?.status === 'ok' ? 'Connected' : 'Unknown'}</p>
          </div>
          <div>
            <p className="text-[var(--text-secondary)]">Queue backend</p>
            <p className="font-medium">PostgreSQL (durable)</p>
          </div>
          <div>
            <p className="text-[var(--text-secondary)]">Real-time updates</p>
            <p className="font-medium">Polling (5–15s)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
