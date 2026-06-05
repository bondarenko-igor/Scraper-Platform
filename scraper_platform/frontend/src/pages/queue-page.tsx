import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/components/ui/metric-card'
import { JobStatusBadge } from '@/components/ui/status-badge'
import { MetricCardSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { useJobsSample } from '@/hooks/use-jobs'
import { countJobsByStatus } from '@/utils/job-stats'

const PIPELINE = ['queued', 'running', 'succeeded', 'failed'] as const

export function QueuePage() {
  const { data, isLoading, isError, error, refetch } = useJobsSample(200)

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />
  }

  const counts = countJobsByStatus(data?.items ?? [])

  const throughput = Array.from({ length: 12 }).map((_, i) => ({
    hour: `${i * 2}:00`,
    processed: Math.max(0, Math.round(counts.succeeded / 12 + (i % 3) * 2)),
  }))

  const growth = Array.from({ length: 7 }).map((_, i) => ({
    day: `D${i + 1}`,
    pending: Math.max(0, counts.queued - i * 2),
    running: Math.min(counts.running + (i % 2), counts.running + 3),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Queue Monitoring"
        description="PostgreSQL-backed durable queue · live polling every 10s"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <MetricCard label="Pending" value={counts.queued} />
            <MetricCard label="Running" value={counts.running} />
            <MetricCard label="Completed" value={counts.succeeded} />
            <MetricCard label="Failed" value={counts.failed + counts.dead_lettered} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                {PIPELINE.map((stage, i) => (
                  <div key={stage} className="flex flex-1 items-center gap-2">
                    <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
                      <JobStatusBadge status={stage === 'succeeded' ? 'succeeded' : stage === 'failed' ? 'failed' : stage === 'running' ? 'running' : 'queued'} />
                      <p className="mt-2 text-2xl font-semibold">
                        {stage === 'queued'
                          ? counts.queued
                          : stage === 'running'
                            ? counts.running
                            : stage === 'succeeded'
                              ? counts.succeeded
                              : counts.failed + counts.dead_lettered}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] capitalize mt-1">{stage}</p>
                    </div>
                    {i < PIPELINE.length - 1 && (
                      <span className="hidden sm:block text-[var(--text-secondary)]">→</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Queue growth (sample)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={growth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="pending" stackId="1" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="running" stackId="1" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Processing throughput (estimated)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={throughput}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="processed" stroke="var(--success)" fill="var(--success)" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
