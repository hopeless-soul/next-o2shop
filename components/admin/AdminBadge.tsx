import type { ReactNode } from 'react'

export type AdminBadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info'

interface AdminBadgeProps {
  variant: AdminBadgeVariant
  label: string
  className?: string
}

const styles: Record<AdminBadgeVariant, { bg: string; fg: string }> = {
  success: { bg: 'var(--admin-status-success-bg)', fg: 'var(--admin-status-success-fg)' },
  warning: { bg: 'var(--admin-status-warning-bg)', fg: 'var(--admin-status-warning-fg)' },
  error:   { bg: 'var(--admin-status-error-bg)',   fg: 'var(--admin-status-error-fg)'   },
  neutral: { bg: 'var(--admin-status-neutral-bg)', fg: 'var(--admin-status-neutral-fg)' },
  info:    { bg: 'var(--admin-status-info-bg)',    fg: 'var(--admin-status-info-fg)'    },
}

export default function AdminBadge({ variant, label, className }: AdminBadgeProps): ReactNode {
  const { bg, fg } = styles[variant]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium tracking-[0.03em] uppercase whitespace-nowrap${className ? ` ${className}` : ''}`}
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  )
}

export const fulfillmentVariant: Record<string, AdminBadgeVariant> = {
  unfulfilled:         'neutral',
  partially_fulfilled: 'warning',
  fulfilled:           'success',
  cancelled:           'error',
}

export const paymentVariant: Record<string, AdminBadgeVariant> = {
  pending:  'warning',
  paid:     'success',
  failed:   'error',
  refunded: 'neutral',
}

export const reviewVariant: Record<string, AdminBadgeVariant> = {
  pending:  'warning',
  approved: 'success',
  rejected: 'error',
}

export const roleVariant: Record<string, AdminBadgeVariant> = {
  admin:   'info',
  regular: 'neutral',
}
