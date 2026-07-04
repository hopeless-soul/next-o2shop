// `client-only` will throw a build error if this module is ever imported into
// a Server Component — this instance must stay browser-side since it relies
// on the browser automatically attaching cookies to same-origin requests.import 'client-only'
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { parseApiError, AuthError } from './errors'

// Proxies through Next.js (/api/* → NEXT_PUBLIC_API_URL/*) so cookies stay same-origin.
const clientApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Coalesces concurrent 401s into a single /auth/refresh call; others wait in waitQueue.
let isRefreshing = false
let waitQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = []

/**
 * Response interceptor: 401 refresh-and-retry pipeline.
 * 1. Success responses pass through untouched.
 * 2. On error: non-401s, and 401s from login/logout/refresh themselves, are
 *    normalized via parseApiError and rejected immediately (no refresh attempt).
 * 3. Otherwise mark the request `_retried` (so it's only ever retried once) and
 *    either queue it (if a refresh is already in flight) or trigger the refresh.
 * 4. On refresh success: flush the queue, then retry the original request.
 * 5. On refresh failure: reject the queue, redirect to /login, and reject this request.
 *
 * Status codes:
 * - 401 Unauthorized: the access_token cookie is missing/expired. Triggers the
 *   refresh flow below (except on /auth/login, /auth/logout, /auth/refresh — see step 2).
 * - 403 Forbidden: caller is authenticated but not allowed to access the resource.
 *   Left untouched here; normalized to ForbiddenError by parseApiError instead.
 * - 404 Not Found: normalized to NotFoundError by parseApiError; not handled here.
 * - 422/400: validation errors; normalized to ValidationError by parseApiError; not handled here.
 */
clientApi.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retried?: boolean }

    // login 401 = wrong credentials, not expired session; skip refresh for auth endpoints too.
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
      // Hits /auth/refresh directly (not /api/auth/refresh) — the refresh_token
      // cookie is scoped to Path=/auth/refresh.
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
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
        // Stays pending so no rejection handler fires during navigation.
        return new Promise(() => {})
      }
      return Promise.reject(new AuthError('Session expired', ['Session expired'], 'Unauthorized'))
    }
  },
)

export default clientApi
