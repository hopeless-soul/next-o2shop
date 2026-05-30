import { getShippingMethods } from '@/lib/api/admin-shipping-server'
import { parsePagination } from '@/lib/admin/parse-search-params'
import ShippingPageClient from './ShippingPageClient'
import type { ShippingMethod } from '@/lib/api/admin-shipping'

interface ShippingPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function ShippingPage({ searchParams }: ShippingPageProps) {
  const p = await searchParams
  const { page, limit } = parsePagination(p)

  let result = {
    total: 0,
    page,
    limit,
    data: [] as ShippingMethod[],
  }
  try {
    result = await getShippingMethods({ page, limit })
  } catch {
    // render empty state on error
  }

  return (
    <ShippingPageClient
      methods={result.data}
      total={result.total}
      page={page}
      limit={limit}
    />
  )
}
