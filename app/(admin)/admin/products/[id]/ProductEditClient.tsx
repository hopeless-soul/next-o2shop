'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, GripVertical, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import FormCard from '@/components/admin/FormCard'
import AdminBadge from '@/components/admin/AdminBadge'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import type { AdminProduct, ProductVariant, ProductPhoto } from '@/lib/api/admin-products'
import {
  updateProductAction,
  deleteVariantAction,
  setDefaultVariantAction,
  uploadPhotoAction,
  deletePhotoAction,
  reorderPhotosAction,
  uploadFeaturedPhotoAction,
  deleteFeaturedPhotoAction,
  deleteProductAction,
} from './actions'
import type { AdminCategory } from '@/lib/api/admin-categories'
import type { AdminCollection } from '@/lib/api/admin-collections'
import VariantDialog from './VariantDialog'

interface ProductEditClientProps {
  product: AdminProduct
  categories: AdminCategory[]
  collections: AdminCollection[]
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

// ────────────────────────────────────────────────────────────
// Tag chip input
// ────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState('')

  function addTag(raw: string) {
    const trimmed = raw.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 min-h-9 px-2.5 py-1.5 rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] focus-within:border-[var(--admin-ring)] focus-within:ring-2 focus-within:ring-[var(--admin-ring)]/30">
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] text-[12px] font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter(t => t !== tag))}
            className="opacity-70 hover:opacity-100 leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={tags.length === 0 ? 'Type and press Enter or comma…' : ''}
        className="flex-1 min-w-[120px] text-[14px] text-[var(--admin-text-primary)] bg-transparent outline-none"
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Photos Tab
// ────────────────────────────────────────────────────────────

