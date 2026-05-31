import { cache } from 'react'
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

export const getMe = cache(async function getMe(): Promise<User> {
  const res = await serverApi.get<User>('/me')
  return res.data
})
