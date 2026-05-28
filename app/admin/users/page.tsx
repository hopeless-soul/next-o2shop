import { revalidatePath } from 'next/cache'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminUsers, deleteAdminUser } from '@/lib/api/admin-users'
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
  const isDeleted = p.isDeleted === 'true'

  let result = { total: 0, page, limit, data: [] as Awaited<ReturnType<typeof getAdminUsers>>['data'] }
  try {
    result = await getAdminUsers({
      page,
      limit,
      search: search || undefined,
      role,
      isDeleted: isDeleted || undefined,
    })
  } catch {
    // render empty state on error
  }

  async function handleDelete(id: string) {
    'use server'
    await deleteAdminUser(id)
    revalidatePath('/admin/users')
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
        isDeleted={isDeleted}
        onDelete={handleDelete}
      />
    </>
  )
}
