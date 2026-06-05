import { useQuery } from '@tanstack/react-query'
import { workersMockService } from '@/services/mock/workers.mock'
import { queryKeys } from './query-keys'

export function useWorkers() {
  return useQuery({
    queryKey: queryKeys.workers.list,
    queryFn: () => workersMockService.list(),
    refetchInterval: 5_000,
  })
}

export function useWorker(id: string) {
  return useQuery({
    queryKey: queryKeys.workers.detail(id),
    queryFn: () => workersMockService.getById(id),
    enabled: Boolean(id),
    refetchInterval: 5_000,
  })
}
