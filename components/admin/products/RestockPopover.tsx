'use client'

import { useState } from 'react'
import { Loader2, Minus, Plus } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

interface RestockPopoverProps {
  currentStock: number
  onSave: (stock: number) => Promise<void>
}

export default function RestockPopover({ currentStock, onSave }: RestockPopoverProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(String(currentStock))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setValue(String(currentStock))
      setError(null)
    }
  }

  function adjust(delta: number) {
    setValue(prev => String(Math.max(0, Number(prev || '0') + delta)))
  }

  async function handleSave() {
    const stock = Number(value)
    if (isNaN(stock) || stock < 0) {
      setError('Enter a valid stock number.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(stock)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger className="px-2.5 py-1 text-[12px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors">
        Restock
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[var(--admin-text-secondary)]">Stock</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjust(-1)}
              className="h-8 w-8 flex items-center justify-center rounded-[4px] border border-[var(--admin-border)] hover:bg-[var(--admin-border)] transition-colors"
            >
              <Minus className="size-3.5" />
            </button>
            <input
              type="number"
              min="0"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="flex-1 h-8 px-2 text-center rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-ring)]"
            />
            <button
              type="button"
              onClick={() => adjust(1)}
              className="h-8 w-8 flex items-center justify-center rounded-[4px] border border-[var(--admin-border)] hover:bg-[var(--admin-border)] transition-colors"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          {error && <p className="text-[12px] text-[var(--admin-destructive)]">{error}</p>}
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center justify-center gap-2 h-8 px-3 text-[13px] font-medium rounded-[4px] bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] disabled:opacity-70 transition-colors"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            Save
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
