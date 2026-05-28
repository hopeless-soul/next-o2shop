import serverApi from './server'
import clientApi from './client'

export type AdminCollection = {
  id: string
  slug: string
  displayName: string
  description?: string
  bannerImageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type PaginatedAdminCollections = {
  total: number
  page: number
  limit: number
  data: AdminCollection[]
}

export type CreateCollectionDto = {
  slug: string
  displayName: string
  description?: string
  isActive?: boolean
}

export type UpdateCollectionDto = {
  slug?: string
  displayName?: string
  description?: string
  isActive?: boolean
}

export async function getAdminCollections(params: { page?: number; limit?: number } = {}): Promise<PaginatedAdminCollections> {
  const res = await serverApi.get<PaginatedAdminCollections>('/admin/collections', { params })
  return res.data
}

export async function getAdminCollection(id: string): Promise<AdminCollection> {
  const res = await serverApi.get<AdminCollection>(`/admin/collections/${id}`)
  return res.data
}

export async function createCollection(dto: CreateCollectionDto): Promise<AdminCollection> {
  const res = await clientApi.post<AdminCollection>('/admin/collections', dto)
  return res.data
}

export async function updateCollection(id: string, dto: UpdateCollectionDto): Promise<AdminCollection> {
  const res = await clientApi.patch<AdminCollection>(`/admin/collections/${id}`, dto)
  return res.data
}

export async function deleteCollection(id: string): Promise<void> {
  await clientApi.delete(`/admin/collections/${id}`)
}
