import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminCollections } from '@/lib/api/admin-collections-server'
import CollectionsContent from './CollectionsContent'

interface CollectionsPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const p = await searchParams
  const page = Math.max(1, Number(p.page ?? '1'))
  const limit = Math.min(100, Math.max(1, Number(p.limit ?? '20')))

  let result = {
    total: 0,
    page,
    limit,
    data: [] as Awaited<ReturnType<typeof getAdminCollections>>['data'],
  }
  try {
    result = await getAdminCollections({ page, limit })
  } catch {
    // render empty state on error
  }

  return (
    <>
      <AdminPageHeader
        title="Collections"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Collections' }]}
      />
      <CollectionsContent
        collections={result.data}
        total={result.total}
        page={page}
        limit={limit}
      />
    </>
  )
}
