import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { parseApiError } from './errors'

// Proxy through Next.js (/api/* → NEXT_PUBLIC_API_URL/*) so cookies are set on
// the same origin and the middleware/serverApi can read them via next/headers.
const clientApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Cookies are sent automatically — no manual Bearer header needed.

let isRefreshing = false
let waitQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = []

clientApi.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retried?: boolean }

    if (err.response?.status !== 401 || original._retried) {
      return Promise.reject(parseApiError(err))
    }

    original._retried = true

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        waitQueue.push({ resolve, reject })
      }).then(() => clientApi(original))
    }

    isRefreshing = true
    try {
      // Call /auth/refresh directly (not /api/auth/refresh) so the browser
      // sends the refresh_token cookie which has Path=/auth/refresh.
      await axios.post('/auth/refresh', null, { withCredentials: true })
      isRefreshing = false
      waitQueue.forEach((q) => q.resolve())
      waitQueue = []
      return clientApi(original)
    } catch {
      isRefreshing = false
      waitQueue.forEach((q) => q.reject(new Error('session expired')))
      waitQueue = []
      if (typeof window !== 'undefined') window.location.href = '/login'
      return Promise.reject(parseApiError(err))
    }
  },
)

export default clientApi
