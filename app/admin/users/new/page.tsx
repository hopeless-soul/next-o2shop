import AdminPageHeader from '@/components/admin/AdminPageHeader'
import CreateUserClient from './CreateUserClient'

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New User"
        breadcrumb={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: 'New User' },
        ]}
        actionLabel="Back to Users"
        actionHref="/admin/users"
      />
      <CreateUserClient />
    </div>
  )
}
