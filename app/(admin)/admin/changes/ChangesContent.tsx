'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useAdminUrlParams } from '@/hooks/useAdminUrlParams'
import { formatDateTime } from '@/lib/admin/formatters'
import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminBadge from '@/components/admin/AdminBadge'
import type { AdminBadgeVariant } from '@/components/admin/AdminBadge'
import type { AuditLogEntry, AuditAction } from '@/lib/api/admin/admin-audit-log'
import ChangeDrawer from './ChangeDrawer'

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

const actionVariant: Record<AuditAction, AdminBadgeVariant> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
}

interface ChangesContentProps {
  entries: AuditLogEntry[]
  total: number
  page: number
  limit: number
  entityType: string
  action: string
  dateFrom: string
  dateTo: string
}

export default function ChangesContent({
  entries,
  total,
  page,
  limit,
  entityType,
  action,
  dateFrom,
  dateTo,
}: ChangesContentProps) {
  const updateParams = useAdminUrlParams()
  const [selected, setSelected] = useState<AuditLogEntry | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function openDrawer(entry: AuditLogEntry) {
    setSelected(entry)
    setDrawerOpen(true)
  }

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      id: 'entity',
      header: 'Entity',
      size: 180,
      cell: ({ row }) => {
        const e = row.original
        return (
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-medium text-[var(--admin-text-primary)]">
              {e.entityType}
            </span>
            <span className="text-[12px] font-mono text-[var(--admin-text-muted)] truncate">
              {e.entityId.slice(0, 8)}…
            </span>
          </div>
        )
      },
    },
    {
      id: 'action',
      header: 'Action',
      size: 90,
      cell: ({ row }) => (
        <AdminBadge
          variant={actionVariant[row.original.action]}
          label={row.original.action}
        />
      ),
    },
    {
      id: 'field',
      header: 'Field',
      size: 130,
      accessorKey: 'field',
      meta: { truncate: true },
      cell: ({ row }) => {
        const f = row.original.field
        if (!f) return <span className="text-[var(--admin-text-muted)]">—</span>
        return (
          <span className="text-[13px] font-mono text-[var(--admin-text-secondary)]">
            {f}
          </span>
        )
      },
    },
    {
      id: 'change',
      header: 'Change',
      size: 260,
      cell: ({ row }) => {
        const e = row.original
        if (e.action !== 'UPDATE') {
          return <span className="text-[12px] text-[var(--admin-text-muted)]">—</span>
        }
        const from = formatValue(e.fromValue)
        const to = formatValue(e.toValue)
        return (
          <div className="flex items-center gap-1.5 min-w-0 text-[12px]">
            <span
              title={from}
              className="max-w-[90px] truncate font-mono px-1 rounded-[3px]"
              style={{
                color: 'var(--admin-status-error-fg)',
                background: 'var(--admin-status-error-bg)',
              }}
            >
              {from}
            </span>
            <span className="text-[var(--admin-text-muted)] shrink-0">→</span>
            <span
              title={to}
              className="max-w-[90px] truncate font-mono px-1 rounded-[3px]"
              style={{
                color: 'var(--admin-status-success-fg)',
                background: 'var(--admin-status-success-bg)',
              }}
            >
              {to}
            </span>
          </div>
        )
      },
    },
    {
      id: 'changedBy',
      header: 'By',
      size: 100,
      cell: ({ row }) => {
        const by = row.original.changedBy
        if (!by) return <span className="text-[var(--admin-text-muted)]">—</span>
        return (
          <span className="text-[13px] font-mono text-[var(--admin-text-secondary)]">
            {String(by).slice(0, 8)}…
          </span>
        )
      },
    },
    {
      id: 'changedAt',
      header: 'Date',
      size: 150,
      cell: ({ row }) => (
        <span className="text-[13px] text-[var(--admin-text-secondary)]">
          {formatDateTime(row.original.changedAt)}
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
            key: 'entityType',
            label: 'Filter by entity type…',
            type: 'text',
            leftIcon: Search,
            width: 3,
            value: entityType,
            onChange: (v) => updateParams({ entityType: v }),
          },
          {
            key: 'action',
            label: 'All Actions',
            value: action,
            onChange: (v) => updateParams({ action: v }),
            options: [
              { label: 'Create', value: 'CREATE' },
              { label: 'Update', value: 'UPDATE' },
              { label: 'Delete', value: 'DELETE' },
            ],
          },
          {
            key: 'dateFrom',
            type: 'date',
            label: 'From',
            value: dateFrom,
            onChange: (v) => updateParams({ dateFrom: v }),
          },
          {
            key: 'dateTo',
            type: 'date',
            label: 'To',
            value: dateTo,
            onChange: (v) => updateParams({ dateTo: v }),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={entries}
        total={total}
        page={page}
        limit={limit}
        onRowClick={openDrawer}
        emptyMessage="No changes found."
      />

      <AdminPagination
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => updateParams({ page: String(p) })}
        onLimitChange={(l) => updateParams({ limit: String(l), page: '1' })}
      />

      <ChangeDrawer
        entry={selected}
        open={drawerOpen}
        onOpenChange={(open) => { if (!open) setDrawerOpen(false) }}
      />
    </>
  )
}
