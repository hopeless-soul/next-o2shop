import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAuditLog } from '@/lib/api/admin-audit-log-server'
import type { AuditAction, AuditLogEntry } from '@/lib/api/admin-audit-log'
import ChangesContent from './ChangesContent'

const ACTION_VALUES: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE']

interface ChangesPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function ChangesPage({ searchParams }: ChangesPageProps) {
  const p = await searchParams
  const page = Math.max(1, Number(p.page ?? '1'))
  const limit = Math.min(100, Math.max(1, Number(p.limit ?? '20')))
  const entityType = p.entityType ?? ''
  const action = ACTION_VALUES.includes(p.action as AuditAction)
    ? (p.action as AuditAction)
    : undefined
  const dateFrom = p.dateFrom ?? ''
  const dateTo = p.dateTo ?? ''

  let result: { total: number; page: number; limit: number; data: AuditLogEntry[] } = {
    total: 0,
    page,
    limit,
    data: [],
  }
  try {
    result = await getAuditLog({
      page,
      limit,
      entityType: entityType || undefined,
      action,
      dateFrom: dateFrom ? `${dateFrom}T00:00:00Z` : undefined,
      dateTo: dateTo ? `${dateTo}T23:59:59Z` : undefined,
    })
  } catch {
    // render empty state on error
  }

  return (
    <>
      <AdminPageHeader
        title="Changes History"
        breadcrumb={[{ label: 'Admin', href: '/admin' }, { label: 'Changes History' }]}
      />
      <ChangesContent
        entries={result.data}
        total={result.total}
        page={page}
        limit={limit}
        entityType={entityType}
        action={action ?? ''}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </>
  )
}
