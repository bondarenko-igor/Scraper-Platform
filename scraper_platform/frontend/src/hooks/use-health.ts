import { useQuery } from '@tanstack/react-query'
import { healthService } from '@/services/health.service'
import { queryKeys } from './query-keys'

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => healthService.getHealth(),
    refetchInterval: 30_000,
  })
}
