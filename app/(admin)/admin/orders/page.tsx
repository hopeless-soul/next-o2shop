import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminOrders } from '@/lib/api/admin-orders-server'
import type { AdminOrder, PaymentStatus, FulfillmentStatus } from '@/lib/api/admin-orders'
import { parsePagination } from '@/lib/admin/parse-search-params'
import OrdersContent from './OrdersContent'

interface OrdersPageProps {
  searchParams: Promise<Record<string, string>>
}

const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']
const FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  'unfulfilled',
  'fulfilled',
  'partially_fulfilled',
  'cancelled',
]

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const p = await searchParams
  const { page, limit } = parsePagination(p)
  const email = p.email ?? ''
  const paymentStatus = PAYMENT_STATUSES.includes(p.paymentStatus as PaymentStatus)
    ? (p.paymentStatus as PaymentStatus)
    : undefined
  const fulfillmentStatus = FULFILLMENT_STATUSES.includes(p.fulfillmentStatus as FulfillmentStatus)
    ? (p.fulfillmentStatus as FulfillmentStatus)
    : undefined

  let result: { total: number; page: number; limit: number; data: AdminOrder[] } = {
    total: 0,
    page,
    limit,
    data: [],
  }
  try {
    result = await getAdminOrders({
      page,
      limit,
      email: email || undefined,
      paymentStatus,
      fulfillmentStatus,
    })
  } catch {
    // render empty state on error
  }

  return (
    <>
      <AdminPageHeader
        title="Orders"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Orders' }]}
      />
      <OrdersContent
        orders={result.data}
        total={result.total}
        page={page}
        limit={limit}
        email={email}
        paymentStatus={paymentStatus ?? ''}
        fulfillmentStatus={fulfillmentStatus ?? ''}
      />
    </>
  )
}
