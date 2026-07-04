'use client'

import { Search, UserLock, Eye, Trash} from 'lucide-react'
import { useAdminUrlParams } from '@/hooks/useAdminUrlParams'
import { formatDate } from '@/lib/admin/formatters'
import Link from 'next/link'
import Image from 'next/image'
import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminBadge, { roleVariant } from '@/components/admin/AdminBadge'
import type { AdminUser } from '@/lib/api/admin/admin-users'

interface UsersContentProps {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  search: string
  role: string
  isActive?: boolean
  isDeleted?: boolean
  createdAfter: string
  createdBefore: string
}

export default function UsersContent({
  users,
  total,
  page,
  limit,
  search,
  role,
  isActive,
  isDeleted,
  createdAfter,
  createdBefore,
}: UsersContentProps) {
  const updateParams = useAdminUrlParams()

  const columns: ColumnDef<AdminUser>[] = [
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => {
        const u = row.original
        return (
          <Link
            href={`/admin/users/${u.id}`}
            className="flex items-center gap-2 min-w-0 group"
          >
            <div className="size-7 rounded-full overflow-hidden shrink-0 bg-[var(--admin-border)] flex items-center justify-center">
              {u.avatarUrl ? (
                <Image src={u.avatarUrl} alt={u.email} width={28} height={28} className="object-cover" />
              ) : (
                <span className="text-[10px] font-medium text-[var(--admin-text-secondary)] uppercase">
                  {u.email.slice(0, 2)}
                </span>
              )}
            </div>
            <span className="truncate max-w-[200px] text-[14px] group-hover:underline">
              {u.email}
            </span>
          </Link>
        )
      },
    },
    {
      id: 'displayName',
      header: 'Display Name',
      accessorKey: 'displayName',
      meta: { truncate: true },
      cell: ({ row }) => (
        <span className="text-[14px] text-[var(--admin-text-secondary)]">
          {row.original.displayName ?? <span className="text-[var(--admin-text-muted)]">—</span>}
        </span>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <AdminBadge
          variant={roleVariant[row.original.role] ?? 'neutral'}
          label={row.original.role}
        />
      ),
    },
    {
      id: 'isDeleted',
      header: 'Status',
      cell: ({ row }) => {
        const u = row.original
        if (u.deletedAt) return <AdminBadge variant="error" label="Deleted" />
        if (!u.isActive) return <AdminBadge variant="warning" label="Inactive" />
        return <AdminBadge variant="success" label="Active" />
      },
    },
    {
      id: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-[14px] text-[var(--admin-text-secondary)]">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ]

  return (
    <>
      <FilterBar
        onApply={(fv) => updateParams({ ...fv })}
        filters={[
          {
            key: 'search',
            label: 'Search users…',
            type: 'text',
            leftIcon: Search,
            width: 2,
            value: search,
            onChange: (v) => updateParams({ search: v }),
          },
          {
            key: 'role',
            label: 'All Roles',
            leftIcon: UserLock,
            width: 1, 
            value: role,
            onChange: (v) => updateParams({ role: v }),
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'Regular', value: 'regular' },
            ],
          },
          {
            key: 'isActive',
            label: 'All Active',
            leftIcon: Eye,
            width: 2,
            value: isActive === true ? 'true' : isActive === false ? 'false' : '',
            onChange: (v) => updateParams({ isActive: v }),
            options: [
              { label: 'Active', value: 'true' },
              { label: 'Inactive', value: 'false' },
            ],
          },
          {
            key: 'isDeleted',
            label: 'All Status',
            leftIcon: Trash,
            width: 2,
            value: isDeleted === true ? 'true' : isDeleted === false ? 'false' : '',
            onChange: (v) => updateParams({ isDeleted: v }),
            options: [
              { label: 'Non deleted', value: 'false' },
              { label: 'Deleted', value: 'true' },
            ],
          },
          {
            key: 'createdAfter',
            label: 'From',
            type: 'date',
            width: 1,
            value: createdAfter,
            onChange: (v) => updateParams({ createdAfter: v }),
          },
          {
            key: 'createdBefore',
            label: 'To',
            type: 'date',
            width: 1,
            value: createdBefore,
            onChange: (v) => updateParams({ createdBefore: v }),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={users}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => updateParams({ page: String(p) })}
        onLimitChange={(l) => updateParams({ limit: String(l), page: '1' })}
        emptyMessage="No users found."
      />

      <AdminPagination
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => updateParams({ page: String(p) })}
        onLimitChange={(l) => updateParams({ limit: String(l), page: '1' })}
      />
    </>
  )
}
