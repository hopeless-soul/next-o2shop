import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminProduct } from '@/lib/api/admin-products-server'
import { getAdminCategories } from '@/lib/api/admin-categories-server'
import { getAdminCollections } from '@/lib/api/admin-collections'
import { NotFoundError, AuthError } from '@/lib/api/errors'
import ProductEditClient from './ProductEditClient'

interface ProductEditPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params

  let product, categoriesResult, collectionsResult

  try {
    ;[product, categoriesResult, collectionsResult] = await Promise.all([
      getAdminProduct(id),
      getAdminCategories({ limit: 100 }),
      getAdminCollections({ limit: 100 }),
    ])
  } catch (err) {
    if (err instanceof NotFoundError) notFound()
    if (err instanceof AuthError) redirect('/admin')
    throw err
  }

  return (
    <>
      <AdminPageHeader
        title={product.displayName}
        breadcrumb={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: product.displayName },
        ]}
        action={
          <Link
            href="/admin/products"
            className="inline-flex items-center h-9 px-4 rounded-[4px] text-[13px] font-medium border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors duration-150"
          >
            ← Back to Products
          </Link>
        }
      />
      <ProductEditClient
        product={product}
        categories={categoriesResult.data}
        collections={collectionsResult.data}
      />
    </>
  )
}
