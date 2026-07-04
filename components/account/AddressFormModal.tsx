'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SavedAddress, AddressDto } from '@/lib/types'
import type { SaveAddressPayload } from '@/lib/api/addresses'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { addressSchema } from '@/lib/validation/address'
import AddressFields, { labelClass, inputClass } from './AddressFields'

interface AddressFormModalProps {
  address?: SavedAddress
  onSave: (payload: SaveAddressPayload) => Promise<void>
  onClose: () => void
}

const EMPTY_ADDRESS: AddressDto = {
  firstName: '',
  lastName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  country: '',
  province: '',
  postalCode: '',
  phone: '',
}

const sectionHeadingClass =
  'font-sans text-[12px] uppercase tracking-widest mb-4 text-foreground-dark'

// Slide-in modal for creating or editing a saved address (shipping + optional billing).
export default function AddressFormModal({
  address,
  onSave,
  onClose,
}: AddressFormModalProps) {
  const isEditing = !!address

  /**
   * Note: Shipping and billing are two independent forms rather than one nested
   * form: billing is optional (skipped entirely when billingSame is true),
   * so it gets its own resolver/validation instead of a shared schema that
   * has to branch on billingSame internally.
   */
  const shippingForm = useForm<AddressDto>({
    resolver: zodResolver(addressSchema),
    mode: 'onTouched',
    defaultValues: address?.shippingAddress ?? { ...EMPTY_ADDRESS },
  })
  const billingForm = useForm<AddressDto>({
    resolver: zodResolver(addressSchema),
    mode: 'onTouched',
    defaultValues: address?.billingAddress ?? { ...EMPTY_ADDRESS },
  })

  // Local state for the address label, billing toggle, and pending state.
  const [name, setName] = useState(address?.name ?? '')
  const [billingSame, setBillingSame] = useState(
    address?.billingIsSameAsShipping ?? true,
  )
  const [pending, setPending] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Lock body scroll while modal is open, so the background content doesn't scroll. 
  useBodyScrollLock()

  // Validates shipping (and billing, if distinct) then hands the result to onSave.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)

    // Only validate billing when it's actually going to be submitted.
    const shippingValid = await shippingForm.trigger()
    const billingValid = billingSame ? true : await billingForm.trigger()
    if (!shippingValid || !billingValid) return

    setPending(true)
    try {
      const shipping = shippingForm.getValues()
      await onSave({
        name,
        shippingAddress: shipping,
        billingAddress: billingSame ? shipping : billingForm.getValues(),
        billingIsSameAsShipping: billingSame,
      })
    } catch {
      setApiError('Something went wrong. Please try again.')
      setPending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative h-full w-full max-w-md overflow-y-auto flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-background sticky top-0 z-10">
          <h2 className="font-sans text-[16px] uppercase tracking-[0.48px] text-foreground-dark">
            {isEditing ? 'Edit Address' : 'Add Address'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[20px] leading-none hover:opacity-60 text-foreground-muted"
            style={{ transition: 'var(--transition-base)' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-6 py-6 flex-1">
          {/* Address label */}
          <div>
            <label htmlFor="addr-name" className={labelClass}>
              Address label *
            </label>
            <input
              id="addr-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Home, Office"
              required
              className={inputClass}
            />
          </div>

          {/* Shipping address */}
          <div>
            <p className={sectionHeadingClass}>Shipping Address</p>
            <AddressFields form={shippingForm} prefix="shipping" />
          </div>

          {/* Billing same as shipping toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={billingSame}
              onChange={e => setBillingSame(e.target.checked)}
              className="w-4 h-4"
              style={{ accentColor: 'var(--color-foreground-dark)' }}
            />
            <span className="text-sm font-secondary text-foreground-muted">
              Billing address same as shipping
            </span>
          </label>

          {/* Billing address */}
          {!billingSame && (
            <div>
              <p className={sectionHeadingClass}>Billing Address</p>
              <AddressFields form={billingForm} prefix="billing" />
            </div>
          )}

          {apiError && (
            <p className="text-sm font-secondary text-destructive">
              {apiError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-4">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 font-sans text-[11px] uppercase tracking-widest px-4 py-3 hover:opacity-80 disabled:opacity-40 bg-primary text-primary-foreground"
              style={{ transition: 'var(--transition-base)' }}
            >
              {pending ? 'Saving…' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="font-sans text-[11px] uppercase tracking-widest px-4 py-3 border border-border text-foreground-muted hover:opacity-70 disabled:opacity-40"
              style={{ transition: 'var(--transition-base)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
