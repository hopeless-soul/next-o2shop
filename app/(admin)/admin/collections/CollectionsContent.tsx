'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Loader2,
} from 'lucide-react'
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
  createCollection,
  updateCollection,
  deleteCollection,
  type AdminCollection,
} from '@/lib/api/admin-collections'

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

type CollectionForm = {
  displayName: string
  slug: string
  description: string
  isActive: boolean
}

const emptyForm: CollectionForm = { displayName: '', slug: '', description: '', isActive: true }

interface CollectionsContentProps {
  collections: AdminCollection[]
  total: number
  page: number
  limit: number
  adding: boolean
  onAddingChange: (v: boolean) => void
}

export default function CollectionsContent({
  collections,
  total,
  page,
  limit,
  adding,
  onAddingChange,
}: CollectionsContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [prevCollections, setPrevCollections] = useState(collections)
  const [cols, setCols] = useState<AdminCollection[]>(collections)
  if (prevCollections !== collections) {
    setPrevCollections(collections)
    setCols(collections)
  }

  const [newForm, setNewForm] = useState<CollectionForm>(emptyForm)
  const [newError, setNewError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<CollectionForm>(emptyForm)
  const [editError, setEditError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<AdminCollection | null>(null)

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
    router.replace(`/admin/collections?${params.toString()}`)
  }

  // ── New collection ──────────────────────────────────────────────────────

  const [prevAdding, setPrevAdding] = useState(adding)
  if (prevAdding !== adding) {
    setPrevAdding(adding)
    if (adding) {
      setEditingId(null)
      setNewError(null)
    }
  }

  function cancelAdd() {
    onAddingChange(false)
    setNewForm(emptyForm)
    setNewError(null)
  }

  async function saveNew() {
    if (!newForm.displayName.trim()) return
    setIsSaving(true)
    setNewError(null)
    try {
      const created = await createCollection({
        displayName: newForm.displayName.trim(),
        slug: newForm.slug || toSlug(newForm.displayName),
        description: newForm.description.trim() || undefined,
        isActive: newForm.isActive,
      })
      setCols((prev) => [created, ...prev])
      onAddingChange(false)
      setNewForm(emptyForm)
    } catch (err) {
      setNewError(err instanceof Error ? err.message : 'Failed to create collection')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Edit collection ─────────────────────────────────────────────────────

  function startEdit(col: AdminCollection) {
    onAddingChange(false)
    setEditingId(col.id)
    setEditForm({
      displayName: col.displayName,
      slug: col.slug,
      description: col.description ?? '',
      isActive: col.isActive,
    })
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyForm)
    setEditError(null)
  }

  async function saveEdit(id: string) {
    if (!editForm.displayName.trim()) return
    setIsSaving(true)
    setEditError(null)
    try {
      const updated = await updateCollection(id, {
        displayName: editForm.displayName.trim(),
        slug: editForm.slug || toSlug(editForm.displayName),
        description: editForm.description.trim() || undefined,
        isActive: editForm.isActive,
      })
      setCols((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditingId(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update collection')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="rounded-[6px] border border-[var(--admin-border)] overflow-hidden bg-[var(--admin-surface)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[var(--admin-border)]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)] w-[38%]">
                Name
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)]">
                Slug
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)] w-[100px]">
                Status
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)] w-[140px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Inline add row */}
            {adding && (
              <tr className="bg-[var(--admin-surface)] border-b border-[var(--admin-border)]">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    <Input
                      value={newForm.displayName}
                      onChange={(e) => {
                        const val = e.target.value
                        setNewForm((f) => ({
                          ...f,
                          displayName: val,
                          slug: f.slug === toSlug(f.displayName) ? toSlug(val) : f.slug,
                        }))
                      }}
                      placeholder="Display name"
                      className="h-7 text-[13px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveNew()
                        if (e.key === 'Escape') cancelAdd()
                      }}
                    />
                    <Input
                      value={newForm.description}
                      onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Description (optional)"
                      className="h-7 text-[12px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveNew()
                        if (e.key === 'Escape') cancelAdd()
                      }}
                    />
                    {newError && (
                      <span className="text-[11px] text-[var(--admin-destructive)]">{newError}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Input
                    value={newForm.slug}
                    onChange={(e) => setNewForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="slug"
                    className="h-7 text-[13px] font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveNew()
                      if (e.key === 'Escape') cancelAdd()
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newForm.isActive}
                      onChange={(e) => setNewForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="size-3.5 accent-[var(--admin-primary)]"
                    />
                    <span className="text-[12px] text-[var(--admin-text-secondary)]">Active</span>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 px-2"
                      onClick={saveNew}
                      disabled={isSaving || !newForm.displayName.trim()}
                    >
                      {isSaving ? (
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
                      onClick={cancelAdd}
                      disabled={isSaving}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}

            {cols.length === 0 && !adding && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-[14px] text-[var(--admin-text-muted)]"
                >
                  No collections found.
                </td>
              </tr>
            )}

            {cols.map((col, idx) => {
              const isEditing = editingId === col.id
              const isLast = idx === cols.length - 1

              return (
                <tr
                  key={col.id}
                  className={`bg-[var(--admin-surface)] transition-colors duration-100 ${!isEditing ? 'hover:bg-[#f5f5f5]' : ''} ${!isLast ? 'border-b border-[var(--admin-border)]' : ''}`}
                >
                  {/* Name / Description */}
                  <td className="px-4 py-3 min-h-[48px]">
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5">
                        <Input
                          value={editForm.displayName}
                          onChange={(e) => {
                            const val = e.target.value
                            setEditForm((f) => ({
                              ...f,
                              displayName: val,
                              slug: f.slug === toSlug(f.displayName) ? toSlug(val) : f.slug,
                            }))
                          }}
                          placeholder="Display name"
                          className="h-7 text-[13px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(col.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        <Input
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, description: e.target.value }))
                          }
                          placeholder="Description (optional)"
                          className="h-7 text-[12px]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(col.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        {editError && (
                          <span className="text-[11px] text-[var(--admin-destructive)]">{editError}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-medium text-[var(--admin-text-primary)]">
                          {col.displayName}
                        </span>
                        {col.description && (
                          <span className="text-[12px] text-[var(--admin-text-muted)] line-clamp-1">
                            {col.description}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input
                        value={editForm.slug}
                        onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                        placeholder="slug"
                        className="h-7 text-[13px] font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(col.id)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                      />
                    ) : (
                      <span className="font-mono text-[12px] text-[var(--admin-text-muted)]">
                        {col.slug}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                          }
                          className="size-3.5 accent-[var(--admin-primary)]"
                        />
                        <span className="text-[12px] text-[var(--admin-text-secondary)]">Active</span>
                      </label>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          col.isActive
                            ? 'bg-[#dcfce7] text-[#166534]'
                            : 'bg-[#f3f4f6] text-[var(--admin-text-muted)]'
                        }`}
                      >
                        {col.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => saveEdit(col.id)}
                          disabled={isSaving || !editForm.displayName.trim()}
                        >
                          {isSaving ? (
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
                          onClick={cancelEdit}
                          disabled={isSaving}
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
                          onClick={() => startEdit(col)}
                        >
                          <Pencil className="size-3.5 mr-1" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="sm" className="px-1.5" />}
                          >
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">More actions</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-[var(--admin-destructive)] focus:text-[var(--admin-destructive)] cursor-pointer"
                              onClick={() => setDeleteTarget(col)}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete collection"
        description={`This will permanently delete "${deleteTarget?.displayName ?? ''}".`}
        onConfirm={async () => {
          await deleteCollection(deleteTarget!.id)
          router.refresh()
        }}
      />
    </>
  )
}
