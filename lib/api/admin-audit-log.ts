export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

export type AuditLogEntry = {
  id: string
  entityType: string
  entityId: string
  action: AuditAction
  field?: string | null
  fromValue?: unknown
  toValue?: unknown
  changedBy?: string | null
  changedAt: string
}

export type PaginatedAuditLog = {
  total: number
  page: number
  limit: number
  data: AuditLogEntry[]
}

export type GetAuditLogParams = {
  page?: number
  limit?: number
  entityType?: string
  entityId?: string
  changedBy?: string
  action?: AuditAction
  field?: string
  dateFrom?: string
  dateTo?: string
}
