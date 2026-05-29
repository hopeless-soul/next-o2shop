import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminCategories } from '@/lib/api/admin-categories-server'
import CategoriesContent from './CategoriesContent'

interface CategoriesPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const p = await searchParams
  const page = Math.max(1, Number(p.page ?? '1'))
  const limit = Math.min(100, Math.max(1, Number(p.limit ?? '20')))

  let result = {
    total: 0,
    page,
    limit,
    data: [] as Awaited<ReturnType<typeof getAdminCategories>>['data'],
  }
  try {
    result = await getAdminCategories({ page, limit })
  } catch {
    // render empty state on error
  }

  return (
    <>
      <AdminPageHeader
        title="Categories"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Categories' }]}
      />
      <CategoriesContent
        categories={result.data}
        total={result.total}
        page={page}
        limit={limit}
      />
    </>
  )
}
