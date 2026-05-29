'use server'

import serverApi from '@/lib/api/server'
import type {
  AdminProduct,
  CreateProductDto,
  ProductVariant,
  CreateVariantDto,
} from '@/lib/api/admin-products'

export async function createProductAction(dto: CreateProductDto): Promise<AdminProduct> {
  const res = await serverApi.post<AdminProduct>('/admin/products', dto)
  return res.data
}

export async function createVariantAction(
  productId: string,
  dto: CreateVariantDto
): Promise<ProductVariant> {
  const res = await serverApi.post<ProductVariant>(`/admin/products/${productId}/variants`, dto)
  return res.data
}
