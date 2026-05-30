'use client'

import { useState } from 'react'
import { useAdminUrlParams } from '@/hooks/useAdminUrlParams'
import { useInlineEditForm } from '@/hooks/useInlineEditForm'
import { formatAmount } from '@/lib/admin/formatters'
import { MoreHorizontal, Pencil, Trash2, Plus, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminBadge from '@/components/admin/AdminBadge'
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
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  type ShippingMethod,
  type CreateShippingMethodDto,
} from '@/lib/api/admin-shipping'

interface ShippingContentProps {
  methods: ShippingMethod[]
  total: number
  page: number
  limit: number
  adding: boolean
  onAddingChange: (v: boolean) => void
}

const EMPTY_FORM: CreateShippingMethodDto = {
  name: '',
  price: 0,
  currency: 'USD',
  estimatedDays: undefined,
  isActive: true,
}

export default function ShippingContent({ methods, total, page, limit, adding, onAddingChange }: ShippingContentProps) {
  const updateParams = useAdminUrlParams()

  const [prev, setPrev] = useState(methods)
  const [items, setItems] = useState<ShippingMethod[]>(methods)
  if (prev !== methods) {
    setPrev(methods)
    setItems(methods)
  }

  const {
    newForm, setNewForm, newError, setNewError, isSavingNew, setIsSavingNew, resetNewForm,
    editingId, editForm, setEditForm, editError, setEditError, isSavingEdit, setIsSavingEdit,
    startEdit: startEditForm, cancelEdit,
    deleteTarget, setDeleteTarget,
    resetOnAddOpen,
  } = useInlineEditForm<CreateShippingMethodDto, ShippingMethod>(EMPTY_FORM)

  // ── New method ─────────────────────────────────────────────────────────────

  const [prevAdding, setPrevAdding] = useState(adding)
  if (prevAdding !== adding) {
    setPrevAdding(adding)
    if (adding) resetOnAddOpen()
  }

  function cancelAdd() {
    onAddingChange(false)
    resetNewForm()
  }

  async function saveNew() {
    if (!newForm.name.trim()) return
    setIsSavingNew(true)
    setNewError(null)
    try {
      const created = await createShippingMethod({
        ...newForm,
        name: newForm.name.trim(),
        currency: newForm.currency.trim().toUpperCase(),
        estimatedDays: newForm.estimatedDays || undefined,
      })
      setItems((prev) => [created, ...prev])
      onAddingChange(false)
      resetNewForm()
    } catch (err) {
      setNewError(err instanceof Error ? err.message : 'Failed to create shipping method')
    } finally {
      setIsSavingNew(false)
    }
  }

  // ── Edit method ────────────────────────────────────────────────────────────

  function startEdit(method: ShippingMethod) {
    onAddingChange(false)
    startEditForm(method.id, {
      name: method.name,
      price: method.price,
      currency: method.currency,
      estimatedDays: method.estimatedDays,
      isActive: method.isActive,
    })
  }

  async function saveEdit(id: string) {
    if (!editForm.name.trim()) return
    setIsSavingEdit(true)
    setEditError(null)
    try {
      const updated = await updateShippingMethod(id, {
        ...editForm,
        name: editForm.name.trim(),
        currency: editForm.currency.trim().toUpperCase(),
        estimatedDays: editForm.estimatedDays || undefined,
      })
      setItems((prev) => prev.map((m) => (m.id === id ? updated : m)))
      cancelEdit()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update shipping method')
    } finally {
      setIsSavingEdit(false)
    }
  }

  return (
    <>
      <div className="rounded-[6px] border border-[var(--admin-border)] overflow-hidden bg-[var(--admin-surface)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)] w-[30%]">
                Name
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)] w-[18%]">
                Price
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)] w-[18%]">
                Est. Delivery
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)] w-[14%]">
                Status
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--admin-text-secondary)] w-[140px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Inline new row */}
            {adding && (
              <tr className="bg-[var(--admin-surface)] border-b border-[var(--admin-border)]">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <Input
                      value={newForm.name}
                      onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Method name"
                      className="h-7 text-[13px]"
                      autoFocus
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
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={newForm.price}
                      onChange={(e) => setNewForm((f) => ({ ...f, price: Number(e.target.value) }))}
                      placeholder="0.00"
                      className="h-7 text-[13px] w-20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveNew()
                        if (e.key === 'Escape') cancelAdd()
                      }}
                    />
                    <Input
                      value={newForm.currency}
                      onChange={(e) => setNewForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
                      placeholder="USD"
                      maxLength={3}
                      className="h-7 text-[13px] w-14 font-mono uppercase"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveNew()
                        if (e.key === 'Escape') cancelAdd()
                      }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      value={newForm.estimatedDays ?? ''}
                      onChange={(e) =>
                        setNewForm((f) => ({
                          ...f,
                          estimatedDays: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      placeholder="Days"
                      className="h-7 text-[13px] w-16"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveNew()
                        if (e.key === 'Escape') cancelAdd()
                      }}
                    />
                    <span className="text-[11px] text-[var(--admin-text-muted)]">days</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newForm.isActive ?? true}
                      onChange={(e) => setNewForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="size-3.5 rounded accent-[var(--admin-primary)]"
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
                      disabled={isSavingNew || !newForm.name.trim() || !newForm.currency.trim()}
                    >
                      {isSavingNew ? (
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
                      disabled={isSavingNew}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}

            {items.length === 0 && !adding && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-[14px] text-[var(--admin-text-muted)]"
                >
                  No shipping methods found.
                </td>
              </tr>
            )}

            {items.map((method, idx) => {
              const isEditing = editingId === method.id
              const isLast = idx === items.length - 1

              return (
                <tr
                  key={method.id}
                  className={cn(
                    'bg-[var(--admin-surface)] transition-colors duration-100',
                    !isEditing && 'hover:bg-[var(--admin-row-hover-bg)]',
                    !isLast && 'border-b border-[var(--admin-border)]',
                  )}
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex flex-col gap-1">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Method name"
                          className="h-7 text-[13px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(method.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        {editError && (
                          <span className="text-[11px] text-[var(--admin-destructive)]">{editError}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[14px] font-medium text-[var(--admin-text-primary)]">
                        {method.name}
                      </span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, price: Number(e.target.value) }))
                          }
                          placeholder="0.00"
                          className="h-7 text-[13px] w-20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(method.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        <Input
                          value={editForm.currency}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))
                          }
                          placeholder="USD"
                          maxLength={3}
                          className="h-7 text-[13px] w-14 font-mono uppercase"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(method.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-[14px] text-[var(--admin-text-primary)]">
                        {formatAmount(method.price, method.currency)}
                      </span>
                    )}
                  </td>

                  {/* Est. Delivery */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={1}
                          value={editForm.estimatedDays ?? ''}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              estimatedDays: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                          placeholder="Days"
                          className="h-7 text-[13px] w-16"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(method.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        <span className="text-[11px] text-[var(--admin-text-muted)]">days</span>
                      </div>
                    ) : (
                      <span className="text-[14px] text-[var(--admin-text-secondary)]">
                        {method.estimatedDays ? `${method.estimatedDays} days` : '—'}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.isActive ?? true}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                          }
                          className="size-3.5 rounded accent-[var(--admin-primary)]"
                        />
                        <span className="text-[12px] text-[var(--admin-text-secondary)]">Active</span>
                      </label>
                    ) : (
                      <AdminBadge
                        variant={method.isActive ? 'success' : 'neutral'}
                        label={method.isActive ? 'Active' : 'Inactive'}
                      />
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
                          onClick={() => saveEdit(method.id)}
                          disabled={
                            isSavingEdit || !editForm.name.trim() || !editForm.currency.trim()
                          }
                        >
                          {isSavingEdit ? (
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
                          disabled={isSavingEdit}
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
                          onClick={() => startEdit(method)}
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
                              onClick={() => setDeleteTarget(method)}
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
        title="Delete shipping method"
        description={`This will permanently delete "${deleteTarget?.name ?? ''}".`}
        onConfirm={async () => {
          await deleteShippingMethod(deleteTarget!.id)
          setItems((prev) => prev.filter((m) => m.id !== deleteTarget!.id))
        }}
      />
    </>
  )
}
