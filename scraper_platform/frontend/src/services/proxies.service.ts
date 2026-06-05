import type { ProxyCreate, ProxyRead } from '@/types/api'
import { apiClient } from './api-client'

export const proxiesService = {
  async list(): Promise<ProxyRead[]> {
    const { data } = await apiClient.get<ProxyRead[]>('/v1/proxies')
    return data
  },

  async create(payload: ProxyCreate): Promise<ProxyRead> {
    const { data } = await apiClient.post<ProxyRead>('/v1/proxies', payload)
    return data
  },
}
