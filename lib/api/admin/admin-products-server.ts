import serverApi from '../server'
import type {
  AdminProduct,
  PaginatedAdminProducts,
  GetAdminProductsParams,
} from './admin-products'

export async function getAdminProducts(
  params: GetAdminProductsParams = {}
): Promise<PaginatedAdminProducts> {
  const res = await serverApi.get<PaginatedAdminProducts>('/admin/products', { params })
  return res.data
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  const res = await serverApi.get<AdminProduct>(`/admin/products/${id}`)
  return res.data
}
