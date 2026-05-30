import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getShippingMethods } from '@/lib/api/admin-shipping-server'
import ShippingContent from './ShippingContent'
import type { ShippingMethod } from '@/lib/api/admin-shipping'

interface ShippingPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function ShippingPage({ searchParams }: ShippingPageProps) {
  const p = await searchParams
  const page = Math.max(1, Number(p.page ?? '1'))
  const limit = Math.min(100, Math.max(1, Number(p.limit ?? '20')))

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
    <>
      <AdminPageHeader
        title="Shipping"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Shipping' }]}
      />
      <ShippingContent
        methods={result.data}
        total={result.total}
        page={page}
        limit={limit}
      />
    </>
  )
}
