// components/admin/products/VariantDialog.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { CreateVariantDto } from '@/lib/api/admin/admin-products'
import { generateSkuPreview } from '@/lib/utils/sku'

const SIZE_PRESETS = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

// The native color-input's eyedropper hands focus to an OS-level surface, which fires
// `blur` on the input immediately (before the eyedropper is even used) — so `blur` alone
// re-enables the dialog's focus trap mid-interaction and the trap never lets go afterward.
// Instead, track activation explicitly and only deactivate on a real outside click.
function useColorPickerTrapGuard(onActiveChange: (active: boolean) => void) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!active) return
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Defer re-enabling the trap: right after the eyedropper closes, window focus is
        // still transitioning back from the OS-level surface. Reclaiming focus synchronously
        // here races that handoff and makes Windows beep instead of focusing anything.
        setTimeout(() => {
          setActive(false)
          onActiveChange(false)
        }, 0)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [active, onActiveChange])

  function activate() {
    setActive(true)
    onActiveChange(true)
  }

  return { containerRef, activate }
}

const inputCls =
  'h-9 px-2.5 rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-ring)] focus:ring-2 focus:ring-[var(--admin-ring)]/30'
const labelCls = 'text-[12px] font-medium text-[var(--admin-text-secondary)]'

export type VariantSubmitResult = { ok: true } | { ok: false; error: string }

export type VariantDialogMode =
  | { kind: 'edit'; variantId: string; initialValues: CreateVariantDto }
  | { kind: 'add-color' }
  | {
      kind: 'add-size'
      colorName: string
      colorValue: string
      existingSizes: string[]
      defaults: { stock?: number; priceOverride?: number; compareAtPrice?: number | null }
    }

export interface VariantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  existingColors: { colorName: string; colorValue: string }[]
  mode: VariantDialogMode
  onSubmitOne: (dto: CreateVariantDto) => Promise<void>
  onSubmitMany: (dtos: CreateVariantDto[]) => Promise<VariantSubmitResult[]>
}

// ────────────────────────────────────────────────────────────
// Edit mode: simple single-variant form (unchanged from before)
// ────────────────────────────────────────────────────────────

type EditFormState = {
  colorName: string
  colorValue: string
  colorHex: string
  size: string
  sku: string
  stock: string
  priceOverride: string
  compareAtPrice: string
}

function editFormFromDto(dto: CreateVariantDto): EditFormState {
  return {
    colorName: dto.colorName,
    colorValue: dto.colorValue,
    colorHex: dto.colorValue,
    size: dto.size,
    sku: dto.sku ?? '',
    stock: dto.stock != null ? String(dto.stock) : '',
    priceOverride: dto.priceOverride != null ? String(dto.priceOverride) : '',
    compareAtPrice: dto.compareAtPrice != null ? String(dto.compareAtPrice) : '',
  }
}

function EditVariantForm({
  initialValues,
  onSubmit,
  onClose,
  onColorPickerActiveChange,
}: {
  initialValues: CreateVariantDto
  onSubmit: (dto: CreateVariantDto) => Promise<void>
  onClose: () => void
  onColorPickerActiveChange: (active: boolean) => void
}) {
  const [form, setForm] = useState<EditFormState>(() => editFormFromDto(initialValues))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const colorPickerGuard = useColorPickerTrapGuard(onColorPickerActiveChange)

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const dto: CreateVariantDto = {
      colorName: form.colorName,
      colorValue: form.colorValue,
      size: form.size,
      sku: form.sku || undefined,
      stock: form.stock !== '' ? Number(form.stock) : undefined,
      priceOverride: form.priceOverride !== '' ? Number(form.priceOverride) : undefined,
      compareAtPrice: form.compareAtPrice !== '' ? Number(form.compareAtPrice) : null,
    }
    setLoading(true)
    try {
      await onSubmit(dto)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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

        <div className="col-span-2 flex flex-col gap-1">
          <label className={labelCls}>Color Value</label>
          <div ref={colorPickerGuard.containerRef} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full border border-[var(--admin-border-input)] shrink-0"
              style={{ background: form.colorValue }}
            />
            <input
              type="color"
              value={form.colorValue}
              onChange={e => handleColorPickerChange(e.target.value)}
              onMouseDown={colorPickerGuard.activate}
              onFocus={colorPickerGuard.activate}
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

        <div className="flex flex-col gap-1">
          <label className={labelCls}>SKU</label>
          <input
            value={form.sku}
            onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
            placeholder="e.g. BLU-M-001"
            className={inputCls}
          />
        </div>

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

        <div className="col-span-2 flex flex-col gap-1">
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
      </div>

      {error && <p className="text-[13px] text-[var(--admin-destructive)]">{error}</p>}

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
          Save Changes
        </button>
      </DialogFooter>
    </form>
  )
}

