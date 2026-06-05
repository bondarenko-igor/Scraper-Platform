import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JobStatusBadge } from '@/components/ui/status-badge'
import { JsonViewer, CodeViewer } from '@/components/ui/json-viewer'
import { ErrorState } from '@/components/ui/error-state'
import { TableSkeleton } from '@/components/ui/skeleton'
import { JobTimeline } from '@/features/jobs/job-timeline'
import { useJob } from '@/hooks/use-jobs'
import { useProxies } from '@/hooks/use-proxies'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

type Tab = 'extraction' | 'source' | 'html' | 'metadata' | 'logs'

export function JobDetailPage() {
  const { jobId = '' } = useParams()
  const { data: job, isLoading, isError, error, refetch } = useJob(jobId)
  const { data: proxies } = useProxies()
  const [tab, setTab] = useState<Tab>('extraction')

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />
  }

  if (isLoading || !job) {
    return <TableSkeleton rows={6} />
  }

  const proxy = proxies?.find((p) => p.id === job.proxy_id)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'extraction', label: 'Extracted JSON' },
    { id: 'source', label: 'Source JSON' },
    { id: 'html', label: 'Raw HTML' },
    { id: 'metadata', label: 'Metadata' },
    { id: 'logs', label: 'Execution' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/jobs"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold truncate">{job.page_title ?? job.url}</h1>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">{job.id}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <JobTimeline job={job} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <Info label="URL" value={job.url} mono />
            <Info label="Source type" value={job.source_type} />
            <Info label="Priority" value={String(job.priority)} />
            <Info label="Attempts" value={`${job.attempts} / ${job.max_attempts}`} />
            <Info label="Worker" value={job.locked_by ?? '—'} />
            <Info label="Proxy" value={proxy?.label ?? job.proxy_id ?? '—'} />
            <Info label="Final URL" value={job.final_url ?? '—'} mono />
            <Info label="Created" value={formatDate(job.created_at)} />
            <Info label="Completed" value={formatDate(job.completed_at)} />
            {job.last_error && (
              <div className="sm:col-span-2">
                <p className="text-[var(--text-secondary)] text-xs mb-1">Last error</p>
                <p className="text-[var(--error)] text-xs">{job.last_error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex border-b border-[var(--border)] overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
                tab === t.id
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CardContent className="pt-4">
          {tab === 'extraction' && <JsonViewer data={job.extracted_json} maxHeight="32rem" />}
          {tab === 'source' && <JsonViewer data={job.source_json} maxHeight="32rem" />}
          {tab === 'html' && <CodeViewer content={job.html} language="html" maxHeight="32rem" />}
          {tab === 'metadata' && <JsonViewer data={job.metadata} />}
          {tab === 'logs' && (
            <div className="space-y-2 font-mono text-xs">
              <LogLine ts={job.created_at} msg="Job enqueued" />
              {job.locked_by && <LogLine ts={job.updated_at} msg={`Claimed by ${job.locked_by}`} />}
              {job.status === 'running' && <LogLine ts={job.updated_at} msg="Processing in Playwright worker" />}
              {job.completed_at && (
                <LogLine ts={job.completed_at} msg={`Finished with status: ${job.status}`} />
              )}
              {job.extraction_instruction && (
                <p className="text-[var(--text-secondary)] mt-4">
                  Instruction: {job.extraction_instruction}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className={cn('font-medium break-all', mono && 'font-mono text-xs')}>{value}</p>
    </div>
  )
}

function LogLine({ ts, msg }: { ts: string; msg: string }) {
  return (
    <div className="flex gap-3 text-[var(--text-secondary)]">
      <span className="shrink-0">{formatDate(ts)}</span>
      <span className="text-[var(--text-primary)]">{msg}</span>
    </div>
  )
}
