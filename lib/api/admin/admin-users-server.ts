import serverApi from '../server'
import type { AdminUser, PaginatedAdminUsers, GetAdminUsersParams } from './admin-users'

export async function getAdminUsers(params: GetAdminUsersParams = {}): Promise<PaginatedAdminUsers> {
  const res = await serverApi.get<PaginatedAdminUsers>('/admin/users', { params })
  return res.data
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  const res = await serverApi.get<AdminUser>(`/admin/users/${id}`)
  return res.data
}
