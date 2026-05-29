'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Button } from '@/components/admin/ui/button'
import { Plus } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AdminPageHeaderProps {
  title: string
  breadcrumb?: BreadcrumbItem[]
  action?: ReactNode
  actionLabel?: string
  actionHref?: string
}

export default function AdminPageHeader({ title, breadcrumb, action, actionLabel, actionHref }: AdminPageHeaderProps) {
  const router = useRouter()
  return (
    <div className="flex items-end justify-between pb-4 mb-6 border-b border-[var(--admin-border)]">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1 mb-1 text-[12px] text-[var(--admin-text-muted)]">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {item.href ? (
                  <Link href={item.href} className="hover:text-[var(--admin-text-secondary)] transition-colors duration-100">
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-[22px] font-semibold text-[var(--admin-text-primary)] leading-tight">
          {title}
        </h1>
      </div>
      {(action || (actionLabel && actionHref)) && (
        <div className="shrink-0 ml-4">
          {action ?? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => router.push(actionHref!)}
            >
              {actionLabel} <Plus className="size-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
