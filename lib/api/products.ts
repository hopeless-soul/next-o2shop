import serverApi from './server'
import type { PaginatedResponse, Product } from '../types'
import { env } from '../env'

export type ProductListParams = {
  page?: number
  limit?: number
  categorySlug?: string
  subCategorySlug?: string
  collectionSlug?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
  sortBy?: 'createdAt' | 'basePrice' | 'name'
  sortOrder?: 'asc' | 'desc'
}

const API_BASE = env.NEXT_PUBLIC_API_URL

function resolveUrl(url: string): string {
  return url.startsWith('/') ? `${API_BASE}${url}` : url
}

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    primaryPhoto: p.primaryPhoto
      ? { ...p.primaryPhoto, url: resolveUrl(p.primaryPhoto.url) }
      : undefined,
    photos: p.photos?.map(ph => ({ ...ph, url: resolveUrl(ph.url) })),
    variants: p.variants.map(v => ({
      ...v,
      featuredImage: v.featuredImage
        ? { ...v.featuredImage, url: resolveUrl(v.featuredImage.url) }
        : undefined,
    })),
    defaultVariant: p.defaultVariant
      ? {
        ...p.defaultVariant,
        featuredImage: p.defaultVariant.featuredImage
          ? { ...p.defaultVariant.featuredImage, url: resolveUrl(p.defaultVariant.featuredImage.url) }
          : undefined,
      }
      : undefined,
  }
}

export async function listProducts(
  params: ProductListParams = {},
): Promise<PaginatedResponse<Product>> {
  const res = await serverApi.get<PaginatedResponse<Product>>('/products', { params })
  return { ...res.data, data: res.data.data.map(normalizeProduct) }
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await serverApi.get<Product>(`/products/${slug}`)
  return normalizeProduct(res.data)
}
