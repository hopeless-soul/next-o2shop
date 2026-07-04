// `server-only` will throw a build error if this module is ever imported into
// a Client Component — this instance must stay server-side since it reads
// HttpOnly cookies directly.
import 'server-only'
import axios from 'axios'
import { cookies } from 'next/headers'
import { parseApiError } from './errors'
import { env } from '../env'

/**
 * Server-side Axios instance for use in RSC pages and Server Actions.
 * Reads the `access_token` HttpOnly cookie on each request and attaches it
 * as a Bearer token, since the server has no browser to send cookies for it.
 */
const serverApi = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the current request's access token before every outgoing call.
serverApi.interceptors.request.use(async (config) => {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

serverApi.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(parseApiError(err)),
)

export default serverApi