function FeaturedPhotoSection({
  productId,
  initialFeaturedPhoto,
}: {
  productId: string
  initialFeaturedPhoto?: ProductPhoto | null
}) {
  const [featured, setFeatured] = useState<ProductPhoto | null>(initialFeaturedPhoto ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const photo = await uploadFeaturedPhotoAction(productId, formData)
      setFeatured(photo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteFeaturedPhotoAction(productId)
      setFeatured(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
    }
  }

  return (
    <div className="space-y-3 pt-4">
      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-[var(--admin-border)]" />
        <span className="text-[11px] font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider px-1">
          Featured Photo
        </span>
        <div className="h-px flex-1 bg-[var(--admin-border)]" />
      </div>

      <p className="text-[12px] text-[var(--admin-text-muted)]">
        Hero / brand image shown on collection and feature surfaces. Only one is allowed per product.
      </p>

      {featured ? (
        <div className="flex items-center gap-3 p-3 bg-white border border-[var(--admin-border)] rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="relative w-20 h-20 rounded-[4px] overflow-hidden bg-[var(--admin-bg)] shrink-0 border border-[var(--admin-border)]">
            <Image
              src={featured.url}
              alt={featured.altText ?? 'Featured photo'}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          <AdminBadge variant="info" label="Featured" />

          <div className="flex-1 min-w-0" />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] disabled:opacity-40 transition-colors"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : 'Replace'}
          </button>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="p-1.5 rounded-[4px] text-[var(--admin-destructive)] hover:bg-[var(--admin-status-error-bg)] transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--admin-border-input)] rounded-[6px] p-8 cursor-pointer hover:border-[var(--admin-ring)] transition-colors duration-150"
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-[var(--admin-text-muted)]" />
          ) : (
            <>
              <Plus className="size-6 text-[var(--admin-text-muted)]" />
              <p className="text-[13px] text-[var(--admin-text-muted)]">
                Upload Featured Photo — JPEG, PNG, WebP
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && (
        <p className="text-[13px] text-[var(--admin-destructive)]">{error}</p>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={open => { if (!open) setDeleteOpen(false) }}
        title="Delete Featured Photo"
        description="The featured photo will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}

function PhotosTab({
  productId,
  initialPhotos,
  primaryPhotoId: initialPrimaryId,
  initialFeaturedPhoto,
}: {
  productId: string
  initialPhotos: ProductPhoto[]
  primaryPhotoId?: string | null
  initialFeaturedPhoto?: ProductPhoto | null
}) {
  const [photos, setPhotos] = useState(() =>
    [...initialPhotos].sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [primaryId, setPrimaryId] = useState<string | null>(initialPrimaryId ?? null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [applying, setApplying] = useState(false)
  const dragIndexRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function clearError(photoId: string) {
    setErrors(e => { const n = { ...e }; delete n[photoId]; return n })
  }

  // ── Upload ──────────────────────────────────────────────
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const photo = await uploadPhotoAction(productId, formData, photos.length)
      setPhotos(prev => [...prev, photo])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    await deletePhotoAction(productId, deleteTarget)
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== deleteTarget)
      return reassignOrders(filtered)
    })
    if (primaryId === deleteTarget) setPrimaryId(null)
  }

  // ── Reorder helpers ──────────────────────────────────────
  function reassignOrders(list: ProductPhoto[]): PhotoWithOrder[] {
    return list.map((p, i) => ({ ...p, sortOrder: i }))
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    const next = [...photos]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setPhotos(reassignOrders(next))
    setIsDirty(true)
  }

  function moveDown(idx: number) {
    if (idx === photos.length - 1) return
    const next = [...photos]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setPhotos(reassignOrders(next))
    setIsDirty(true)
  }

  // ── Manual sortOrder input ───────────────────────────────
  function handleSortOrderBlur(photoId: string, value: string) {
    const raw = Number(value)
    if (isNaN(raw)) return
    const max = photos.length - 1
    const clamped = Math.max(0, Math.min(max, raw))
    const fromIdx = photos.findIndex(p => p.id === photoId)
    if (fromIdx === -1 || clamped === fromIdx) return
    const next = [...photos]
    const [item] = next.splice(fromIdx, 1)
    next.splice(clamped, 0, item)
    setPhotos(reassignOrders(next))
    setIsDirty(true)
  }

  // ── Apply reorder ────────────────────────────────────────
  async function handleApply() {
    setApplying(true)
    try {
      await reorderPhotosAction(productId, photos.map(p => ({ id: p.id, sortOrder: p.sortOrder })))
      setIsDirty(false)
      setErrors(e => { const n = { ...e }; delete n._reorder; return n })
    } catch (err) {
      setErrors(e => ({ ...e, _reorder: err instanceof Error ? err.message : 'Reorder failed.' }))
    } finally {
      setApplying(false)
    }
  }

  // ── Set as Primary ───────────────────────────────────────
  async function handleSetPrimary(photoId: string) {
    clearError(photoId)
    try {
      await updateProductAction(productId, { primaryPhotoId: photoId })
      setPrimaryId(photoId)
      const fromIdx = photos.findIndex(p => p.id === photoId)
      if (fromIdx > 0) {
        const next = [...photos]
        const [item] = next.splice(fromIdx, 1)
        next.splice(0, 0, item)
        setPhotos(reassignOrders(next))
        setIsDirty(true)
      }
    } catch (err) {
      setErrors(e => ({ ...e, [photoId]: err instanceof Error ? err.message : 'Update failed.' }))
    }
  }

  // ── Drag & Drop ──────────────────────────────────────────
  function handleDragStart(idx: number) {
    dragIndexRef.current = idx
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === idx) return
    const next = [...photos]
    const [item] = next.splice(from, 1)
    next.splice(idx, 0, item)
    dragIndexRef.current = idx
    setPhotos(reassignOrders(next))
  }

  function handleDrop() {
    const list = reassignOrders(photos)
    setPhotos(list)
    setIsDirty(true)
    dragIndexRef.current = null
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--admin-border-input)] rounded-[6px] p-8 cursor-pointer hover:border-[var(--admin-ring)] transition-colors duration-150"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-[var(--admin-text-muted)]" />
        ) : (
          <>
            <Plus className="size-6 text-[var(--admin-text-muted)]" />
            <p className="text-[13px] text-[var(--admin-text-muted)]">
              Click to upload — JPEG, PNG, WebP
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {uploadError && (
        <p className="text-[13px] text-[var(--admin-destructive)]">{uploadError}</p>
      )}
      {errors._reorder && (
        <p className="text-[13px] text-[var(--admin-destructive)]">{errors._reorder}</p>
      )}

      {isDirty && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-[4px] bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] disabled:opacity-50 transition-colors"
          >
            {applying && <Loader2 className="size-3.5 animate-spin" />}
            Apply
          </button>
        </div>
      )}

      {/* Photo list */}
      <div className="space-y-2">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDrop={handleDrop}
            className="flex items-center gap-3 p-3 bg-white border border-[var(--admin-border)] rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            {/* Drag handle */}
            <GripVertical className="size-4 text-[var(--admin-text-muted)] cursor-grab shrink-0" />

            {/* Thumbnail */}
            <div className="relative w-16 h-16 rounded-[4px] overflow-hidden bg-[var(--admin-bg)] shrink-0 border border-[var(--admin-border)]">
              <Image
                src={photo.url}
                alt={photo.altText ?? ''}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            {/* Primary badge */}
            {photo.id === primaryId && (
              <AdminBadge variant="info" label="Primary" />
            )}

            <div className="flex-1 min-w-0" />

            {/* sortOrder input */}
            <div className="flex flex-col gap-0.5 items-center">
              <span className="text-[10px] text-[var(--admin-text-muted)]">Order</span>
              <input
                type="number"
                min={0}
                max={photos.length - 1}
                defaultValue={photo.sortOrder}
                key={`${photo.id}-${photo.sortOrder}`}
                onBlur={e => handleSortOrderBlur(photo.id, e.target.value)}
                className="w-14 h-7 px-1.5 text-center rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] text-[13px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-ring)]"
              />
            </div>

            {/* Move up / down */}
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => moveUp(idx)}
                className="h-6 w-6 flex items-center justify-center rounded-[4px] border border-[var(--admin-border)] hover:bg-[var(--admin-border)] disabled:opacity-30 transition-colors"
              >
                <ChevronUp className="size-3.5" />
              </button>
              <button
                type="button"
                disabled={idx === photos.length - 1}
                onClick={() => moveDown(idx)}
                className="h-6 w-6 flex items-center justify-center rounded-[4px] border border-[var(--admin-border)] hover:bg-[var(--admin-border)] disabled:opacity-30 transition-colors"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </div>

            {/* Set as Primary */}
            <button
              type="button"
              disabled={photo.id === primaryId}
              onClick={() => handleSetPrimary(photo.id)}
              className="px-2.5 py-1 text-[12px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              Set as Primary
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => setDeleteTarget(photo.id)}
              className="p-1.5 rounded-[4px] text-[var(--admin-destructive)] hover:bg-[var(--admin-status-error-bg)] transition-colors"
            >
              <Trash2 className="size-4" />
            </button>

            {errors[photo.id] && (
              <span className="text-[11px] text-[var(--admin-destructive)]">{errors[photo.id]}</span>
            )}
          </div>
        ))}

        {photos.length === 0 && (
          <p className="text-[13px] text-[var(--admin-text-muted)] text-center py-4">
            No photos yet. Upload one above.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => { if (!open) setDeleteTarget(null) }}
        title="Delete Photo"
        description="This photo will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />

      <FeaturedPhotoSection
        productId={productId}
        initialFeaturedPhoto={initialFeaturedPhoto}
      />
    </div>
  )
}

