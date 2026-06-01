'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import VariantDialog from '@/components/admin/products/VariantDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import FormCard from '@/components/admin/FormCard'
import type { AdminCategory } from '@/lib/api/admin-categories'
import type { AdminCollection } from '@/lib/api/admin-collections'
import type { CreateVariantDto } from '@/lib/api/admin-products'
import { createProductAction, createVariantAction } from './actions'

const inputCls =
  'h-9 px-2.5 rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-ring)] focus:ring-2 focus:ring-[var(--admin-ring)]/30 w-full'
const labelCls = 'block text-[12px] font-medium text-[var(--admin-text-secondary)] mb-1'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

const RequiredAsterisk = () => <span className="text-admin-destructive">*</span>

// ────────────────────────────────────────────────────────────
// Tag chip input (copied pattern from ProductEditClient)
// ────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('')

  function addTag(raw: string) {
    const trimmed = raw.trim()
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed])
    setInput('')
  }

  return (
    <div className="flex flex-wrap gap-1.5 min-h-9 px-2.5 py-1.5 rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] focus-within:border-[var(--admin-ring)] focus-within:ring-2 focus-within:ring-[var(--admin-ring)]/30">
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] text-[12px] font-medium"
        >
          {tag}
          <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="opacity-70 hover:opacity-100 leading-none">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input) }
          else if (e.key === 'Backspace' && input === '' && tags.length > 0) onChange(tags.slice(0, -1))
        }}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={tags.length === 0 ? 'Type and press Enter or comma…' : ''}
        className="flex-1 min-w-[120px] text-[14px] text-[var(--admin-text-primary)] bg-transparent outline-none"
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Main create form
// ────────────────────────────────────────────────────────────

interface ProductCreateClientProps {
  categories: AdminCategory[]
  collections: AdminCollection[]
}

