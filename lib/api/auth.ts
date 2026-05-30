import { cache } from 'react'
import clientApi, { setClientToken, clearClientToken } from './client'
import serverApi from './server'

export type UserRole = 'regular' | 'admin'

export type User = {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  googleLinked: boolean
  role: UserRole
  isActive: boolean
  createdAt: string
}

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { email: string; password: string }

export async function login(payload: LoginPayload): Promise<void> {
  const res = await clientApi.post<{ access_token: string }>('/auth/login', payload)
  setClientToken(res.data.access_token)
}

export async function register(payload: RegisterPayload): Promise<User> {
  const res = await clientApi.post<User>('/auth/register', payload)
  return res.data
}

export async function logout(): Promise<void> {
  clearClientToken()
  await clientApi.delete('/auth/logout')
}

export async function refreshTokens(): Promise<void> {
  await clientApi.post('/auth/refresh')
}

export const getMe = cache(async function getMe(): Promise<User> {
  const res = await serverApi.get<User>('/me')
  return res.data
})
