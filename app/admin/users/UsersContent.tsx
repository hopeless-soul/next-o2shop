'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { ColumnDef } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import DataTable from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminBadge, { roleVariant } from '@/components/admin/AdminBadge'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import type { AdminUser } from '@/lib/api/admin-users'

interface UsersContentProps {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  search: string
  role: string
  isActive?: boolean
  onDelete: (id: string) => Promise<void>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function UsersContent({
  users,
  total,
  page,
  limit,
  search,
  role,
  isActive,
  onDelete,
}: UsersContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    // Reset to page 1 when filters change (unless explicitly setting page)
    if (!('page' in updates)) params.set('page', '1')
    router.replace(`/admin/users?${params.toString()}`)
  }

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
      id: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const u = row.original
        if (u.deletedAt) {
          return <AdminBadge variant="error" label="Deleted" />
        }
        return (
          <AdminBadge
            variant={u.isActive ? 'success' : 'error'}
            label={u.isActive ? 'Active' : 'Inactive'}
          />
        )
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
    {
      id: 'actions',
      header: '',
      size: 60,
      minSize: 60,
      enableResizing: false,
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-1 justify-end">
            <button
              type="button"
              onClick={() => setDeleteTarget(u)}
              className="flex items-center gap-1 px-2.5 py-1 text-[13px] font-medium rounded-[4px] text-[var(--admin-destructive)] hover:bg-[var(--admin-status-error-bg)] transition-colors duration-100"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )
      },
    },
  ]

  const isActiveFilterValue =
    isActive === true ? 'true' : isActive === false ? 'false' : ''

  return (
    <>
      <FilterBar
        searchValue={search}
        onSearchChange={(v) => updateParams({ search: v })}
        filters={[
          {
            key: 'role',
            label: 'All Roles',
            value: role,
            onChange: (v) => updateParams({ role: v }),
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'Regular', value: 'regular' },
            ],
          },
          {
            key: 'isActive',
            label: 'All Status',
            value: isActiveFilterValue,
            onChange: (v) => updateParams({ isActive: v }),
            options: [
              { label: 'Active', value: 'true' },
              { label: 'Inactive', value: 'false' },
            ],
          },
        ]}
        onClear={() => updateParams({ search: '', role: '', isActive: '' })}
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete user"
        description={`Are you sure you want to delete ${deleteTarget?.email ?? 'this user'}? This action soft-deletes the account.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return
          await onDelete(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </>
  )
}
