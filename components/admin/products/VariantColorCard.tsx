import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import type { ColorGroup } from '@/lib/utils/variant-grouping'

interface VariantColorCardProps<T> {
  group: ColorGroup<T>
  onAddSize: () => void
  renderRow: (variant: T) => ReactNode
}

export default function VariantColorCard<T>({ group, onAddSize, renderRow }: VariantColorCardProps<T>) {
  return (
    <div className="bg-white border border-[var(--admin-border)] rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div
          className="w-4 h-4 rounded-full shrink-0 border border-[var(--admin-border)]"
          style={{ background: group.colorValue }}
        />
        <div className="flex-1 min-w-0">
          <span className="text-[14px] font-medium text-[var(--admin-text-primary)]">{group.colorName}</span>
          <span className="ml-2 text-[12px] text-[var(--admin-text-muted)]">
            {group.variants.length} size{group.variants.length === 1 ? '' : 's'} · {group.totalStock} in stock
          </span>
        </div>
        <button
          type="button"
          onClick={onAddSize}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors"
        >
          <Plus className="size-3.5" />
          Add Size
        </button>
      </div>
      <div>{group.variants.map(v => renderRow(v))}</div>
    </div>
  )
}
