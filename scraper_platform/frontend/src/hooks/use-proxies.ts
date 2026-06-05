import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { proxiesService } from '@/services/proxies.service'
import type { ProxyCreate } from '@/types/api'
import { queryKeys } from './query-keys'

export function useProxies() {
  return useQuery({
    queryKey: queryKeys.proxies.list,
    queryFn: () => proxiesService.list(),
    refetchInterval: 15_000,
  })
}

export function useCreateProxy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProxyCreate) => proxiesService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.proxies.all })
      toast.success('Proxy registered')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
