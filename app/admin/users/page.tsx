import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminUsers } from '@/lib/api/admin-users'
import UsersContent from './UsersContent'

interface UsersPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const p = await searchParams
  const page = Math.max(1, Number(p.page ?? '1'))
  const limit = Math.min(100, Math.max(1, Number(p.limit ?? '20')))
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