type PhotoWithOrder = ProductPhoto & { sortOrder: number }

// ────────────────────────────────────────────────────────────
// Variant sorting helpers
// ────────────────────────────────────────────────────────────

const LETTER_SIZE_ORDER = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

function compareSizes(a: string, b: string): number {
  const aNum = Number(a)
  const bNum = Number(b)
  const aIsNum = !isNaN(aNum)
  const bIsNum = !isNaN(bNum)
  if (aIsNum && bIsNum) return aNum - bNum
  if (aIsNum) return -1
  if (bIsNum) return 1
  const aIdx = LETTER_SIZE_ORDER.indexOf(a.toUpperCase())
  const bIdx = LETTER_SIZE_ORDER.indexOf(b.toUpperCase())
  if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx
  if (aIdx >= 0) return -1
  if (bIdx >= 0) return 1
  return a.localeCompare(b)
}

function sortVariants(vs: ProductVariant[]): ProductVariant[] {
  return [...vs].sort((a, b) => {
    const c = a.colorName.localeCompare(b.colorName)
    return c !== 0 ? c : compareSizes(a.size, b.size)
  })
}

// ────────────────────────────────────────────────────────────
// Main client component
// ────────────────────────────────────────────────────────────

export default function ProductEditClient({
  product,
  categories,
  collections,
}: ProductEditClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'details'

  function handleTabChange(tab: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // ── Details form state ───────────────────────────────────
  const [displayName, setDisplayName] = useState(product.displayName)
  const [name, setName] = useState(product.name)
  const [slugManual, setSlugManual] = useState(false)
  const [categoryId, setCategoryId] = useState(product.category?.id ?? '')
  const [subCategoryId, setSubCategoryId] = useState(product.subCategory?.id ?? '')
  const [type, setType] = useState(product.type ?? '')
  const [collectionId, setCollectionId] = useState(product.collection?.id ?? '')
  const [basePrice, setBasePrice] = useState(String(product.basePrice))
  const [compareAtPrice, setCompareAtPrice] = useState(
    product.compareAtPrice != null ? String(product.compareAtPrice) : ''
  )
  const [currency, setCurrency] = useState(product.currency)
  const [tags, setTags] = useState<string[]>(product.tags ?? [])
  const [isPublished, setIsPublished] = useState(product.isPublished)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // ── Variants state ───────────────────────────────────────
  const [variants, setVariants] = useState<ProductVariant[]>(product.variants ?? [])
  const [defaultVariantId, setDefaultVariantId] = useState(product.defaultVariant?.id ?? null)
  const [variantDialogOpen, setVariantDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | undefined>()
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null)
  const [variantActionErrors, setVariantActionErrors] = useState<Record<string, string>>({})
  const [pendingDefaultId, setPendingDefaultId] = useState<string | null>(null)

  // ── Derived data ─────────────────────────────────────────
  const selectedCategory = categories.find(c => c.id === categoryId)
  const subCategories = selectedCategory?.subCategories ?? []

  function handleDisplayNameChange(val: string) {
    setDisplayName(val)
    if (!slugManual) {
      setName(slugify(val))
    }
  }

  function handleNameChange(val: string) {
    setName(val)
    setSlugManual(true)
  }

  function handleCategoryChange(id: string | null) {
    setCategoryId(id ?? '')
    setSubCategoryId('')
  }

  // ── Save details ─────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await updateProductAction(product.id, {
        displayName,
        name,
        categoryId: categoryId || undefined,
        subCategoryId: subCategoryId || null,
        type: type || null,
        collectionId: collectionId || undefined,
        basePrice: Number(basePrice),
        compareAtPrice: compareAtPrice !== '' ? Number(compareAtPrice) : null,
        currency,
        tags,
        isPublished,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete product ───────────────────────────────────────
  const [deleteProductOpen, setDeleteProductOpen] = useState(false)
  const [deleteProductError, setDeleteProductError] = useState<string | null>(null)

  async function handleDeleteProduct() {
    try {
      await deleteProductAction(product.id)
      router.push('/admin/products')
    } catch (err) {
      setDeleteProductError(err instanceof Error ? err.message : 'Failed to delete product.')
    }
  }

  // ── Variant actions ──────────────────────────────────────
  function openAddVariant() {
    setEditingVariant(undefined)
    setVariantDialogOpen(true)
  }

  function openEditVariant(v: ProductVariant) {
    setEditingVariant(v)
    setVariantDialogOpen(true)
  }

  function handleVariantSaved(v: ProductVariant) {
    setVariants(prev => {
      const idx = prev.findIndex(x => x.id === v.id)
      return idx >= 0 ? prev.map(x => (x.id === v.id ? v : x)) : [...prev, v]
    })
  }

  async function handleDeleteVariant() {
    if (!deleteVariantId) return
    try {
      await deleteVariantAction(product.id, deleteVariantId)
      setVariants(prev => prev.filter(v => v.id !== deleteVariantId))
      if (defaultVariantId === deleteVariantId) setDefaultVariantId(null)
    } catch (err) {
      setVariantActionErrors(e => ({
        ...e,
        [deleteVariantId]: err instanceof Error ? err.message : 'Failed to delete variant.',
      }))
    }
  }

  async function handleSetDefault(variantId: string) {
    setVariantActionErrors(e => { const n = { ...e }; delete n[variantId]; return n })
    setPendingDefaultId(variantId)
    try {
      await setDefaultVariantAction(product.id, variantId)
      setDefaultVariantId(variantId)
    } catch (err) {
      setVariantActionErrors(e => ({
        ...e,
        [variantId]: err instanceof Error ? err.message : 'Failed.',
      }))
    } finally {
      setPendingDefaultId(null)
    }
  }

  // ── Shared input classes ─────────────────────────────────
  const inputCls =
    'h-9 px-2.5 rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-ring)] focus:ring-2 focus:ring-[var(--admin-ring)]/30 w-full'
  const labelCls = 'block text-[12px] font-medium text-[var(--admin-text-secondary)] mb-1'

  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-[var(--admin-sidebar-bg)] border border-[var(--admin-border)] rounded-[6px] p-1 gap-1">
          <TabsTrigger
            value="details"
            className="rounded-[4px] text-[13px] font-medium px-4 py-1.5 text-[var(--admin-text-secondary)] data-[state=active]:bg-white data-[state=active]:text-[var(--admin-text-primary)] data-[state=active]:shadow-sm"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="variants"
            className="rounded-[4px] text-[13px] font-medium px-4 py-1.5 text-[var(--admin-text-secondary)] data-[state=active]:bg-white data-[state=active]:text-[var(--admin-text-primary)] data-[state=active]:shadow-sm"
          >
            Variants ({variants.length})
          </TabsTrigger>
          <TabsTrigger
            value="photos"
            className="rounded-[4px] text-[13px] font-medium px-4 py-1.5 text-[var(--admin-text-secondary)] data-[state=active]:bg-white data-[state=active]:text-[var(--admin-text-primary)] data-[state=active]:shadow-sm"
          >
            Photos ({product.photos?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* ── DETAILS TAB ── */}
        <TabsContent value="details">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name block */}
              <FormCard title="Name" className="col-span-1">
                <div className="space-y-3 mt-3">
                  <div>
                    <label className={labelCls}>Display Name</label>
                    <input
                      required
                      value={displayName}
                      onChange={e => handleDisplayNameChange(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Blue Widget"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Slug</label>
                    <input
                      value={name}
                      onChange={e => handleNameChange(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. blue_widget"
                      pattern="^[a-z0-9_]+$"
                      title="Lowercase letters, numbers, and underscores only"
                    />
                    <p className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                      Lowercase letters, numbers, and underscores only
                    </p>
                  </div>
                </div>
              </FormCard>

              {/* Category block */}
              <FormCard title="Category" className="col-span-1">
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className={labelCls}>Category</label>
                    <Select value={categoryId} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category">
                          {categories.find(c => c.id === categoryId)?.displayName}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className={labelCls}>Subcategory</label>
                    <Select
                      value={subCategoryId}
                      onValueChange={(v) => setSubCategoryId(v ?? '')}
                      disabled={!categoryId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select subcategory">
                          {subCategories.find(s => s.id === subCategoryId)?.displayName}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {subCategories.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className={labelCls}>Type</label>
                    <input
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Ushanka"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Collection</label>
                    <Select value={collectionId} onValueChange={(v) => setCollectionId(v ?? '')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="No collection">
                          {collections.find(c => c.id === collectionId)?.displayName}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {collections.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </FormCard>

              {/* Price block */}
              <FormCard title="Pricing" className="col-span-1">
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className={labelCls}>Base Price</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={basePrice}
                      onChange={e => setBasePrice(e.target.value)}
                      className={inputCls}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Compare At Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={compareAtPrice}
                      onChange={e => setCompareAtPrice(e.target.value)}
                      className={inputCls}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Currency</label>
                    <input
                      value={currency}
                      onChange={e => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
                      maxLength={3}
                      className={inputCls}
                      placeholder="USD"
                    />
                  </div>
                </div>
              </FormCard>

              {/* Tags block */}
              <FormCard title="Tags" className="col-span-1">
                <div className="mt-3">
                  <TagInput tags={tags} onChange={setTags} />
                </div>
              </FormCard>

              {/* Published */}
              <FormCard title="Visibility" className="col-span-2">
                <div className="flex items-center gap-3 mt-3">
                  <Switch
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <span className="text-[14px] text-[var(--admin-text-primary)]">
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                {/* ── DANGER ZONE ── */}
                <FormCard title="Danger Zone" className="mt-6 border-[var(--admin-destructive)]">
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-[14px] text-[var(--admin-text-primary)]">Delete this product</p>
                      <p className="text-[12px] text-[var(--admin-text-muted)] mt-0.5">
                        The product will no longer be visible to customers.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDeleteProductOpen(true); setDeleteProductError(null) }}
                      className="h-9 px-4 rounded-[4px] text-[14px] font-medium border border-[var(--admin-destructive)] text-[var(--admin-destructive)] hover:bg-[var(--admin-status-error-bg)] transition-colors duration-150"
                    >
                      Delete Product
                    </button>
                  </div>
                  {deleteProductError && (
                    <p className="mt-2 text-[13px] text-[var(--admin-destructive)]">{deleteProductError}</p>
                  )}
                </FormCard>
              </FormCard>


            </div>


            {/* Error / success */}
            {saveError && (
              <p className="text-[13px] text-[var(--admin-destructive)]">{saveError}</p>
            )}
            {saveSuccess && (
              <p className="text-[13px] text-[var(--admin-status-success-fg)]">Changes saved.</p>
            )}

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 h-9 px-5 rounded-[4px] text-[14px] font-medium bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] transition-colors duration-150 disabled:opacity-70"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save Changes
              </button>
            </div>

          </form>



        </TabsContent>

        {/* ── VARIANTS TAB ── */}
        <TabsContent value="variants">
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openAddVariant}
                className="flex items-center gap-1.5 h-9 px-4 rounded-[4px] text-[13px] font-medium bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] transition-colors duration-150"
              >
                <Plus className="size-4" />
                Add Variant
              </button>
            </div>

            {variants.length === 0 && (
              <p className="text-[13px] text-[var(--admin-text-muted)] text-center py-8">
                No variants yet. Add one to define sizes and colors.
              </p>
            )}

            <div className="space-y-2">
              {sortVariants(variants).map(v => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 p-4 bg-white border border-[var(--admin-border)] rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  {/* Color swatch */}
                  <div
                    className="w-4 h-4 rounded-full shrink-0 border border-[var(--admin-border)]"
                    style={{ background: v.colorValue }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-medium text-[var(--admin-text-primary)]">
                        {v.colorName}
                      </span>
                      <span className="text-[13px] text-[var(--admin-text-muted)]">{v.size}</span>
                      {v.sku && (
                        <span className="text-[12px] text-[var(--admin-text-muted)]">
                          SKU: {v.sku}
                        </span>
                      )}
                      <span className="text-[12px] text-[var(--admin-text-muted)]">
                        Stock: {v.stock}
                      </span>
                      {v.priceOverride != null && (
                        <span className="text-[12px] text-[var(--admin-text-primary)]">
                          ${v.priceOverride.toFixed(2)}
                        </span>
                      )}
                      {v.id === defaultVariantId && (
                        <AdminBadge variant="info" label="Default" />
                      )}
                      {v.stock === 0 && (
                        <AdminBadge variant="warning" label="Out of stock" />
                      )}
                    </div>
                    {variantActionErrors[v.id] && (
                      <p className="text-[11px] text-[var(--admin-destructive)] mt-0.5">
                        {variantActionErrors[v.id]}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {v.id !== defaultVariantId && (
                      <button
                        type="button"
                        disabled={pendingDefaultId === v.id}
                        onClick={() => handleSetDefault(v.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] disabled:opacity-50 transition-colors"
                      >
                        {pendingDefaultId === v.id && <Loader2 className="size-3 animate-spin" />}
                        Set default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditVariant(v)}
                      className="px-2.5 py-1 text-[12px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteVariantId(v.id)}
                      className="p-1.5 rounded-[4px] text-[var(--admin-destructive)] hover:bg-[var(--admin-status-error-bg)] transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <VariantDialog
            productId={product.id}
            variant={editingVariant}
            open={variantDialogOpen}
            onOpenChange={setVariantDialogOpen}
            onSaved={handleVariantSaved}
          />

          <ConfirmDialog
            open={deleteVariantId !== null}
            onOpenChange={open => { if (!open) setDeleteVariantId(null) }}
            title="Delete Variant"
            description="This variant will be permanently removed."
            confirmLabel="Delete"
            destructive
            onConfirm={handleDeleteVariant}
          />
        </TabsContent>

        {/* ── PHOTOS TAB ── */}
        <TabsContent value="photos">
          <PhotosTab
            productId={product.id}
            initialPhotos={product.photos ?? []}
            primaryPhotoId={product.primaryPhoto?.id}
            initialFeaturedPhoto={product.featuredPhoto}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteProductOpen}
        onOpenChange={open => { if (!open) setDeleteProductOpen(false) }}
        title="Delete Product"
        description={`Delete "${product.displayName}"? The product will no longer be visible to customers.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteProduct}
      />
    </>
  )
}
