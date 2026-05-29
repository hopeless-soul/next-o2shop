import axios from 'axios'
import { parseApiError } from './errors'

// Proxy through Next.js (/api/* → NEXT_PUBLIC_API_URL/*) so login cookies are
// set on localhost:3000 and the middleware/serverApi can read them via next/headers.
const clientApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

const TOKEN_KEY = 'o2shop_access_token'

export function getClientToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setClientToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearClientToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

// Attach the stored access_token as Authorization: Bearer on every request.
// The backend JwtStrategy accepts both cookie and Bearer header; Bearer is reliable
// because it doesn't depend on cookie-parser being installed in NestJS.
clientApi.interceptors.request.use((config) => {
  const token = getClientToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 clear the token and redirect to login — no refresh attempt.
clientApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearClientToken()
      window.location.href = '/login'
    }
    return Promise.reject(parseApiError(err))
  },
)

export default clientApi
