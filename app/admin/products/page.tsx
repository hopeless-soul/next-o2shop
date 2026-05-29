import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminProducts } from '@/lib/api/admin-products-server'
import ProductsContent from './ProductsContent'

interface ProductsPageProps {
  searchParams: Promise<Record<string, string>>
}

const SORT_BY_VALUES = ['createdAt', 'basePrice', 'name'] as const
const SORT_ORDER_VALUES = ['asc', 'desc'] as const

type SortBy = typeof SORT_BY_VALUES[number]
type SortOrder = typeof SORT_ORDER_VALUES[number]

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const p = await searchParams
  const page = Math.max(1, Number(p.page ?? '1'))
  const limit = Math.min(100, Math.max(1, Number(p.limit ?? '20')))
  const search = p.search ?? ''
  const categorySlug = p.categorySlug ?? ''
  const collectionSlug = p.collectionSlug ?? ''
  const isPublished =
    p.isPublished === 'true' ? true : p.isPublished === 'false' ? false : undefined
  const sortBy = (SORT_BY_VALUES as readonly string[]).includes(p.sortBy)
    ? (p.sortBy as SortBy)
    : undefined
  const sortOrder = (SORT_ORDER_VALUES as readonly string[]).includes(p.sortOrder)
    ? (p.sortOrder as SortOrder)
    : undefined

  let result = {
    total: 0,
    page,
    limit,
    data: [] as Awaited<ReturnType<typeof getAdminProducts>>['data'],
  }
  try {
    result = await getAdminProducts({
      page,
      limit,
      search: search || undefined,
      categorySlug: categorySlug || undefined,
      collectionSlug: collectionSlug || undefined,
      isPublished,
      sortBy,
      sortOrder,
    })
  } catch {
    // render empty state on error
  }

  console.log("Result: ")
  console.log(result)

  return (
    <>
      <AdminPageHeader
        title="Products"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Products' }]}
        actionLabel="Create Product"
        actionHref="/admin/products/new"
      />
      <ProductsContent
        products={result.data}
        total={result.total}
        page={page}
        limit={limit}
        search={search}
        categorySlug={categorySlug}
        collectionSlug={collectionSlug}
        isPublished={isPublished}
        sortBy={sortBy ?? ''}
        sortOrder={sortOrder ?? 'asc'}
      />
    </>
  )
}
