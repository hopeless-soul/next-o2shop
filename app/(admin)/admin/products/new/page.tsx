import { redirect } from 'next/navigation'
import { AuthError } from '@/lib/api/errors'
import { getAdminCategories } from '@/lib/api/admin/admin-categories-server'
import { getAdminCollections } from '@/lib/api/admin/admin-collections-server'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ProductCreateClient from './ProductCreateClient'

export default async function NewProductPage() {
  let categoriesResult, collectionsResult

  try {
    [categoriesResult, collectionsResult] = await Promise.all([
      getAdminCategories({ limit: 100 }),
      getAdminCollections({ limit: 100 }),
    ]);
  } catch (err) {
    if (err instanceof AuthError) redirect('/admin')
    throw err
  }

  return (
    <>
      <AdminPageHeader
        title="New Product"
        breadcrumb={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'New Product' },
        ]}
        
      />
      <ProductCreateClient
        categories={categoriesResult.data}
        collections={collectionsResult.data}
      />
    </>
  )
}
