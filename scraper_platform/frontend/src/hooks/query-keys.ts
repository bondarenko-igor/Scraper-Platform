import type { JobListParams } from '@/types/api'

export const queryKeys = {
  health: ['health'] as const,
  jobs: {
    all: ['jobs'] as const,
    list: (params?: JobListParams) => ['jobs', 'list', params] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
    sample: ['jobs', 'sample'] as const,
  },
  proxies: {
    all: ['proxies'] as const,
    list: ['proxies', 'list'] as const,
  },
  workers: {
    all: ['workers'] as const,
    list: ['workers', 'list'] as const,
    detail: (id: string) => ['workers', 'detail', id] as const,
  },
}
