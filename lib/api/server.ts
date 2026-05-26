import 'server-only'
import axios from 'axios'
import { cookies } from 'next/headers'
import { parseApiError } from './errors'

const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

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
