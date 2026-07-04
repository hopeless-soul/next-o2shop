import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminUsers } from '@/lib/api/admin/admin-users-server'
import { parsePagination } from '@/lib/admin/parse-search-params'
import UsersContent from './UsersContent'

interface UsersPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const p = await searchParams
  const { page, limit } = parsePagination(p)
  const search = p.search ?? ''
  const role = (p.role === 'regular' || p.role === 'admin') ? p.role : undefined
  const isActive = p.isActive === 'true' ? true : p.isActive === 'false' ? false : undefined
  const isDeleted = p.isDeleted === 'true' ? true : p.isDeleted === 'false' ? false : undefined
  const createdAfter = p.createdAfter ?? ''
  const createdBefore = p.createdBefore ?? ''

  let result = { total: 0, page, limit, data: [] as Awaited<ReturnType<typeof getAdminUsers>>['data'] }
  try {
    result = await getAdminUsers({
      page,
      limit,
      search: search || undefined,
      role,
      isActive,
      isDeleted,
      createdAfter: createdAfter ? `${createdAfter}T00:00:00.000Z` : undefined,
      createdBefore: createdBefore ? `${createdBefore}T23:59:59.999Z` : undefined,
    })
  } catch {
    // render empty state on error
  }

  return (
    <>
      <AdminPageHeader
        title="Users"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]}
        actionLabel="Create User"
        actionHref="/admin/users/new"
      />
      <UsersContent
        users={result.data}
        total={result.total}
        page={page}
        limit={limit}
        search={search}
        role={role ?? ''}
        isActive={isActive}
        isDeleted={isDeleted}
        createdAfter={createdAfter}
        createdBefore={createdBefore}
      />
    </>
  )
}
