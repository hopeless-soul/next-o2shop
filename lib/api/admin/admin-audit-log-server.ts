import serverApi from '../server'
import type { PaginatedAuditLog, GetAuditLogParams } from '../admin-audit-log'

export async function getAuditLog(
  params: GetAuditLogParams = {}
): Promise<PaginatedAuditLog> {
  const res = await serverApi.get<PaginatedAuditLog>('/admin/audit-log', { params })
  return res.data
}
