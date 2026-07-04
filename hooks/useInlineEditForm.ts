'use client'

import { useState } from 'react'

/**
 * This hook holds all the state you need to build an admin table where rows
 * can be added, edited, and deleted inline (directly in the table, without a
 * separate page) — for example a products or categories list.
 *
 * It manages three independent workflows, each with its own state:
 * 1. Adding a new row (a form for a not-yet-created item).
 * 2. Editing an existing row in place (only one row can be edited at a time).
 * 3. Confirming deletion of a row (tracks which item is pending confirmation).
 *
 * Because different admin tables have different form fields and item shapes,
 * this hook is generic:
 * - `TForm` is the shape of the editable fields (what the add/edit forms hold).
 * - `TItem` is the shape of a full row/item (used for the delete confirmation,
 *   which needs the whole item, not just its editable fields).
 */
export interface InlineEditFormHandlers<TForm, TItem> {
  // "Add new" row: its own form state, independent of any row being edited.
  newForm: TForm
  setNewForm: React.Dispatch<React.SetStateAction<TForm>>
  newError: string | null
  setNewError: React.Dispatch<React.SetStateAction<string | null>>
  isSavingNew: boolean
  setIsSavingNew: React.Dispatch<React.SetStateAction<boolean>>
  resetNewForm: () => void

  // "Edit existing" row: editingId is null when no row is being edited, which
  // callers use to decide whether a given row renders as static or as a form.
  editingId: string | null
  editForm: TForm
  setEditForm: React.Dispatch<React.SetStateAction<TForm>>
  editError: string | null
  setEditError: React.Dispatch<React.SetStateAction<string | null>>
  isSavingEdit: boolean
  setIsSavingEdit: React.Dispatch<React.SetStateAction<boolean>>
  startEdit: (id: string, form: TForm) => void
  cancelEdit: () => void

  // Item pending delete confirmation (e.g. shown in a confirm dialog).
  deleteTarget: TItem | null
  setDeleteTarget: React.Dispatch<React.SetStateAction<TItem | null>>

  // Call when the "add new" UI is opened, to close any in-progress edit first
  // (only one of add/edit can be active at a time).
  resetOnAddOpen: () => void
}

export function useInlineEditForm<TForm, TItem = unknown>(
  emptyForm: TForm,
): InlineEditFormHandlers<TForm, TItem> {
  const [newForm, setNewForm] = useState<TForm>(emptyForm)
  const [newError, setNewError] = useState<string | null>(null)
  const [isSavingNew, setIsSavingNew] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<TForm>(emptyForm)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<TItem | null>(null)

  // Clears the "add new" form back to its empty state, e.g. after a successful save.
  function resetNewForm() {
    setNewForm(emptyForm)
    setNewError(null)
  }

  // Enters edit mode for a specific row, seeding the edit form with its current values.
  function startEdit(id: string, form: TForm) {
    setEditingId(id)
    setEditForm(form)
    setEditError(null)
  }

  // Exits edit mode without saving, discarding any in-progress edits.
  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyForm)
    setEditError(null)
  }

  // Closes any active edit when the "add new" form is opened, since the UI
  // only shows one inline form (add or edit) at a time.
  function resetOnAddOpen() {
    setEditingId(null)
    setNewError(null)
  }

  return {
    newForm, setNewForm, newError, setNewError, isSavingNew, setIsSavingNew, resetNewForm,
    editingId, editForm, setEditForm, editError, setEditError, isSavingEdit, setIsSavingEdit,
    startEdit, cancelEdit,
    deleteTarget, setDeleteTarget,
    resetOnAddOpen,
  }
}
