import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Power, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Label, FieldError } from '@/components/ui/label'
import { MetricCard } from '@/components/ui/metric-card'
import { DataTable } from '@/components/ui/data-table'
import { ProxyStatusBadge } from '@/components/ui/status-badge'
import { TableSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { useProxies, useCreateProxy } from '@/hooks/use-proxies'
import { formatDate, formatPercent, proxySuccessRate } from '@/utils/format'
import type { ProxyRead } from '@/types/api'

const proxySchema = z.object({
  label: z.string().min(1, 'Label required'),
  proxy_url: z.string().min(1, 'Proxy URL required'),
  country: z.string().optional(),
})

type ProxyForm = z.infer<typeof proxySchema>

export function ProxiesPage() {
  const { data, isLoading, isError, error, refetch } = useProxies()
  const createProxy = useCreateProxy()
  const [modalOpen, setModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProxyForm>({ resolver: zodResolver(proxySchema) })

  const proxies = data ?? []
  const healthy = proxies.filter((p) => p.status === 'healthy').length
  const degraded = proxies.filter((p) => p.status === 'suspect').length
  const failed = proxies.filter((p) => ['unhealthy', 'disabled'].includes(p.status)).length

  const onSubmit = handleSubmit(async (values) => {
    await createProxy.mutateAsync({
      label: values.label,
      proxy_url: values.proxy_url,
      country: values.country || null,
    })
    reset()
    setModalOpen(false)
  })

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proxy Management"
        description="GET/POST /v1/proxies · edit/disable/delete not in API yet"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Proxy
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Healthy" value={healthy} subtext="Ready for rotation" />
        <MetricCard label="Degraded" value={degraded} subtext="Suspect status" />
        <MetricCard label="Failed / disabled" value={failed} />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          data={proxies}
          keyExtractor={(p) => p.id}
          emptyMessage="No proxies registered"
          columns={[
            { id: 'label', header: 'Label', accessor: (p) => <span className="font-medium">{p.label}</span> },
            { id: 'country', header: 'Country', accessor: (p) => p.country ?? '—' },
            {
              id: 'status',
              header: 'Status',
              accessor: (p) => <ProxyStatusBadge status={p.status} />,
            },
            {
              id: 'rate',
              header: 'Success rate',
              accessor: (p) => formatPercent(proxySuccessRate(p.success_count, p.failure_count)),
            },
            {
              id: 'last_used',
              header: 'Last used',
              accessor: (p) => formatDate(p.last_used_at),
            },
            {
              id: 'usage',
              header: 'Usage',
              accessor: (p) => `${p.success_count + p.failure_count} runs`,
            },
            {
              id: 'actions',
              header: '',
              accessor: (p) => <ProxyActions proxy={p} />,
            },
          ]}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Proxy">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="label">Label</Label>
            <Input id="label" {...register('label')} placeholder="us-residential-1" />
            <FieldError message={errors.label?.message} />
          </div>
          <div>
            <Label htmlFor="proxy_url">Proxy URL</Label>
            <Input id="proxy_url" {...register('proxy_url')} placeholder="http://user:pass@host:port" />
            <FieldError message={errors.proxy_url?.message} />
          </div>
          <div>
            <Label htmlFor="country">Country (optional)</Label>
            <Input id="country" {...register('country')} placeholder="US" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createProxy.isPending}>
              Register
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function ProxyActions({ proxy }: { proxy: ProxyRead }) {
  return (
    <div className="flex gap-1 justify-end">
      <Button
        variant="ghost"
        size="icon"
        disabled
        title="Edit not in API"
        onClick={() => toast.info('Proxy update endpoint not available')}
      >
        <Pencil className="h-4 w-4 opacity-40" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled
        title="Disable not in API"
        onClick={() => toast.info('Proxy disable endpoint not available')}
      >
        <Power className="h-4 w-4 opacity-40" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled
        title="Delete not in API"
        onClick={() => toast.info('Proxy delete endpoint not available')}
      >
        <Trash2 className="h-4 w-4 opacity-40" />
      </Button>
      <span className="sr-only">Actions for {proxy.label}</span>
    </div>
  )
}
