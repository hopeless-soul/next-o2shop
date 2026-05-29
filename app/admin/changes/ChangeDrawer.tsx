'use client'

import Link from 'next/link'
import { Drawer } from '@base-ui/react/drawer'
import { X } from 'lucide-react'
import AdminBadge from '@/components/admin/AdminBadge'
import type { AdminBadgeVariant } from '@/components/admin/AdminBadge'
import type { AuditLogEntry, AuditAction } from '@/lib/api/admin-audit-log'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'object') return JSON.stringify(v, null, 2)
  return String(v)
}

const actionVariant: Record<AuditAction, AdminBadgeVariant> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
}

interface ChangeDrawerProps {
  entry: AuditLogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ChangeDrawer({ entry, open, onOpenChange }: ChangeDrawerProps) {
  if (!entry) return null

  const entityLink = getEntityLink(entry.entityType, entry.entityId)

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      swipeDirection="right"
      modal
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 bg-black/20 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Drawer.Popup
          className="fixed inset-y-0 right-0 z-50 flex flex-col w-[480px] max-w-full border-l border-[var(--admin-border)] shadow-xl overflow-hidden duration-200 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right"
          style={{
            background: 'var(--admin-surface)',
            fontFamily: 'var(--font-admin, inherit)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--admin-border)] shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-[16px] font-semibold text-[var(--admin-text-primary)]">
                Change Detail
              </h2>
              <AdminBadge variant={actionVariant[entry.action]} label={entry.action} />
            </div>
            <Drawer.Close
              render={
                <button
                  type="button"
                  className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors duration-100 rounded-[4px] p-0.5"
                  aria-label="Close"
                />
              }
            >
              <X className="size-5" />
            </Drawer.Close>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

            {/* Entity */}
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1.5">
                Entity
              </p>
              <p className="text-[14px] font-medium text-[var(--admin-text-primary)]">
                {entry.entityType}
              </p>
              {entityLink ? (
                <Link
                  href={entityLink}
                  className="text-[12px] font-mono text-[var(--admin-primary)] hover:underline break-all"
                >
                  {entry.entityId}
                </Link>
              ) : (
                <p className="text-[13px] text-[var(--admin-text-muted)] break-all font-mono">
                  {entry.entityId}
                </p>
              )}
            </section>

            {/* Field */}
            {entry.field && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1.5">
                  Field
                </p>
                <p className="text-[14px] font-medium text-[var(--admin-text-primary)] font-mono">
                  {String(entry.field)}
                </p>
              </section>
            )}

            {/* Value change — UPDATE only */}
            {entry.action === 'UPDATE' && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1.5">
                  Change
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1">
                      Before
                    </p>
                    <textarea
                      readOnly
                      value={formatValue(entry.fromValue)}
                      rows={3}
                      className="w-full resize-none rounded-[4px] border border-[var(--admin-border)] px-3 py-2.5 text-[13px] leading-relaxed focus:outline-none cursor-default select-text font-mono"
                      style={{
                        color: 'var(--admin-status-error-fg)',
                        background: 'var(--admin-status-error-bg)',
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1">
                      After
                    </p>
                    <textarea
                      readOnly
                      value={formatValue(entry.toValue)}
                      rows={3}
                      className="w-full resize-none rounded-[4px] border border-[var(--admin-border)] px-3 py-2.5 text-[13px] leading-relaxed focus:outline-none cursor-default select-text font-mono"
                      style={{
                        color: 'var(--admin-status-success-fg)',
                        background: 'var(--admin-status-success-bg)',
                      }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Snapshot — CREATE */}
            {entry.action === 'CREATE' && entry.toValue != null && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1.5">
                  Created value
                </p>
                <textarea
                  readOnly
                  value={formatValue(entry.toValue)}
                  rows={5}
                  className="w-full resize-none rounded-[4px] border border-[var(--admin-border)] px-3 py-2.5 text-[13px] leading-relaxed focus:outline-none cursor-default select-text font-mono"
                  style={{
                    color: 'var(--admin-status-success-fg)',
                    background: 'var(--admin-status-success-bg)',
                  }}
                />
              </section>
            )}

            {/* Snapshot — DELETE */}
            {entry.action === 'DELETE' && entry.fromValue != null && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1.5">
                  Deleted value
                </p>
                <textarea
                  readOnly
                  value={formatValue(entry.fromValue)}
                  rows={5}
                  className="w-full resize-none rounded-[4px] border border-[var(--admin-border)] px-3 py-2.5 text-[13px] leading-relaxed focus:outline-none cursor-default select-text font-mono"
                  style={{
                    color: 'var(--admin-status-error-fg)',
                    background: 'var(--admin-status-error-bg)',
                  }}
                />
              </section>
            )}

            {/* Changed by + timestamp */}
            <section className="flex gap-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1">
                  Changed by
                </p>
                {entry.changedBy ? (
                  <Link
                    href={`/admin/users/${entry.changedBy}`}
                    className="text-[12px] font-mono text-[var(--admin-primary)] hover:underline break-all"
                  >
                    {String(entry.changedBy).slice(0, 8)}…
                  </Link>
                ) : (
                  <p className="text-[13px] text-[var(--admin-text-secondary)]">System</p>
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1">
                  Changed at
                </p>
                <p className="text-[13px] text-[var(--admin-text-secondary)]">
                  {formatDate(entry.changedAt)}
                </p>
              </div>
            </section>

            {/* Log ID */}
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-text-muted)] mb-1">
                Log ID
              </p>
              <p className="text-[12px] font-mono text-[var(--admin-text-muted)] break-all">
                {entry.id}
              </p>
            </section>

          </div>
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function getEntityLink(entityType: string, entityId: string): string | null {
  const type = entityType.toLowerCase()
  if (type === 'product') return `/admin/products/${entityId}`
  if (type === 'order') return `/admin/orders/${entityId}`
  if (type === 'user') return `/admin/users/${entityId}`
  if (type === 'category') return `/admin/categories`
  if (type === 'review') return `/admin/reviews`
  return null
}