// ────────────────────────────────────────────────────────────
// Add-color / add-size mode: size-preset picker + per-size rows
// ────────────────────────────────────────────────────────────

type AddSizesMode = Exclude<VariantDialogMode, { kind: 'edit' }>

type SizeRow = {
  size: string
  skuTouched: boolean
  sku: string
  error?: string
}

function AddSizesForm({
  productName,
  existingColors,
  mode,
  onSubmitMany,
  onClose,
  onColorPickerActiveChange,
}: {
  productName: string
  existingColors: { colorName: string; colorValue: string }[]
  mode: AddSizesMode
  onSubmitMany: (dtos: CreateVariantDto[]) => Promise<VariantSubmitResult[]>
  onClose: () => void
  onColorPickerActiveChange: (active: boolean) => void
}) {
  const isLocked = mode.kind === 'add-size'
  const existingSizes = mode.kind === 'add-size' ? mode.existingSizes : []
  const defaults = mode.kind === 'add-size' ? mode.defaults : {}

  const [colorName, setColorName] = useState(mode.kind === 'add-size' ? mode.colorName : '')
  const [colorValue, setColorValue] = useState(mode.kind === 'add-size' ? mode.colorValue : '#000000')
  const [colorHex, setColorHex] = useState(mode.kind === 'add-size' ? mode.colorValue : '#000000')
  const colorPickerGuard = useColorPickerTrapGuard(onColorPickerActiveChange)

  const [customSizeInput, setCustomSizeInput] = useState('')
  const [customSizes, setCustomSizes] = useState<string[]>([])
  const [checkedSizes, setCheckedSizes] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, SizeRow>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Shared across every checked size in this batch — sizes of the same color are
  // almost always priced and stocked the same way, so these aren't per-row fields.
  const [sharedStock, setSharedStock] = useState(defaults.stock != null ? String(defaults.stock) : '')
  const [sharedPriceOverride, setSharedPriceOverride] = useState(
    defaults.priceOverride != null ? String(defaults.priceOverride) : ''
  )
  const [sharedCompareAtPrice, setSharedCompareAtPrice] = useState(
    defaults.compareAtPrice != null ? String(defaults.compareAtPrice) : ''
  )

  const allSizeOptions = useMemo(
    () => [...SIZE_PRESETS, ...customSizes].filter(size => !existingSizes.includes(size)),
    [customSizes, existingSizes]
  )

  function defaultRow(size: string): SizeRow {
    return { size, skuTouched: false, sku: '' }
  }

  function toggleSize(size: string, checked: boolean) {
    setCheckedSizes(prev => (checked ? [...prev, size] : prev.filter(s => s !== size)))
    setRows(prev => {
      if (checked) return { ...prev, [size]: prev[size] ?? defaultRow(size) }
      const next = { ...prev }
      delete next[size]
      return next
    })
  }

  function addCustomSize() {
    const trimmed = customSizeInput.trim()
    if (!trimmed) return
    if (allSizeOptions.includes(trimmed) || existingSizes.includes(trimmed)) {
      setCustomSizeInput('')
      return
    }
    setCustomSizes(prev => [...prev, trimmed])
    setCustomSizeInput('')
  }

  function handleColorNameBlur() {
    if (mode.kind === 'add-size') return
    const match = existingColors.find(c => c.colorName === colorName)
    if (match) {
      setColorValue(match.colorValue)
      setColorHex(match.colorValue)
    }
  }

  function handleColorHexChange(raw: string) {
    setColorHex(raw)
    const val = raw.startsWith('#') ? raw : `#${raw}`
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setColorValue(val)
      setColorHex(val)
    }
  }

  function updateRow(size: string, patch: Partial<SizeRow>) {
    setRows(prev => ({ ...prev, [size]: { ...prev[size], ...patch } }))
  }

  function handleSkuChange(size: string, value: string) {
    if (value === '') {
      updateRow(size, { sku: '', skuTouched: false })
    } else {
      updateRow(size, { sku: value, skuTouched: true })
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    if (checkedSizes.length === 0) {
      setFormError('Select at least one size.')
      return
    }
    if (!colorName.trim()) {
      setFormError('Color name is required.')
      return
    }

    const orderedSizes = [...checkedSizes]
    const dtos: CreateVariantDto[] = orderedSizes.map(size => {
      const row = rows[size]
      const sku = row.skuTouched ? row.sku.trim() : generateSkuPreview(productName, colorName, size)
      return {
        colorName,
        colorValue,
        size,
        sku: sku || undefined,
        stock: sharedStock !== '' ? Number(sharedStock) : undefined,
        priceOverride: sharedPriceOverride !== '' ? Number(sharedPriceOverride) : undefined,
        compareAtPrice: sharedCompareAtPrice !== '' ? Number(sharedCompareAtPrice) : null,
      }
    })

    setSubmitting(true)
    try {
      const results = await onSubmitMany(dtos)
      const failedSizes: string[] = []
      results.forEach((result, i) => {
        const size = orderedSizes[i]
        if (!result.ok) {
          failedSizes.push(size)
          updateRow(size, { error: result.error })
        }
      })
      if (failedSizes.length === 0) {
        onClose()
      } else {
        setCheckedSizes(failedSizes)
        setRows(prev => {
          const next: Record<string, SizeRow> = {}
          for (const size of failedSizes) next[size] = prev[size]
          return next
        })
        setFormError(`${failedSizes.length} size(s) could not be created. Fix and retry.`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLocked ? (
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full border border-[var(--admin-border-input)] shrink-0"
            style={{ background: colorValue }}
          />
          <span className="text-[14px] font-medium text-[var(--admin-text-primary)]">{colorName}</span>
          <span className="text-[12px] text-[var(--admin-text-muted)] font-mono">{colorValue}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-1">
            <label className={labelCls}>Color Name</label>
            <input
              required
              value={colorName}
              onChange={e => setColorName(e.target.value)}
              onBlur={handleColorNameBlur}
              placeholder="e.g. Navy Blue"
              className={inputCls}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className={labelCls}>Color Value</label>
            <div ref={colorPickerGuard.containerRef} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full border border-[var(--admin-border-input)] shrink-0"
                style={{ background: colorValue }}
              />
              <input
                type="color"
                value={colorValue}
                onChange={e => {
                  setColorValue(e.target.value)
                  setColorHex(e.target.value)
                }}
                onMouseDown={colorPickerGuard.activate}
                onFocus={colorPickerGuard.activate}
                className="w-9 h-9 cursor-pointer rounded-[4px] border border-[var(--admin-border-input)] p-0.5 bg-transparent"
              />
              <input
                value={colorHex}
                onChange={e => handleColorHexChange(e.target.value)}
                placeholder="#000000"
                className={`flex-1 ${inputCls} font-mono`}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className={labelCls}>Sizes</label>
        <div className="flex flex-wrap gap-2">
          {existingSizes.map(size => (
            <span
              key={`existing-${size}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] border border-[var(--admin-border)] bg-[var(--admin-sidebar-bg)] text-[12px] text-[var(--admin-text-muted)]"
            >
              {size} · already added
            </span>
          ))}
          {allSizeOptions.map(size => (
            <label
              key={size}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-[var(--admin-border-input)] text-[13px] text-[var(--admin-text-primary)] cursor-pointer has-[:checked]:border-[var(--admin-ring)] has-[:checked]:bg-[var(--admin-ring)]/10"
            >
              <input
                type="checkbox"
                checked={checkedSizes.includes(size)}
                onChange={e => toggleSize(size, e.target.checked)}
                className="accent-[var(--admin-primary)]"
              />
              {size}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={customSizeInput}
            onChange={e => setCustomSizeInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomSize()
              }
            }}
            placeholder="Custom size (e.g. 32, One Size)"
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={addCustomSize}
            className="px-3 py-1.5 text-[13px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {checkedSizes.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Applies to all {checkedSizes.length} selected size{checkedSizes.length === 1 ? '' : 's'}</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Stock</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={sharedStock}
                  onChange={e => setSharedStock(e.target.value)}
                  className={inputCls}
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Price Override</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={sharedPriceOverride}
                  onChange={e => setSharedPriceOverride(e.target.value)}
                  className={inputCls}
                  placeholder="Optional"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className={labelCls}>Compare At Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={sharedCompareAtPrice}
                  onChange={e => setSharedCompareAtPrice(e.target.value)}
                  className={inputCls}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelCls}>SKU per size</label>
            <div className="flex flex-col gap-2">
              {checkedSizes.map(size => {
                const row = rows[size]
                if (!row) return null
                const skuValue = row.skuTouched
                  ? row.sku
                  : generateSkuPreview(productName, colorName || '(color)', size)
                return (
                  <div key={size} className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-[13px] font-medium text-[var(--admin-text-primary)]">
                      {size}
                    </span>
                    <input
                      value={skuValue}
                      onChange={e => handleSkuChange(size, e.target.value)}
                      className={`flex-1 ${inputCls} font-mono`}
                    />
                    {row.error && (
                      <span className="text-[11px] text-[var(--admin-destructive)] shrink-0">{row.error}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {formError && <p className="text-[13px] text-[var(--admin-destructive)]">{formError}</p>}

      <DialogFooter className="gap-2 pt-2">
        <button
          type="button"
          disabled={submitting}
          onClick={onClose}
          className="px-3 py-1.5 text-[14px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors duration-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-1.5 text-[14px] font-medium rounded-[4px] bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] transition-colors duration-100 disabled:opacity-70"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {checkedSizes.length > 1 ? `Add ${checkedSizes.length} Variants` : 'Add Variant'}
        </button>
      </DialogFooter>
    </form>
  )
}

// ────────────────────────────────────────────────────────────
// Main dialog
// ────────────────────────────────────────────────────────────

export default function VariantDialog({
  open,
  onOpenChange,
  productName,
  existingColors,
  mode,
  onSubmitOne,
  onSubmitMany,
}: VariantDialogProps) {
  // Base UI's Dialog traps focus while `modal`. The native color-input's eyedropper
  // hands focus to an OS-level surface outside the DOM, which the trap treats as focus
  // escaping the modal and fights to reclaim — leaving the trap stuck. Drop the trap for
  // the duration of the color-input interaction so focus returns normally afterward.
  const [colorPickerActive, setColorPickerActive] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={!colorPickerActive}>
      <DialogContent className="max-w-lg rounded-[8px]" style={{ fontFamily: 'var(--font-admin, inherit)' }}>
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-[var(--admin-text-primary)]">
            {mode.kind === 'edit' ? 'Edit Variant' : mode.kind === 'add-size' ? `Add Size — ${mode.colorName}` : 'Add Variant'}
          </DialogTitle>
        </DialogHeader>

        {open && mode.kind === 'edit' && (
          <EditVariantForm
            key={`${mode.variantId}`}
            initialValues={mode.initialValues}
            onSubmit={onSubmitOne}
            onClose={() => onOpenChange(false)}
            onColorPickerActiveChange={setColorPickerActive}
          />
        )}

        {open && mode.kind !== 'edit' && (
          <AddSizesForm
            key={mode.kind === 'add-size' ? `add-size-${mode.colorName}` : 'add-color'}
            productName={productName}
            existingColors={existingColors}
            mode={mode}
            onSubmitMany={onSubmitMany}
            onClose={() => onOpenChange(false)}
            onColorPickerActiveChange={setColorPickerActive}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