export default function ProductCreateClient({ categories, collections }: ProductCreateClientProps) {
  const router = useRouter()

  // Details
  const [displayName, setDisplayName] = useState('')
  const [name, setName] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [type, setType] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [tags, setTags] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  // Pending variants
  const [pendingVariants, setPendingVariants] = useState<CreateVariantDto[]>([])
  const [variantDialogOpen, setVariantDialogOpen] = useState(false)
  const [editVariantIndex, setEditVariantIndex] = useState<number | null>(null)

  // Submit state
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const selectedCategory = categories.find(c => c.id === categoryId)
  const subCategories = selectedCategory?.subCategories ?? []

  // Variant handlers
  function openAddVariant() {
    setEditVariantIndex(null)
    setVariantDialogOpen(true)
  }

  function openEditVariant(index: number) {
    setEditVariantIndex(index)
    setVariantDialogOpen(true)
  }

  function handleVariantSave(dto: CreateVariantDto) {
    setPendingVariants(prev =>
      editVariantIndex !== null
        ? prev.map((v, i) => (i === editVariantIndex ? dto : v))
        : [...prev, dto]
    )
  }

  function removeVariant(index: number) {
    setPendingVariants(prev => prev.filter((_, i) => i !== index))
  }

  // Submit

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)

    try {
      const trimmedDescription = description.trim()
      const product = await createProductAction({
        name,
        displayName,
        categoryId,
        subCategoryId: subCategoryId || undefined,
        basePrice: Number(basePrice),
        currency,
        collectionId: collectionId || undefined,
        compareAtPrice: compareAtPrice !== '' ? Number(compareAtPrice) : null,
        tags: tags.length > 0 ? tags : undefined,
        type: type || null,
        isPublished,
        description: trimmedDescription
          ? { blocks: [{ type: 'text', content: trimmedDescription }] }
          : undefined,
      })

      // Batch-create pending variants — best-effort; redirect regardless
      await Promise.allSettled(
        pendingVariants.map(v => createVariantAction(product.id, v))
      )

      router.push(`/admin/products/${product.id}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to create product.')
    } finally {
      setSaving(false)
    }
  }

  // Main Return

  return (
    <>
      <form onSubmit={handleSubmit}>

        <Tabs defaultValue="details" className="space-y-6">
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
              Variants ({pendingVariants.length})
            </TabsTrigger>
          </TabsList>

          {/* ── DETAILS TAB ── */}
          <TabsContent value="details" className="space-y-4">
            {/*  Name */}
            <FormCard title="Name">
              {/* Display Name */}
              <div className="space-y-3 mt-3">
                <div>
                  <label className={labelCls}>Display Name <RequiredAsterisk /></label>
                  <input
                    required
                    value={displayName}
                    className={inputCls}
                    placeholder="e.g. Blue Widget"
                    onChange={e => {
                      setDisplayName(e.target.value)
                      if (!slugManual) setName(slugify(e.target.value))
                    }}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className={labelCls}>Slug <RequiredAsterisk /></label>
                  <input
                    required
                    value={name}
                    className={inputCls}
                    placeholder="e.g. blue_widget"
                    pattern="^[a-z0-9_]+$"
                    title="Lowercase letters, numbers, and underscores only"
                    onChange={e => {
                      setName(e.target.value)
                      setSlugManual(true)
                    }}
                  />
                  <p className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                    Lowercase letters, numbers, and underscores only
                  </p>
                </div>
              </div>
            </FormCard>

            {/* Category */}
            <FormCard title="Category">
              {/* Category */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={labelCls}>Category <RequiredAsterisk /></label>
                  <Select
                    value={categoryId}
                    onValueChange={id => {
                      if (id === null) return
                      setCategoryId(id)
                      setSubCategoryId('')
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category">
                        {categories.find(c => c.id === categoryId)?.displayName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory */}
                <div>
                  <label className={labelCls}>Subcategory</label>
                  <Select
                    value={subCategoryId}
                    disabled={!categoryId}
                    onValueChange={id => {
                      if (id === null) return
                      setSubCategoryId(id)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={!categoryId ? 'Select category first' : 'Select subcategory'}>
                        {subCategories.find(s => s.id === subCategoryId)?.displayName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {subCategories.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div>
                  <label className={labelCls}>Type</label>
                  <input
                    value={type}
                    className={inputCls}
                    placeholder="e.g. Ushanka"
                    onChange={e => setType(e.target.value.trim())}
                  />
                </div>

                {/* Collection */}
                <div>
                  <label className={labelCls}>Collection</label>
                  <Select
                    value={collectionId}
                    onValueChange={id => {
                      if (id === null) return
                      setCollectionId(id)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No collection">
                        {collections.find(c => c.id === collectionId)?.displayName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {collections.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormCard>

            {/* Pricing */}
            <FormCard title="Pricing">
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div>
                  <label className={labelCls}>Base Price <RequiredAsterisk /></label>
                  <input
                    required
                    type="number" min="0" step="0.01"
                    value={basePrice}
                    className={inputCls}
                    placeholder="0.00"
                    onChange={e => setBasePrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Compare At Price</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={compareAtPrice}
                    className={inputCls}
                    placeholder="Optional"
                    onChange={e => setCompareAtPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Currency <RequiredAsterisk /></label>
                  <input
                    required
                    value={currency}
                    onChange={e => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
                    maxLength={3}
                    className={inputCls}
                    placeholder="USD"
                  />
                </div>
              </div>
            </FormCard>

            <FormCard title="Description">
              <div className="mt-3">
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Product description (optional)"
                  className="w-full px-2.5 py-2 rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-ring)] focus:ring-2 focus:ring-[var(--admin-ring)]/30 resize-y"
                />
              </div>
            </FormCard>

            <FormCard title="Tags">
              <div className="mt-3">
                <TagInput tags={tags} onChange={setTags} />
              </div>
            </FormCard>

            <FormCard title="Visibility">
              <div className="flex items-center gap-3 mt-3">
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                <span className="text-[14px] text-[var(--admin-text-primary)]">
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </FormCard>
          </TabsContent>

          {/* ── VARIANTS TAB ── */}
          <TabsContent value="variants" className="space-y-4">
            {/* "Add variant" button */}
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

            {pendingVariants.length === 0 && (
              <p className="text-[13px] text-[var(--admin-text-muted)] text-center py-8">
                No variants yet. Add one to begin.
              </p>
            )}

            <div className="space-y-2">
              {pendingVariants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 bg-white border border-[var(--admin-border)] rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0 border border-[var(--admin-border)]"
                    style={{ background: v.colorValue }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-medium text-[var(--admin-text-primary)]">{v.colorName}</span>
                      <span className="text-[13px] text-[var(--admin-text-muted)]">{v.size}</span>
                      {v.sku && <span className="text-[12px] text-[var(--admin-text-muted)]">SKU: {v.sku}</span>}
                      {v.stock != null && <span className="text-[12px] text-[var(--admin-text-muted)]">Stock: {v.stock}</span>}
                      {v.priceOverride != null && <span className="text-[12px] text-[var(--admin-text-primary)]">${v.priceOverride.toFixed(2)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditVariant(idx)}
                      className="px-2.5 py-1 text-[12px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="p-1.5 rounded-[4px] text-[var(--admin-destructive)] hover:bg-[var(--admin-status-error-bg)] transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Footer ── */}
        {saveError && (
          <p className="mt-4 text-[13px] text-[var(--admin-destructive)]">{saveError}</p>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <Link
            href="/admin/products"
            className="h-9 px-4 flex items-center rounded-[4px] text-[14px] font-medium text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:bg-[var(--admin-sidebar-bg)] transition-colors duration-150"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 h-9 px-5 rounded-[4px] text-[14px] font-medium bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] transition-colors duration-150 disabled:opacity-70"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? 'Creating…' : 'Create Product'}
          </button>
        </div>
      </form>

      <VariantDialog
        mode="create"
        open={variantDialogOpen}
        onOpenChange={setVariantDialogOpen}
        initialValues={editVariantIndex !== null ? pendingVariants[editVariantIndex] : undefined}
        onSubmit={handleVariantSave}
      />
    </>
  )
}
