import { notFound, redirect } from 'next/navigation'
import { NotFoundError, AuthError } from '@/lib/api/errors'
import { getAdminUser } from '@/lib/api/admin/admin-users-server'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import UserEditClient from './UserEditClient'

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let user
  try {
    user = await getAdminUser(id)
  } catch (err) {
    if (err instanceof NotFoundError) notFound()
    if (err instanceof AuthError) redirect('/admin')
    throw err
  }

  const title = user.displayName ?? user.email

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={title}
        breadcrumb={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: title },
        ]}
        actionLabel="Back to Users"
        actionHref="/admin/users"
      />
      <UserEditClient user={user} />
    </div>
  )
}
