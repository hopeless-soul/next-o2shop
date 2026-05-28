import clientApi from './client'

export type ProductPhoto = {
  id: string
  url: string
  altText?: string
  sortOrder: number
  width?: number | null
  height?: number | null
  aspectRatio?: number | null
  variantIds?: string[]
}

export type QuantityRule = {
  min: number
  max?: number | null
  increment: number
}

export type ProductVariant = {
  id: string
  productId: string
  colorName: string
  colorValue: string
  size: string
  sku: string
  stock: number
  available: boolean
  priceOverride?: number
  compareAtPrice?: number | null
  weight?: number | null
  inventoryPolicy: 'deny' | 'continue'
  quantityRule: QuantityRule
  barcode?: string | null
  featuredImageId?: string
  featuredImage?: ProductPhoto
}

export type DescriptionBlock =
  | { type: 'text'; content: string }
  | { type: 'points'; items: string[] }

export type ProductDescription = {
  blocks: DescriptionBlock[]
}

export type CategorySummary = { id: string; slug: string; displayName: string }
export type SubCategorySummary = { id: string; slug: string; displayName: string }
export type CollectionSummary = { id: string; slug: string; displayName: string }

export type AdminProduct = {
  id: string
  name: string
  displayName: string
  basePrice: number
  currency: string
  available: boolean
  priceMin: number
  priceMax: number
  priceVaries: boolean
  compareAtPrice?: number | null
  tags: string[]
  type?: string
  description: ProductDescription
  rating?: number | null
  createdAt: string
  updatedAt: string
  primaryPhoto?: ProductPhoto | null
  featuredPhoto?: ProductPhoto | null
  photos: ProductPhoto[]
  defaultVariant?: ProductVariant
  variants: ProductVariant[]
  collection?: CollectionSummary
  category: CategorySummary
  subCategory: SubCategorySummary
  isPublished: boolean
  deletedAt?: string | null
}

export type AdminProductListItem = Omit<AdminProduct, 'description'>

export type PaginatedAdminProducts = {
  total: number
  page: number
  limit: number
  data: AdminProductListItem[]
}

export type GetAdminProductsParams = {
  page?: number
  limit?: number
  collectionSlug?: string
  collectionId?: string
  categorySlug?: string
  categoryId?: string
  subCategorySlug?: string
  subCategoryId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'createdAt' | 'basePrice' | 'name'
  sortOrder?: 'asc' | 'desc'
  isPublished?: boolean
  includeDeleted?: boolean
}

export type CreateProductDto = {
  name: string
  displayName: string
  categoryId: string
  subCategoryId: string
  basePrice: number
  currency: string
  collectionId?: string
  compareAtPrice?: number | null
  description?: ProductDescription
  isPublished?: boolean
  tags?: string[]
  type?: string | null
}

export type UpdateProductDto = Partial<CreateProductDto> & {
  primaryPhotoId?: string | null
}

export type CreateVariantDto = {
  colorName: string
  colorValue: string
  size: string
  sku?: string
  stock?: number
  priceOverride?: number
  compareAtPrice?: number | null
  weight?: number
  inventoryPolicy?: 'deny' | 'continue'
  quantityRule?: QuantityRule
  barcode?: string | null
  featuredImageId?: string
}

export type UpdateVariantDto = Partial<CreateVariantDto>

export type UpdatePhotoDto = {
  altText?: string
  sortOrder?: number
}

export type ReorderPhotoItem = { id: string; sortOrder: number }

// --- Client-side mutations ---

export async function createProduct(dto: CreateProductDto): Promise<AdminProduct> {
  const res = await clientApi.post<AdminProduct>('/admin/products', dto)
  return res.data
}

export async function updateProduct(id: string, dto: UpdateProductDto): Promise<AdminProduct> {
  const res = await clientApi.patch<AdminProduct>(`/admin/products/${id}`, dto)
  return res.data
}

export async function deleteProduct(id: string): Promise<void> {
  await clientApi.delete(`/admin/products/${id}`)
}

export async function createVariant(productId: string, dto: CreateVariantDto): Promise<ProductVariant> {
  const res = await clientApi.post<ProductVariant>(`/admin/products/${productId}/variants`, dto)
  return res.data
}

export async function updateVariant(productId: string, variantId: string, dto: UpdateVariantDto): Promise<ProductVariant> {
  const res = await clientApi.patch<ProductVariant>(`/admin/products/${productId}/variants/${variantId}`, dto)
  return res.data
}

export async function deleteVariant(productId: string, variantId: string): Promise<void> {
  await clientApi.delete(`/admin/products/${productId}/variants/${variantId}`)
}

export async function setDefaultVariant(productId: string, variantId: string): Promise<AdminProduct> {
  const res = await clientApi.post<AdminProduct>(`/admin/products/${productId}/variants/${variantId}/default`)
  return res.data
}

export async function uploadProductPhoto(productId: string, file: File, altText?: string): Promise<ProductPhoto> {
  const form = new FormData()
  form.append('file', file)
  const res = await clientApi.post<ProductPhoto>(
    `/admin/products/${productId}/photos`,
    form,
    {
      params: altText ? { altText } : undefined,
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )
  return res.data
}

export async function deleteProductPhoto(productId: string, photoId: string): Promise<void> {
  await clientApi.delete(`/admin/products/${productId}/photos/${photoId}`)
}

export async function updatePhoto(productId: string, photoId: string, dto: UpdatePhotoDto): Promise<ProductPhoto> {
  const res = await clientApi.patch<ProductPhoto>(`/admin/products/${productId}/photos/${photoId}`, dto)
  return res.data
}

export async function reorderPhotos(productId: string, photos: ReorderPhotoItem[]): Promise<ProductPhoto[]> {
  const res = await clientApi.patch<ProductPhoto[]>(`/admin/products/${productId}/photos/reorder`, { photos })
  return res.data
}
