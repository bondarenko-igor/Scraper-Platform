import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, RotateCcw, Ban, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'
import { DataTable, type SortDirection } from '@/components/ui/data-table'
import { JobStatusBadge } from '@/components/ui/status-badge'
import { TableSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CreateJobModal } from '@/features/jobs/create-job-modal'
import { useJobsList, useCancelJob, useCreateJob } from '@/hooks/use-jobs'
import type { JobStatus, ScrapeJobRead } from '@/types/api'
import { formatDate, truncate } from '@/utils/format'
import { useLayoutContext } from '@/hooks/use-layout-context'

const PAGE_SIZE = 20

export function JobsPage() {
  const { globalSearch } = useLayoutContext()
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('')
  const [localSearch, setLocalSearch] = useState('')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [confirm, setConfirm] = useState<{ type: 'cancel'; id: string } | null>(null)

  const search = localSearch || globalSearch

  const { data, isLoading, isError, error, refetch } = useJobsList({
    status: statusFilter || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  })
  const cancelJob = useCancelJob()
  const createJob = useCreateJob()

  const sorted = useMemo(() => {
    let items = [...(data?.items ?? [])]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (j) =>
          j.url.toLowerCase().includes(q) ||
          j.id.toLowerCase().includes(q) ||
          j.source_type.toLowerCase().includes(q),
      )
    }
    items.sort((a, b) => {
      const av = a[sortKey as keyof ScrapeJobRead]
      const bv = b[sortKey as keyof ScrapeJobRead]
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return items
  }, [data?.items, search, sortKey, sortDir])

  const onSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const handleRetry = async (job: ScrapeJobRead) => {
    try {
      await createJob.mutateAsync({
        url: job.url,
        source_type: job.source_type as 'generic' | 'olx',
        priority: job.priority,
        metadata: job.metadata,
        extraction_instruction: job.extraction_instruction,
      })
      toast.info('New job created with same URL (retry via re-enqueue)')
    } catch {
      /* toast from mutation */
    }
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />
  }

  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Jobs"
        description="Manage scrape jobs · GET/POST/DELETE /v1/jobs"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Job
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={localSearch} onChange={setLocalSearch} placeholder="Filter jobs…" className="sm:max-w-xs" />
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as JobStatus | '')
            setPage(0)
          }}
          className="sm:max-w-[180px]"
        >
          <option value="">All statuses</option>
          <option value="queued">queued</option>
          <option value="running">running</option>
          <option value="succeeded">succeeded</option>
          <option value="failed">failed</option>
          <option value="cancelled">cancelled</option>
          <option value="dead_lettered">dead_lettered</option>
        </Select>
        {selected.size > 0 && (
          <span className="text-xs text-[var(--text-secondary)]">{selected.size} selected</span>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <DataTable
          data={sorted}
          keyExtractor={(r) => r.id}
          sortKey={sortKey}
          sortDirection={sortDir}
          onSort={onSort}
          selectedIds={selected}
          onSelectRow={(id, checked) => {
            setSelected((prev) => {
              const next = new Set(prev)
              if (checked) next.add(id)
              else next.delete(id)
              return next
            })
          }}
          onSelectAll={(checked) => {
            setSelected(checked ? new Set(sorted.map((j) => j.id)) : new Set())
          }}
          columns={[
            {
              id: 'id',
              header: 'Job ID',
              sortable: true,
              accessor: (j) => (
                <Link to={`/jobs/${j.id}`} className="font-mono text-xs text-[var(--primary)] hover:underline">
                  {j.id.slice(0, 8)}…
                </Link>
              ),
            },
            {
              id: 'url',
              header: 'URL',
              sortable: true,
              accessor: (j) => (
                <span className="text-xs" title={j.url}>
                  {truncate(j.url, 40)}
                </span>
              ),
            },
            { id: 'source_type', header: 'Source', sortable: true, accessor: (j) => j.source_type },
            {
              id: 'status',
              header: 'Status',
              sortable: true,
              accessor: (j) => <JobStatusBadge status={j.status} />,
            },
            { id: 'priority', header: 'Priority', sortable: true, accessor: (j) => j.priority },
            {
              id: 'created_at',
              header: 'Created',
              sortable: true,
              accessor: (j) => <span className="text-xs whitespace-nowrap">{formatDate(j.created_at)}</span>,
            },
            {
              id: 'updated_at',
              header: 'Updated',
              sortable: true,
              accessor: (j) => <span className="text-xs whitespace-nowrap">{formatDate(j.updated_at)}</span>,
            },
            {
              id: 'actions',
              header: '',
              accessor: (j) => (
                <div className="flex gap-1 justify-end">
                  <Link
                    to={`/jobs/${j.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface)]"
                    aria-label="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleRetry(j)}
                    aria-label="Retry"
                    title="Re-enqueue with same URL"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  {['queued', 'running'].includes(j.status) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirm({ type: 'cancel', id: j.id })}
                      aria-label="Cancel"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    title="Delete not exposed by API"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 opacity-30" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
        <span>
          Page {page + 1} of {Math.max(1, totalPages)} · {total} total
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <CreateJobModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Cancel job?"
        description="This calls DELETE /v1/jobs/{id} and marks the job as cancelled."
        confirmLabel="Cancel job"
        variant="danger"
        loading={cancelJob.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) {
            cancelJob.mutate(confirm.id, { onSuccess: () => setConfirm(null) })
          }
        }}
      />
    </div>
  )
}
