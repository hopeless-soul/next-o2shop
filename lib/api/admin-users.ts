import serverApi from './server'
import clientApi from './client'

export type AdminUser = {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  googleLinked: boolean
  role: 'regular' | 'admin'
  isActive: boolean
  createdAt: string
  tokenVersion: number
  deletedAt: string | null
  updatedAt: string
  version: number
}

export type PaginatedAdminUsers = {
  total: number
  page: number
  limit: number
  data: AdminUser[]
}

export type GetAdminUsersParams = {
  page?: number
  limit?: number
  search?: string
  role?: 'regular' | 'admin'
  isActive?: boolean
  isDeleted?: boolean
  userId?: string
  createdAfter?: string
  createdBefore?: string
}

export type CreateAdminUserDto = {
  email: string
  password: string
  displayName?: string
  avatarUrl?: string
  role?: 'regular' | 'admin'
  isActive?: boolean
}

export type UpdateAdminUserDto = {
  role?: 'regular' | 'admin'
  isActive?: boolean
  resetTokenVersion?: boolean
}

export async function getAdminUsers(params: GetAdminUsersParams = {}): Promise<PaginatedAdminUsers> {
  const res = await serverApi.get<PaginatedAdminUsers>('/admin/users', { params })
  return res.data
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  const res = await serverApi.get<AdminUser>(`/admin/users/${id}`)
  return res.data
}

export async function updateAdminUser(id: string, dto: UpdateAdminUserDto): Promise<AdminUser> {
  const res = await clientApi.patch<AdminUser>(`/admin/users/${id}`, dto)
  return res.data
}

export async function deleteAdminUser(id: string): Promise<void> {
  await clientApi.delete(`/admin/users/${id}`)
}
