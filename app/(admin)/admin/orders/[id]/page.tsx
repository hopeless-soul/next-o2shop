import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminOrder } from '@/lib/api/admin-orders-server'
import { NotFoundError, AuthError } from '@/lib/api/errors'
import OrderDetailClient from './OrderDetailClient'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params

  let order
  try {
    order = await getAdminOrder(id)
  } catch (err) {
    if (err instanceof NotFoundError) notFound()
    if (err instanceof AuthError) redirect('/admin')
    throw err
  }

  return (
    <>
      <AdminPageHeader
        title={order.orderNumber}
        breadcrumb={[
          { label: 'Admin', href: '/admin' },
          { label: 'Orders', href: '/admin/orders' },
          { label: order.orderNumber },
        ]}
        action={
          <Link
            href="/admin/orders"
            className="inline-flex items-center h-9 px-4 rounded-[4px] text-[13px] font-medium border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors duration-150"
          >
            ← Back to Orders
          </Link>
        }
      />
      <OrderDetailClient order={order} />
    </>
  )
}
