'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  destructive?: boolean
  onConfirm: () => Promise<void>
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  destructive = true,
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(next: boolean) {
    if (loading) return
    if (!next) setError(null)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-[8px]" style={{ fontFamily: 'var(--font-admin, inherit)' }}>
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-[var(--admin-text-primary)]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[var(--admin-text-muted)]">
            {description}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-[13px] text-[var(--admin-destructive)] px-1">{error}</p>
        )}

        <DialogFooter className="gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleOpenChange(false)}
            className="px-3 py-1.5 text-[14px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors duration-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="flex items-center gap-2 px-3 py-1.5 text-[14px] font-medium rounded-[4px] text-white transition-colors duration-100 disabled:opacity-70"
            style={{
              background: destructive ? 'var(--admin-destructive)' : 'var(--admin-primary)',
            }}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
