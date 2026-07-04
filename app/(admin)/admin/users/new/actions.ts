'use server'

import serverApi from '@/lib/api/server'
import type { AdminUser, CreateAdminUserDto } from '@/lib/api/admin/admin-users'

export async function createUserAction(dto: CreateAdminUserDto): Promise<AdminUser> {
  const res = await serverApi.post<AdminUser>('/admin/users', dto)
  return res.data
}
