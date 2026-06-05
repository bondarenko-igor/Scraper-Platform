import axios, { type AxiosError } from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ detail?: string | { msg?: string }[] }>) => {
    const detail = error.response?.data?.detail
    let message = error.message
    if (typeof detail === 'string') {
      message = detail
    } else if (Array.isArray(detail)) {
      message = detail.map((d) => d.msg ?? JSON.stringify(d)).join(', ')
    }
    return Promise.reject(new Error(message))
  },
)
