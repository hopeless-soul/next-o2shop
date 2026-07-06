'use client'

import { useState } from 'react'
import type { SavedAddress } from '@/lib/types'
import type { SaveAddressPayload } from '@/lib/api/addresses'
import { createAddressAction, updateAddressAction, deleteAddressAction } from '@/app/(shop)/account/actions'
import AddressCard from './AddressCard'
import AddressFormModal from './AddressFormModal'

interface AddressesSectionProps {
  initialAddresses: SavedAddress[]
}

export default function AddressesSection({ initialAddresses }: AddressesSectionProps) {
  // Local states
  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses)
  const [modal, setModal] = useState<null | 'new' | SavedAddress>(null)
  const [deletePending, setDeletePending] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Handles saving a new or updated address, then updates the local state.
  async function handleSave(payload: SaveAddressPayload) {
    if (modal === 'new') {
      const created = await createAddressAction(payload)
      setAddresses(prev => [...prev, created])
    } else if (modal && typeof modal !== 'string') {
      const updated = await updateAddressAction(modal.id, payload)
      setAddresses(prev => prev.map(a => (a.id === updated.id ? updated : a)))
    }
    setModal(null)
  }

  // Handles deleting an address, then updates the local state.
  async function handleDelete(id: string) {
    setDeletePending(id)
    try {
      await deleteAddressAction(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } finally {
      setDeletePending(null)
      setDeleteConfirm(null)
    }
  }

  return (
    <>
      {/* 'Saved Addresses' + trigger for the "add address" modal */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-sans text-[18px] uppercase tracking-[0.36px] text-foreground-dark">
          Saved Addresses
        </h2>
        <button
          onClick={() => setModal('new')}
          className="font-sans text-[11px] uppercase tracking-widest px-4 py-2 border border-border rounded-[var(--radius-base)] text-foreground-muted hover:opacity-70"
          style={{ transition: 'var(--transition-base)' }}
        >
          + Add Address
        </button>
      </div>

      {/* Empty state */}
      {addresses.length === 0 && (
        <p className="text-sm font-secondary text-foreground-subtle">
          No saved addresses yet.
        </p>
      )}

      {/* Address grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {addresses.map(addr => (
          <div key={addr.id} className="relative">
            <AddressCard
              address={addr.shippingAddress}
              heading={addr.name}
              editable
              onEdit={() => setModal(addr)}
              onDelete={() => setDeleteConfirm(addr.id)}
            />
            {/* Delete confirmation overlay, shown in place of the card for the address being removed */}
            {deleteConfirm === addr.id && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.96)' }}
              >
                <p className="text-sm text-center font-secondary text-foreground">
                  Remove this address?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletePending === addr.id}
                    className="font-sans text-[11px] uppercase tracking-widest px-3 py-1.5 bg-destructive text-white hover:opacity-80 disabled:opacity-40"
                    style={{ transition: 'var(--transition-base)' }}
                  >
                    {deletePending === addr.id ? 'Removing…' : 'Remove'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deletePending === addr.id}
                    className="font-sans text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border text-foreground-muted hover:opacity-70 disabled:opacity-40"
                    style={{ transition: 'var(--transition-base)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/edit modal, shared between the "new" and per-address edit flows */}
      {modal !== null && (
        <AddressFormModal
          address={modal === 'new' ? undefined : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
