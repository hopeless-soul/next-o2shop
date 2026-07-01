import 'client-only'
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { parseApiError, AuthError } from './errors'

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

    // Skip refresh for non-401s, already-retried requests, login calls
    // (login 401 = wrong credentials, not expired session), logout calls,
    // and refresh calls (prevents retry loop if the call ever moves to clientApi).
    if (
      !original ||
      err.response?.status !== 401 ||
      original._retried ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/logout') ||
      original.url === '/auth/refresh'
    ) {
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
      // Call /auth/refresh (not /api/auth/refresh): the backend sets
      // refresh_token with Path=/auth/refresh so the browser only sends it
      // for this exact path. The Route Handler at app/auth/refresh/route.ts
      // reads the cookie and proxies to the backend.
      await axios.post('/auth/refresh', null, { withCredentials: true })
      isRefreshing = false
      waitQueue.forEach((q) => q.resolve())
      waitQueue = []
      return clientApi(original)
    } catch (refreshErr) {
      console.error('[clientApi] token refresh failed:', refreshErr)
      isRefreshing = false
      waitQueue.forEach((q) =>
        q.reject(new AuthError('Session expired', ['Session expired'], 'Unauthorized')),
      )
      waitQueue = []
      // `import 'client-only'` guarantees this module never runs on the server,
      // so the else branch below is unreachable — kept for belt-and-suspenders clarity.
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
        // Stays pending intentionally — suppresses any rejection handler during page navigation.
        return new Promise(() => {})
      }
      return Promise.reject(new AuthError('Session expired', ['Session expired'], 'Unauthorized'))
    }
  },
)

export default clientApi
