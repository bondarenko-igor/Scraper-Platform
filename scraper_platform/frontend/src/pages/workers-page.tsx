import { Link } from 'react-router-dom'
import { Server } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { WorkerStatusBadge } from '@/components/ui/status-badge'
import { MetricCardSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useWorkers } from '@/hooks/use-workers'
import { formatRelative, truncate } from '@/utils/format'
import { motion } from 'framer-motion'

export function WorkersPage() {
  const { data, isLoading, isError, error, refetch } = useWorkers()

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers"
        description="Worker fleet monitoring · mock data (no HTTP API in backend)"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState
          icon={Server}
          title="No workers"
          description="Start scraper-worker processes to populate the fleet."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((worker, i) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/workers/${worker.id}`}>
                <Card className="hover:border-[var(--primary)] transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">{worker.id}</span>
                      <WorkerStatusBadge status={worker.status} />
                    </div>
                    <div className="text-xs space-y-1 text-[var(--text-secondary)]">
                      <p>
                        Current job:{' '}
                        <span className="text-[var(--text-primary)]">
                          {worker.currentJobUrl ? truncate(worker.currentJobUrl, 32) : '—'}
                        </span>
                      </p>
                      <p>Heartbeat: {formatRelative(worker.lastHeartbeat)}</p>
                      <p>Completed: {worker.jobsCompleted} · Errors: {worker.errorCount}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
