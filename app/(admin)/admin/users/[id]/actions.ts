'use server'

import serverApi from '@/lib/api/server'
import type { AdminUser, UpdateAdminUserDto } from '@/lib/api/admin-users'

export async function updateUserAction(id: string, dto: UpdateAdminUserDto): Promise<AdminUser> {
  const res = await serverApi.patch<AdminUser>(`/admin/users/${id}`, dto)
  return res.data
}

export async function deleteUserAction(id: string): Promise<void> {
  await serverApi.delete(`/admin/users/${id}`)
}
