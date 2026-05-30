'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AdminPagination from '@/components/admin/AdminPagination'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  type AdminCategory,
  type AdminSubCategory,
} from '@/lib/api/admin-categories'

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

interface CategoriesContentProps {
  categories: AdminCategory[]
  total: number
  page: number
  limit: number
  addingCat: boolean
  onAddingCatChange: (v: boolean) => void
}

export default function CategoriesContent({
  categories,
  total,
  page,
  limit,
  addingCat,
  onAddingCatChange,
}: CategoriesContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Local copy — mutations update optimistically (no router.refresh needed).
  // Sync from parent RSC via derived-state pattern.
  const [prevCategories, setPrevCategories] = useState(categories)
  const [cats, setCats] = useState<AdminCategory[]>(categories)
  if (prevCategories !== categories) {
    setPrevCategories(categories)
    setCats(categories)
  }

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // New category inline row
  const [newCatForm, setNewCatForm] = useState({ displayName: '', slug: '' })
  const [newCatError, setNewCatError] = useState<string | null>(null)
  const [isSavingCat, setIsSavingCat] = useState(false)

  // Category inline edit
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editCatForm, setEditCatForm] = useState({ displayName: '', slug: '' })
  const [editCatError, setEditCatError] = useState<string | null>(null)

  // Category delete
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null)

  // Subcategory delete
  const [deleteSubTarget, setDeleteSubTarget] = useState<{
    categoryId: string
    subId: string
    name: string
  } | null>(null)

  // Inline add subcategory
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null)
  const [newSubForm, setNewSubForm] = useState({ displayName: '', slug: '' })
  const [newSubError, setNewSubError] = useState<string | null>(null)

  // Inline edit subcategory
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editSubForm, setEditSubForm] = useState({ displayName: '', slug: '' })
  const [editSubError, setEditSubError] = useState<string | null>(null)

  const [isSavingSub, setIsSavingSub] = useState(false)

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    if (!('page' in updates)) params.set('page', '1')
    router.replace(`/admin/categories?${params.toString()}`)
  }

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        if (addingSubFor === id) setAddingSubFor(null)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // ── New category ─────────────────────────────────────────────────────────

  // When the header button activates the inline form, cancel any in-progress edit.
  const [prevAddingCat, setPrevAddingCat] = useState(addingCat)
  if (prevAddingCat !== addingCat) {
    setPrevAddingCat(addingCat)
    if (addingCat) {
      setEditingCatId(null)
      setNewCatError(null)
    }
  }

  function cancelAddCat() {
    onAddingCatChange(false)
    setNewCatForm({ displayName: '', slug: '' })
    setNewCatError(null)
  }

  async function saveNewCat() {
    if (!newCatForm.displayName.trim()) return
    setIsSavingCat(true)
    setNewCatError(null)
    try {
      const created: AdminCategory = await createCategory({
        displayName: newCatForm.displayName.trim(),
        slug: newCatForm.slug || toSlug(newCatForm.displayName),
      })
      setCats((prev) => [{ ...created, subCategories: created.subCategories ?? [] }, ...prev])
      onAddingCatChange(false)
      setNewCatForm({ displayName: '', slug: '' })
    } catch (err) {
      setNewCatError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setIsSavingCat(false)
    }
  }

  // ── Edit category ─────────────────────────────────────────────────────────

  function startEditCat(catId: string, displayName: string, slug: string) {
    onAddingCatChange(false)
    setEditingCatId(catId)
    setEditCatForm({ displayName, slug })
    setEditCatError(null)
    // Collapse the row while editing to avoid showing subs mid-edit
    setExpandedRows((prev) => { const n = new Set(prev); n.delete(catId); return n })
  }

  function cancelEditCat() {
    setEditingCatId(null)
    setEditCatForm({ displayName: '', slug: '' })
    setEditCatError(null)
  }

  async function saveEditCat(catId: string) {
    if (!editCatForm.displayName.trim()) return
    setIsSavingCat(true)
    setEditCatError(null)
    try {
      const updated: AdminCategory = await updateCategory(catId, {
        displayName: editCatForm.displayName.trim(),
        slug: editCatForm.slug || toSlug(editCatForm.displayName),
      })
      setCats((prev) =>
        prev.map((c) =>
          c.id === catId ? { ...c, displayName: updated.displayName, slug: updated.slug } : c,
        ),
      )
      setEditingCatId(null)
    } catch (err) {
      setEditCatError(err instanceof Error ? err.message : 'Failed to update category')
    } finally {
      setIsSavingCat(false)
    }
  }

  // ── Subcategory ────────────────────────────────────────────────────────────

  function startAddSub(categoryId: string) {
    setEditingSubId(null)
    setAddingSubFor(categoryId)
    setNewSubForm({ displayName: '', slug: '' })
    setNewSubError(null)
  }

  function cancelAddSub() {
    setAddingSubFor(null)
    setNewSubForm({ displayName: '', slug: '' })
    setNewSubError(null)
  }

  async function saveNewSub(categoryId: string) {
    if (!newSubForm.displayName.trim()) return
    setIsSavingSub(true)
    setNewSubError(null)
    try {
      const created: AdminSubCategory = await createSubcategory(categoryId, {
        displayName: newSubForm.displayName.trim(),
        slug: newSubForm.slug || toSlug(newSubForm.displayName),
      })
      setCats((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, subCategories: [...c.subCategories, created] }
            : c,
        ),
      )
      setAddingSubFor(null)
      setNewSubForm({ displayName: '', slug: '' })
    } catch (err) {
      setNewSubError(err instanceof Error ? err.message : 'Failed to save subcategory')
    } finally {
      setIsSavingSub(false)
    }
  }

  function startEditSub(subId: string, displayName: string, slug: string) {
    setAddingSubFor(null)
    setEditingSubId(subId)
    setEditSubForm({ displayName, slug })
    setEditSubError(null)
  }

  function cancelEditSub() {
    setEditingSubId(null)
    setEditSubForm({ displayName: '', slug: '' })
    setEditSubError(null)
  }

  async function saveEditSub(categoryId: string, subId: string) {
    if (!editSubForm.displayName.trim()) return
    setIsSavingSub(true)
    setEditSubError(null)
    try {
      const updated: AdminSubCategory = await updateSubcategory(categoryId, subId, {
        displayName: editSubForm.displayName.trim(),
        slug: editSubForm.slug || toSlug(editSubForm.displayName),
      })
      setCats((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                subCategories: c.subCategories.map((s) =>
                  s.id === subId ? updated : s,
                ),
              }
            : c,
        ),
      )
      setEditingSubId(null)
      setEditSubForm({ displayName: '', slug: '' })
    } catch (err) {
      setEditSubError(err instanceof Error ? err.message : 'Failed to update subcategory')
    } finally {
      setIsSavingSub(false)
    }
  }

  const [deleteSubError, setDeleteSubError] = useState<string | null>(null)

  async function handleDeleteSub(categoryId: string, subId: string) {
    try {
      await deleteSubcategory(categoryId, subId)
      setCats((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, subCategories: c.subCategories.filter((s) => s.id !== subId) }
            : c,
        ),
      )
    } catch (err) {
      setDeleteSubError(err instanceof Error ? err.message : 'Failed to delete subcategory.')
    }
  }

  return (
    <>
      <div className="rounded-[6px] border border-[var(--admin-border)] overflow-hidden bg-[var(--admin-surface)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)] w-[40%]">
                Name
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)]">
                Slug
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)] w-[140px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Inline new category row */}
            {addingCat && (
              <tr className="bg-[var(--admin-surface)] border-b border-[var(--admin-border)]">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <Input
                      value={newCatForm.displayName}
                      onChange={(e) => {
                        const val = e.target.value
                        setNewCatForm((f) => ({
                          displayName: val,
                          slug: f.slug === toSlug(f.displayName) ? toSlug(val) : f.slug,
                        }))
                      }}
                      placeholder="Display name"
                      className="h-7 text-[13px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveNewCat()
                        if (e.key === 'Escape') cancelAddCat()
                      }}
                    />
                    {newCatError && (
                      <span className="text-[11px] text-[var(--admin-destructive)]">{newCatError}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Input
                    value={newCatForm.slug}
                    onChange={(e) =>
                      setNewCatForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    placeholder="slug"
                    className="h-7 text-[13px] font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveNewCat()
                      if (e.key === 'Escape') cancelAddCat()
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 px-2"
                      onClick={saveNewCat}
                      disabled={isSavingCat || !newCatForm.displayName.trim()}
                    >
                      {isSavingCat ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      <span className="ml-1">Save</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={cancelAddCat}
                      disabled={isSavingCat}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}

            {cats.length === 0 && !addingCat && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-[14px] text-[var(--admin-text-muted)]"
                >
                  No categories found.
                </td>
              </tr>
            )}

            {cats.map((cat, catIdx) => {
              const expanded = expandedRows.has(cat.id)
              const isEditingCat = editingCatId === cat.id
              const isLastCat = catIdx === cats.length - 1

              return [
                // ── Category row ──────────────────────────────────────────
                <tr
                  key={cat.id}
                  className={cn(
                    'bg-[var(--admin-surface)] transition-colors duration-100',
                    !isEditingCat && 'hover:bg-[var(--admin-row-hover-bg)]',
                    (!isLastCat || expanded) && 'border-b border-[var(--admin-border)]',
                  )}
                >
                  <td className="px-4 py-3 min-h-[48px]">
                    {isEditingCat ? (
                      <div className="flex flex-col gap-1">
                        <Input
                          value={editCatForm.displayName}
                          onChange={(e) => {
                            const val = e.target.value
                            setEditCatForm((f) => ({
                              displayName: val,
                              slug: f.slug === toSlug(f.displayName) ? toSlug(val) : f.slug,
                            }))
                          }}
                          placeholder="Display name"
                          className="h-7 text-[13px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditCat(cat.id)
                            if (e.key === 'Escape') cancelEditCat()
                          }}
                        />
                        {editCatError && (
                          <span className="text-[11px] text-[var(--admin-destructive)]">{editCatError}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRow(cat.id)}
                          className="shrink-0 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors duration-100"
                          aria-label={expanded ? 'Collapse' : 'Expand'}
                        >
                          {expanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </button>
                        <span className="text-[14px] font-medium text-[var(--admin-text-primary)]">
                          {cat.displayName}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditingCat ? (
                      <Input
                        value={editCatForm.slug}
                        onChange={(e) =>
                          setEditCatForm((f) => ({ ...f, slug: e.target.value }))
                        }
                        placeholder="slug"
                        className="h-7 text-[13px] font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditCat(cat.id)
                          if (e.key === 'Escape') cancelEditCat()
                        }}
                      />
                    ) : (
                      <span className="font-mono text-[12px] text-[var(--admin-text-muted)]">
                        {cat.slug}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditingCat ? (
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => saveEditCat(cat.id)}
                          disabled={isSavingCat || !editCatForm.displayName.trim()}
                        >
                          {isSavingCat ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          <span className="ml-1">Save</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={cancelEditCat}
                          disabled={isSavingCat}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditCat(cat.id, cat.displayName, cat.slug)}
                        >
                          <Pencil className="size-3.5 mr-1" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="px-1.5" />}>
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">More actions</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-[var(--admin-destructive)] focus:text-[var(--admin-destructive)] cursor-pointer"
                              onClick={() => setDeleteTarget(cat)}
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </td>
                </tr>,

                // ── Subcategory rows (when expanded) ──────────────────────
                ...(expanded
                  ? [
                      ...cat.subCategories.map((sub, subIdx) => {
                        const isEditing = editingSubId === sub.id
                        const isLastSub = subIdx === cat.subCategories.length - 1

                        return (
                          <tr
                            key={sub.id}
                            className={cn(
                              'bg-[var(--admin-sidebar-bg)] transition-colors duration-100',
                              !isEditing && 'hover:bg-[var(--admin-sub-row-hover-bg)]',
                              (!isLastSub || addingSubFor === cat.id) && 'border-b border-[var(--admin-border)]',
                            )}
                          >
                            <td className="px-4 py-2.5">
                              {isEditing ? (
                                <div className="pl-6 flex flex-col gap-1">
                                  <Input
                                    value={editSubForm.displayName}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      setEditSubForm((f) => ({
                                        displayName: val,
                                        slug: f.slug === toSlug(f.displayName) ? toSlug(val) : f.slug,
                                      }))
                                    }}
                                    placeholder="Display name"
                                    className="h-7 text-[13px]"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEditSub(cat.id, sub.id)
                                      if (e.key === 'Escape') cancelEditSub()
                                    }}
                                  />
                                  {editSubError && (
                                    <span className="text-[11px] text-[var(--admin-destructive)]">{editSubError}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="pl-8 text-[13px] text-[var(--admin-text-secondary)]">
                                  {sub.displayName}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {isEditing ? (
                                <Input
                                  value={editSubForm.slug}
                                  onChange={(e) =>
                                    setEditSubForm((f) => ({ ...f, slug: e.target.value }))
                                  }
                                  placeholder="slug"
                                  className="h-7 text-[13px] font-mono"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditSub(cat.id, sub.id)
                                    if (e.key === 'Escape') cancelEditSub()
                                  }}
                                />
                              ) : (
                                <span className="font-mono text-[11px] text-[var(--admin-text-muted)]">
                                  {sub.slug}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {isEditing ? (
                                <div className="flex items-center gap-1 justify-end">
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => saveEditSub(cat.id, sub.id)}
                                    disabled={isSavingSub || !editSubForm.displayName.trim()}
                                  >
                                    {isSavingSub ? (
                                      <Loader2 className="size-3 animate-spin" />
                                    ) : (
                                      <Check className="size-3.5" />
                                    )}
                                    <span className="ml-1">Save</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={cancelEditSub}
                                    disabled={isSavingSub}
                                  >
                                    <X className="size-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-[12px]"
                                    onClick={() => startEditSub(sub.id, sub.displayName, sub.slug)}
                                  >
                                    <Pencil className="size-3 mr-1" />
                                    Edit
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="h-7 px-1.5" />}>
                                      <MoreHorizontal className="size-3.5" />
                                      <span className="sr-only">More actions</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        className="text-[var(--admin-destructive)] focus:text-[var(--admin-destructive)] cursor-pointer"
                                        onClick={() =>
                                          setDeleteSubTarget({
                                            categoryId: cat.id,
                                            subId: sub.id,
                                            name: sub.displayName,
                                          })
                                        }
                                      >
                                        <Trash2 className="size-3.5 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      }),

                      // ── Inline add form OR "+ Add subcategory" button ─────
                      addingSubFor === cat.id ? (
                        <tr
                          key={`${cat.id}-add-form`}
                          className="bg-[var(--admin-sidebar-bg)] border-b border-[var(--admin-border)]"
                        >
                          <td className="px-4 py-2.5">
                            <div className="pl-6 flex flex-col gap-1">
                              <Input
                                value={newSubForm.displayName}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setNewSubForm((f) => ({
                                    displayName: val,
                                    slug: f.slug === toSlug(f.displayName) ? toSlug(val) : f.slug,
                                  }))
                                }}
                                placeholder="Display name"
                                className="h-7 text-[13px]"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveNewSub(cat.id)
                                  if (e.key === 'Escape') cancelAddSub()
                                }}
                              />
                              {newSubError && (
                                <span className="text-[11px] text-[var(--admin-destructive)]">{newSubError}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <Input
                              value={newSubForm.slug}
                              onChange={(e) =>
                                setNewSubForm((f) => ({ ...f, slug: e.target.value }))
                              }
                              placeholder="slug"
                              className="h-7 text-[13px] font-mono"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveNewSub(cat.id)
                                if (e.key === 'Escape') cancelAddSub()
                              }}
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => saveNewSub(cat.id)}
                                disabled={isSavingSub || !newSubForm.displayName.trim()}
                              >
                                {isSavingSub ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Check className="size-3.5" />
                                )}
                                <span className="ml-1">Save</span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={cancelAddSub}
                                disabled={isSavingSub}
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={`${cat.id}-add-btn`}
                          className="bg-[var(--admin-sidebar-bg)] border-b border-[var(--admin-border)]"
                        >
                          <td colSpan={3} className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => startAddSub(cat.id)}
                              className="pl-8 flex items-center gap-1.5 text-[12px] font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-primary)] transition-colors duration-100"
                            >
                              <Plus className="size-3.5" />
                              Add subcategory
                            </button>
                          </td>
                        </tr>
                      ),
                    ]
                  : []),
              ]
            })}
          </tbody>
        </table>
      </div>

      <AdminPagination
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => updateParams({ page: String(p) })}
        onLimitChange={(l) => updateParams({ limit: String(l), page: '1' })}
      />

      {/* Category delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete category"
        description={`This will permanently delete "${deleteTarget?.displayName ?? ''}" and all its subcategories.`}
        onConfirm={async () => {
          await deleteCategory(deleteTarget!.id)
          router.refresh()
        }}
      />

      {/* Subcategory delete dialog */}
      <ConfirmDialog
        open={!!deleteSubTarget}
        onOpenChange={(open) => {
          if (!open) { setDeleteSubTarget(null); setDeleteSubError(null) }
        }}
        title="Delete subcategory"
        description={deleteSubError ?? `This will permanently delete "${deleteSubTarget?.name ?? ''}".`}
        onConfirm={() => handleDeleteSub(deleteSubTarget!.categoryId, deleteSubTarget!.subId)}
      />
    </>
  )
}
