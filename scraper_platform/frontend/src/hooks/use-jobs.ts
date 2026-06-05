import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { jobsService } from '@/services/jobs.service'
import type { JobListParams, ScrapeJobCreate } from '@/types/api'
import { queryKeys } from './query-keys'

export function useJobsList(params?: JobListParams) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: () => jobsService.list(params),
    refetchInterval: 5_000,
  })
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: () => jobsService.getById(jobId),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'queued' || status === 'running') return 3_000
      return false
    },
  })
}

/** Fetch a larger sample for dashboard aggregates */
export function useJobsSample(limit = 200) {
  return useQuery({
    queryKey: queryKeys.jobs.sample,
    queryFn: () => jobsService.list({ limit, offset: 0 }),
    refetchInterval: 10_000,
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ScrapeJobCreate) => jobsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.jobs.all })
      toast.success('Job created and queued')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useCancelJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => jobsService.cancel(jobId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.jobs.all })
      toast.success('Job cancelled')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
