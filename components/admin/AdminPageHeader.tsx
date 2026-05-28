import Link from 'next/link'
import type { ReactNode } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AdminPageHeaderProps {
  title: string
  breadcrumb?: BreadcrumbItem[]
  action?: ReactNode
}

export default function AdminPageHeader({ title, breadcrumb, action }: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between pb-4 mb-6 border-b border-[var(--admin-border)]">
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
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  )
}
