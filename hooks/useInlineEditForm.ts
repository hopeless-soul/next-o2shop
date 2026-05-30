'use client'

import { useState } from 'react'

export interface InlineEditFormHandlers<TForm, TItem> {
  newForm: TForm
  setNewForm: React.Dispatch<React.SetStateAction<TForm>>
  newError: string | null
  setNewError: React.Dispatch<React.SetStateAction<string | null>>
  isSavingNew: boolean
  setIsSavingNew: React.Dispatch<React.SetStateAction<boolean>>
  resetNewForm: () => void

  editingId: string | null
  editForm: TForm
  setEditForm: React.Dispatch<React.SetStateAction<TForm>>
  editError: string | null
  setEditError: React.Dispatch<React.SetStateAction<string | null>>
  isSavingEdit: boolean
  setIsSavingEdit: React.Dispatch<React.SetStateAction<boolean>>
  startEdit: (id: string, form: TForm) => void
  cancelEdit: () => void

  deleteTarget: TItem | null
  setDeleteTarget: React.Dispatch<React.SetStateAction<TItem | null>>

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

  function resetNewForm() {
    setNewForm(emptyForm)
    setNewError(null)
  }

  function startEdit(id: string, form: TForm) {
    setEditingId(id)
    setEditForm(form)
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyForm)
    setEditError(null)
  }

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
