import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/components/ui/metric-card'
import { JsonViewer } from '@/components/ui/json-viewer'
import { JobStatusBadge } from '@/components/ui/status-badge'
import { TableSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useJobsSample } from '@/hooks/use-jobs'
import { extractionSuccessRate, countJobsByStatus } from '@/utils/job-stats'
import { formatPercent, truncate } from '@/utils/format'
import { cn } from '@/utils/cn'

type ViewMode = 'structured' | 'source' | 'compare'

export function ExtractionPage() {
  const { data, isLoading, isError, error, refetch } = useJobsSample(100)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('structured')

  const jobsWithExtraction = useMemo(
    () =>
      (data?.items ?? []).filter(
        (j) => j.extracted_json != null || j.source_json != null || j.status === 'failed',
      ),
    [data?.items],
  )

  const counts = countJobsByStatus(data?.items ?? [])
  const selected = jobsWithExtraction.find((j) => j.id === selectedId) ?? jobsWithExtraction[0]

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />
  }

  const failed = jobsWithExtraction.filter((j) => j.status === 'failed' || j.status === 'dead_lettered')
  const withSource = jobsWithExtraction.filter((j) => j.source_json != null)
  const fallbackRate = jobsWithExtraction.length
    ? withSource.length / jobsWithExtraction.length
    : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Extraction Center"
        description="AI extraction from rendered pages · see docs/extraction.md"
      />

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <MetricCard label="With extraction" value={jobsWithExtraction.length} icon={Sparkles} />
            <MetricCard label="Success rate" value={formatPercent(extractionSuccessRate(counts))} />
            <MetricCard label="Failed" value={failed.length} />
            <MetricCard label="OLX source hints" value={formatPercent(fallbackRate)} subtext="source_json usage" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1 max-h-[480px] overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle>Requests</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto flex-1 p-0">
                {jobsWithExtraction.length === 0 ? (
                  <div className="p-4">
                    <EmptyState icon={Sparkles} title="No extractions yet" />
                  </div>
                ) : (
                  <ul>
                    {jobsWithExtraction.map((job) => (
                      <li key={job.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(job.id)}
                          className={cn(
                            'w-full text-left px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--surface)]',
                            selected?.id === job.id && 'bg-[var(--surface)]',
                          )}
                        >
                          <p className="text-xs font-medium truncate">{truncate(job.url, 36)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <JobStatusBadge status={job.status} />
                            <span className="text-[10px] text-[var(--text-secondary)]">{job.source_type}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>Output</CardTitle>
                <div className="flex gap-1">
                  {(['structured', 'source', 'compare'] as ViewMode[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md',
                        view === v
                          ? 'bg-[var(--primary)] text-white'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]',
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {!selected ? (
                  <p className="text-sm text-[var(--text-secondary)]">Select a job</p>
                ) : (
                  <>
                    <Link
                      to={`/jobs/${selected.id}`}
                      className="text-xs text-[var(--primary)] hover:underline mb-3 inline-block"
                    >
                      View full job →
                    </Link>
                    {view === 'structured' && <JsonViewer data={selected.extracted_json} maxHeight="28rem" />}
                    {view === 'source' && <JsonViewer data={selected.source_json} maxHeight="28rem" />}
                    {view === 'compare' && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium mb-2 text-[var(--text-secondary)]">AI extracted</p>
                          <JsonViewer data={selected.extracted_json} maxHeight="20rem" />
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-2 text-[var(--text-secondary)]">
                            Source hints (OLX)
                          </p>
                          <JsonViewer data={selected.source_json} maxHeight="20rem" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
