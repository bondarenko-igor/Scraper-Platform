import type { HealthResponse } from '@/types/api'
import { apiClient } from './api-client'

export const healthService = {
  async getHealth(): Promise<HealthResponse> {
    const { data } = await apiClient.get<HealthResponse>('/health')
    return data
  },
}
