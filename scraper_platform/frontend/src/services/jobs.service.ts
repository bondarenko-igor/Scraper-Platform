import type {
  JobListParams,
  JobListResponse,
  ScrapeJobCreate,
  ScrapeJobRead,
} from '@/types/api'
import { apiClient } from './api-client'

export const jobsService = {
  async list(params?: JobListParams): Promise<JobListResponse> {
    const { data } = await apiClient.get<JobListResponse>('/v1/jobs', { params })
    return data
  },

  async getById(jobId: string): Promise<ScrapeJobRead> {
    const { data } = await apiClient.get<ScrapeJobRead>(`/v1/jobs/${jobId}`)
    return data
  },

  async create(payload: ScrapeJobCreate): Promise<ScrapeJobRead> {
    const { data } = await apiClient.post<ScrapeJobRead>('/v1/jobs', payload)
    return data
  },

  /** DELETE /v1/jobs/{id} — cancels a job (docs/api.md) */
  async cancel(jobId: string): Promise<ScrapeJobRead> {
    const { data } = await apiClient.delete<ScrapeJobRead>(`/v1/jobs/${jobId}`)
    return data
  },
}
