'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import VariantDialog from '@/components/admin/products/VariantDialog'
import DescriptionEditor from '@/components/admin/products/DescriptionEditor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import FormCard from '@/components/admin/FormCard'
import type { AdminCategory } from '@/lib/api/admin/admin-categories'
import type { AdminCollection } from '@/lib/api/admin/admin-collections'
import type { CreateVariantDto, DescriptionBlock } from '@/lib/api/admin/admin-products'
import { groupVariantsByColor } from '@/lib/utils/variant-grouping'
import VariantColorCard from '@/components/admin/products/VariantColorCard'
import RestockPopover from '@/components/admin/products/RestockPopover'
import type { VariantDialogMode, VariantSubmitResult } from '@/components/admin/products/VariantDialog'
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

type PendingVariant = CreateVariantDto & { _key: number }

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
  const [descriptionBlocks, setDescriptionBlocks] = useState<DescriptionBlock[]>([])
  const [isPublished, setIsPublished] = useState(false)

  // Pending variants
  const nextKeyRef = useRef(0)
  const [pendingVariants, setPendingVariants] = useState<PendingVariant[]>([])
  const [dialogMode, setDialogMode] = useState<VariantDialogMode | null>(null)

  // Submit state
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const selectedCategory = categories.find(c => c.id === categoryId)
  const subCategories = selectedCategory?.subCategories ?? []

  const existingColors = useMemo(() => {
    const map = new Map<string, string>()
    for (const v of pendingVariants) {
      if (!map.has(v.colorName)) map.set(v.colorName, v.colorValue)
    }
    return Array.from(map, ([colorName, colorValue]) => ({ colorName, colorValue }))
  }, [pendingVariants])

  // Variant handlers
  function openAddColor() {
    setDialogMode({ kind: 'add-color' })
  }

  function openAddSize(group: { colorName: string; colorValue: string; variants: PendingVariant[] }) {
    setDialogMode({
      kind: 'add-size',
      colorName: group.colorName,
      colorValue: group.colorValue,
      existingSizes: group.variants.map(v => v.size),
      defaults: {
        stock: group.variants[0]?.stock,
        priceOverride: group.variants[0]?.priceOverride,
        compareAtPrice: group.variants[0]?.compareAtPrice ?? undefined,
      },
    })
  }

  function openEditVariant(v: PendingVariant) {
    setDialogMode({
      kind: 'edit',
      variantId: String(v._key),
      initialValues: {
        colorName: v.colorName,
        colorValue: v.colorValue,
        size: v.size,
        sku: v.sku,
        stock: v.stock,
        priceOverride: v.priceOverride,
        compareAtPrice: v.compareAtPrice,
      },
    })
  }

  async function handleSubmitMany(dtos: CreateVariantDto[]): Promise<VariantSubmitResult[]> {
    setPendingVariants(prev => [
      ...prev,
      ...dtos.map(dto => ({ ...dto, _key: nextKeyRef.current++ })),
    ])
    return dtos.map(() => ({ ok: true as const }))
  }

  async function handleSubmitOne(dto: CreateVariantDto) {
    if (dialogMode?.kind !== 'edit') return
    const key = dialogMode.variantId
    setPendingVariants(prev =>
      prev.map(v => (String(v._key) === key ? { ...dto, _key: v._key } : v))
    )
  }

  async function handleRestockPending(key: number, stock: number) {
    setPendingVariants(prev => prev.map(v => (v._key === key ? { ...v, stock } : v)))
  }

  function removeVariant(key: number) {
    setPendingVariants(prev => prev.filter(v => v._key !== key))
  }

  // Submit

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)

    try {
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
        description: descriptionBlocks.length > 0 ? { blocks: descriptionBlocks } : undefined,
      })

      // Batch-create pending variants — best-effort; redirect regardless
      await Promise.allSettled(
        pendingVariants.map(({ _key, ...dto }) => createVariantAction(product.id, dto))
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
                <DescriptionEditor blocks={descriptionBlocks} onChange={setDescriptionBlocks} />
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
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openAddColor}
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

            <div className="space-y-3">
              {groupVariantsByColor(pendingVariants).map(group => (
                <VariantColorCard
                  key={group.colorName}
                  group={group}
                  onAddSize={() => openAddSize(group)}
                  renderRow={(v) => (
                    <div
                      key={v._key}
                      className="flex items-center gap-3 p-3 border-t border-[var(--admin-border)] first:border-t-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] font-medium text-[var(--admin-text-primary)]">{v.size}</span>
                          {v.sku && <span className="text-[12px] text-[var(--admin-text-muted)]">SKU: {v.sku}</span>}
                          {v.stock != null && <span className="text-[12px] text-[var(--admin-text-muted)]">Stock: {v.stock}</span>}
                          {v.priceOverride != null && <span className="text-[12px] text-[var(--admin-text-primary)]">${v.priceOverride.toFixed(2)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <RestockPopover
                          currentStock={v.stock ?? 0}
                          onSave={(stock) => handleRestockPending(v._key, stock)}
                        />
                        <button
                          type="button"
                          onClick={() => openEditVariant(v)}
                          className="px-2.5 py-1 text-[12px] font-medium rounded-[4px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVariant(v._key)}
                          className="p-1.5 rounded-[4px] text-[var(--admin-destructive)] hover:bg-[var(--admin-status-error-bg)] transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  )}
                />
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
        open={dialogMode !== null}
        onOpenChange={(open) => { if (!open) setDialogMode(null) }}
        productName={name || 'product'}
        existingColors={existingColors}
        mode={dialogMode ?? { kind: 'add-color' }}
        onSubmitOne={handleSubmitOne}
        onSubmitMany={handleSubmitMany}
      />
    </>
  )
}
