import axios from 'axios'
import { parseApiError } from './errors'

const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

let isRefreshing = false
let pendingQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve()))
  pendingQueue = []
}

clientApi.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as typeof err.config & { _retry?: boolean }

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/auth/refresh') {
        window.location.href = '/login'
        return Promise.reject(parseApiError(err))
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: () => resolve(clientApi(originalRequest)),
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await clientApi.post('/auth/refresh')
        processQueue(null)
        return clientApi(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        window.location.href = '/login'
        return Promise.reject(parseApiError(refreshError))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(parseApiError(err))
  },
)

export default clientApi
