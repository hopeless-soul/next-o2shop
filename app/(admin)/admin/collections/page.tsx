import { getAdminCollections } from '@/lib/api/admin/admin-collections-server'
import { parsePagination } from '@/lib/admin/parse-search-params'
import CollectionsPageClient from './CollectionsPageClient'

interface CollectionsPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const p = await searchParams
  const { page, limit } = parsePagination(p)

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
    <CollectionsPageClient
      collections={result.data}
      total={result.total}
      page={page}
      limit={limit}
    />
  )
}
