import { Activity, Database, Server } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { ErrorState } from '@/components/ui/error-state'
import { useHealth } from '@/hooks/use-health'
import { useJobsSample } from '@/hooks/use-jobs'
import { useProxies } from '@/hooks/use-proxies'
import { countJobsByStatus } from '@/utils/job-stats'
import { formatDate } from '@/utils/format'
import { API_BASE_URL } from '@/services/api-client'

export function HealthPage() {
  const health = useHealth()
  const jobs = useJobsSample(50)
  const proxies = useProxies()

  if (health.isError) {
    return <ErrorState message={health.error.message} onRetry={() => void health.refetch()} />
  }

  const counts = countJobsByStatus(jobs.data?.items ?? [])
  const proxyList = proxies.data ?? []
  const unhealthyProxies = proxyList.filter((p) => p.status !== 'healthy').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        description="Infrastructure status from GET /health and derived metrics"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <HealthCard
          icon={Activity}
          title="API"
          status={health.data?.status === 'ok' ? 'healthy' : 'degraded'}
          detail={`Last check: ${health.data ? formatDate(health.data.timestamp) : '—'}`}
        />
        <HealthCard
          icon={Database}
          title="PostgreSQL"
          status={health.data?.status === 'ok' ? 'healthy' : 'unknown'}
          detail="Queue & state store"
        />
        <HealthCard
          icon={Server}
          title="Proxies"
          status={unhealthyProxies === 0 && proxyList.length > 0 ? 'healthy' : proxyList.length === 0 ? 'unknown' : 'degraded'}
          detail={`${proxyList.length} registered · ${unhealthyProxies} non-healthy`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue health</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <Stat label="Queued" value={counts.queued} />
          <Stat label="Running" value={counts.running} />
          <Stat label="Failed (recent sample)" value={counts.failed} />
          <Stat label="Dead lettered" value={counts.dead_lettered} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connectivity</CardTitle>
        </CardHeader>
        <CardContent className="text-sm font-mono text-[var(--text-secondary)]">
          API base: {API_BASE_URL}
        </CardContent>
      </Card>
    </div>
  )
}

function HealthCard({
  icon: Icon,
  title,
  status,
  detail,
}: {
  icon: typeof Activity
  title: string
  status: string
  detail: string
}) {
  const color =
    status === 'healthy'
      ? 'text-[var(--success)]'
      : status === 'degraded'
        ? 'text-[var(--warning)]'
        : 'text-[var(--text-secondary)]'

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-[var(--primary)]" />
          <div>
            <p className="font-medium">{title}</p>
            <p className={`text-sm capitalize ${color}`}>{status}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{detail}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[var(--text-secondary)] text-xs">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}
