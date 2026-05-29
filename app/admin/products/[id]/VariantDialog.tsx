'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import type { ProductVariant, CreateVariantDto } from '@/lib/api/admin-products'
import { createVariantAction, updateVariantAction } from './actions'

interface VariantDialogProps {
  productId: string
  variant?: ProductVariant
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (v: ProductVariant) => void
}

type FormState = {
  colorName: string
  colorValue: string
  colorHex: string
  size: string
  sku: string
  stock: string
  priceOverride: string
  compareAtPrice: string
  available: boolean
}

function emptyForm(): FormState {
  return {
    colorName: '',
    colorValue: '#000000',
    colorHex: '#000000',
    size: '',
    sku: '',
    stock: '',
    priceOverride: '',
    compareAtPrice: '',
    available: true,
  }
}

function fromVariant(v: ProductVariant): FormState {
  return {
    colorName: v.colorName,
    colorValue: v.colorValue,
    colorHex: v.colorValue,
    size: v.size,
    sku: v.sku ?? '',
    stock: v.stock != null ? String(v.stock) : '',
    priceOverride: v.priceOverride != null ? String(v.priceOverride) : '',
    compareAtPrice: v.compareAtPrice != null ? String(v.compareAtPrice) : '',
    available: v.available,
  }
}

// ────────────────────────────────────────────────────────────
// Form content — mounted fresh via key each time dialog opens
// ────────────────────────────────────────────────────────────

function VariantForm({
  productId,
  variant,
  onSaved,
  onClose,
}: {
  productId: string
  variant?: ProductVariant
  onSaved: (v: ProductVariant) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<FormState>(() =>
    variant ? fromVariant(variant) : emptyForm()
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleColorPickerChange(hex: string) {
    setForm(f => ({ ...f, colorValue: hex, colorHex: hex }))
  }

  function handleColorHexChange(raw: string) {
    const val = raw.startsWith('#') ? raw : `#${raw}`
    setForm(f => ({ ...f, colorHex: raw }))
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setForm(f => ({ ...f, colorValue: val, colorHex: val }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const dto: CreateVariantDto = {
        colorName: form.colorName,
        colorValue: form.colorValue,
        size: form.size,
        sku: form.sku || undefined,
        stock: form.stock !== '' ? Number(form.stock) : undefined,
        priceOverride: form.priceOverride !== '' ? Number(form.priceOverride) : undefined,
        compareAtPrice: form.compareAtPrice !== '' ? Number(form.compareAtPrice) : null,
      }
      const saved = variant
        ? await updateVariantAction(productId, variant.id, dto)
        : await createVariantAction(productId, dto)
      onSaved(saved)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'h-9 px-2.5 rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-ring)] focus:ring-2 focus:ring-[var(--admin-ring)]/30'
  const labelCls = 'text-[12px] font-medium text-[var(--admin-text-secondary)]'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* colorName */}
        <div className="col-span-2 flex flex-col gap-1">
          <label className={labelCls}>Color Name</label>
          <input
            required
            value={form.colorName}
            onChange={e => setForm(f => ({ ...f, colorName: e.target.value }))}
            placeholder="e.g. Navy Blue"
            className={inputCls}
          />
        </div>

        {/* colorValue */}
        <div className="col-span-2 flex flex-col gap-1">
          <label className={labelCls}>Color Value</label>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full border border-[var(--admin-border-input)] shrink-0"
              style={{ background: form.colorValue }}
            />
            <input
              type="color"
              value={form.colorValue}
              onChange={e => handleColorPickerChange(e.target.value)}
              className="w-9 h-9 cursor-pointer rounded-[4px] border border-[var(--admin-border-input)] p-0.5 bg-transparent"
            />
            <input
              value={form.colorHex}
              onChange={e => handleColorHexChange(e.target.value)}
              placeholder="#000000"
              className={`flex-1 ${inputCls} font-mono`}
            />
          </div>
        </div>

        {/* size */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Size</label>
          <input
            required
            value={form.size}
            onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
            placeholder="e.g. M"
            className={inputCls}
          />
        </div>

        {/* sku */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>SKU</label>
          <input
            value={form.sku}
            onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
            placeholder="e.g. BLU-M-001"
            className={inputCls}
          />
        </div>

        {/* stock */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Stock</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
            placeholder="0"
            className={inputCls}
          />
        </div>

        {/* priceOverride */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Price Override</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.priceOverride}
            onChange={e => setForm(f => ({ ...f, priceOverride: e.target.value }))}
            placeholder="Optional"
            className={inputCls}
          />
        </div>

        {/* compareAtPrice */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Compare At Price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.compareAtPrice}
            onChange={e => setForm(f => ({ ...f, compareAtPrice: e.target.value }))}
            placeholder="Optional"
            className={inputCls}
          />
        </div>

        {/* available */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Available</label>
          <div className="flex items-center h-9">
            <Switch
              checked={form.available}
              onCheckedChange={v => setForm(f => ({ ...f, available: v }))}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-[13px] text-[var(--admin-destructive)]">{error}</p>
      )}

      <DialogFooter className="gap-2 pt-2">
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="px-3 py-1.5 text-[14px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors duration-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-1.5 text-[14px] font-medium rounded-[4px] bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] transition-colors duration-100 disabled:opacity-70"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {variant ? 'Save Changes' : 'Add Variant'}
        </button>
      </DialogFooter>
    </form>
  )
}

// ────────────────────────────────────────────────────────────
// Dialog shell — passes key to VariantForm so it remounts fresh
// ────────────────────────────────────────────────────────────

export default function VariantDialog({
  productId,
  variant,
  open,
  onOpenChange,
  onSaved,
}: VariantDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg rounded-[8px]"
        style={{ fontFamily: 'var(--font-admin, inherit)' }}
      >
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-[var(--admin-text-primary)]">
            {variant ? 'Edit Variant' : 'Add Variant'}
          </DialogTitle>
        </DialogHeader>

        {open && (
          <VariantForm
            key={`${variant?.id ?? 'new'}`}
            productId={productId}
            variant={variant}
            onSaved={onSaved}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
