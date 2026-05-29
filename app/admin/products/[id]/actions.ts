'use server'

import serverApi from '@/lib/api/server'
import type {
  AdminProduct,
  ProductPhoto,
  ProductVariant,
  ReorderPhotoItem,
  UpdateProductDto,
  UpdatePhotoDto,
  CreateVariantDto,
  UpdateVariantDto,
} from '@/lib/api/admin-products'

export async function updateProductAction(id: string, dto: UpdateProductDto): Promise<AdminProduct> {
  const res = await serverApi.patch<AdminProduct>(`/admin/products/${id}`, dto)
  return res.data
}

export async function reorderPhotosAction(productId: string, photos: ReorderPhotoItem[]): Promise<ProductPhoto[]> {
  const res = await serverApi.patch<ProductPhoto[]>(`/admin/products/${productId}/photos/reorder`, { photos })
  return res.data
}

export async function deletePhotoAction(productId: string, photoId: string): Promise<void> {
  await serverApi.delete(`/admin/products/${productId}/photos/${photoId}`)
}

export async function updatePhotoAction(productId: string, photoId: string, dto: UpdatePhotoDto): Promise<ProductPhoto> {
  const res = await serverApi.patch<ProductPhoto>(`/admin/products/${productId}/photos/${photoId}`, dto)
  return res.data
}

export async function uploadPhotoAction(productId: string, formData: FormData): Promise<ProductPhoto> {
  const file = formData.get('file') as File
  const altText = formData.get('altText') as string | null

  const upload = new FormData()
  upload.append('file', file)

  const res = await serverApi.post<ProductPhoto>(
    `/admin/products/${productId}/photos`,
    upload,
    {
      params: altText ? { altText } : undefined,
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )
  return res.data
}

export async function deleteVariantAction(productId: string, variantId: string): Promise<void> {
  await serverApi.delete(`/admin/products/${productId}/variants/${variantId}`)
}

export async function setDefaultVariantAction(productId: string, variantId: string): Promise<AdminProduct> {
  const res = await serverApi.post<AdminProduct>(`/admin/products/${productId}/variants/${variantId}/default`)
  return res.data
}

export async function createVariantAction(productId: string, dto: CreateVariantDto): Promise<ProductVariant> {
  const res = await serverApi.post<ProductVariant>(`/admin/products/${productId}/variants`, dto)
  return res.data
}

export async function updateVariantAction(productId: string, variantId: string, dto: UpdateVariantDto): Promise<ProductVariant> {
  const res = await serverApi.patch<ProductVariant>(`/admin/products/${productId}/variants/${variantId}`, dto)
  return res.data
}

export async function uploadFeaturedPhotoAction(productId: string, formData: FormData): Promise<ProductPhoto> {
  const file = formData.get('file') as File
  const altText = formData.get('altText') as string | null

  const upload = new FormData()
  upload.append('file', file)

  const res = await serverApi.post<ProductPhoto>(
    `/admin/products/${productId}/featured-photo`,
    upload,
    {
      params: altText ? { altText } : undefined,
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )
  return res.data
}

export async function deleteFeaturedPhotoAction(productId: string): Promise<void> {
  await serverApi.delete(`/admin/products/${productId}/featured-photo`)
}

export async function deleteProductAction(id: string): Promise<void> {
  await serverApi.delete(`/admin/products/${id}`)
}
