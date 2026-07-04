import clientApi from '../client'

export type AdminSubCategory = {
  id: string
  slug: string
  displayName: string
  categoryId: string
}

export type AdminCategory = {
  id: string
  slug: string
  displayName: string
  subCategories: AdminSubCategory[]
  createdAt: string
  updatedAt: string
}

export type PaginatedAdminCategories = {
  total: number
  page: number
  limit: number
  data: AdminCategory[]
}

export type CreateCategoryDto = {
  slug: string
  displayName: string
}

export type CreateSubCategoryDto = {
  slug: string
  displayName: string
}

export async function createCategory(dto: CreateCategoryDto): Promise<AdminCategory> {
  const res = await clientApi.post<AdminCategory>('/admin/categories', dto)
  return res.data
}

export async function updateCategory(id: string, dto: CreateCategoryDto): Promise<AdminCategory> {
  const res = await clientApi.patch<AdminCategory>(`/admin/categories/${id}`, dto)
  return res.data
}

export async function deleteCategory(id: string): Promise<void> {
  await clientApi.delete(`/admin/categories/${id}`)
}

export async function createSubcategory(categoryId: string, dto: CreateSubCategoryDto): Promise<AdminSubCategory> {
  const res = await clientApi.post<AdminSubCategory>(`/admin/categories/${categoryId}/subcategories`, dto)
  return res.data
}

export async function updateSubcategory(categoryId: string, subId: string, dto: CreateSubCategoryDto): Promise<AdminSubCategory> {
  const res = await clientApi.patch<AdminSubCategory>(`/admin/categories/${categoryId}/subcategories/${subId}`, dto)
  return res.data
}

export async function deleteSubcategory(categoryId: string, subId: string): Promise<void> {
  await clientApi.delete(`/admin/categories/${categoryId}/subcategories/${subId}`)
}
