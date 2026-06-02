import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export default function FormCard({ title, description, children, className, action }: FormCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-[var(--admin-border)] rounded-[6px] p-6',
        'shadow-[0_1px_3px_rgba(0,0,0,0.08),_0_1px_2px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[16px] font-semibold text-[var(--admin-text-primary)]">{title}</h2>
        {action}
      </div>
      {description && (
        <p className="text-[14px] text-[var(--admin-text-muted)] mb-4">{description}</p>
      )}
      {children}
    </div>
  )
}
