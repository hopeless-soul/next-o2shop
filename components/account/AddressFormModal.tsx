'use client'

import { useState } from 'react'
import type { SavedAddress, AddressDto } from '@/lib/types'
import type { SaveAddressPayload } from '@/lib/api/addresses'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

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

function AddressFields({
  prefix,
  values,
  onChange,
}: {
  prefix: string
  values: AddressDto
  onChange: (field: keyof AddressDto, value: string) => void
}) {
  const inputClass =
    'w-full border border-border px-3 py-2 text-sm outline-none focus:border-current font-secondary text-foreground bg-background'
  const labelClass =
    'block font-sans text-[10px] uppercase tracking-widest mb-1 text-foreground-subtle'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label htmlFor={`${prefix}-firstName`} className={labelClass}>
          First name *
        </label>
        <input
          id={`${prefix}-firstName`}
          value={values.firstName}
          onChange={e => onChange('firstName', e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${prefix}-lastName`} className={labelClass}>
          Last name *
        </label>
        <input
          id={`${prefix}-lastName`}
          value={values.lastName}
          onChange={e => onChange('lastName', e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div className="col-span-2">
        <label htmlFor={`${prefix}-company`} className={labelClass}>
          Company
        </label>
        <input
          id={`${prefix}-company`}
          value={values.company ?? ''}
          onChange={e => onChange('company', e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="col-span-2">
        <label htmlFor={`${prefix}-address1`} className={labelClass}>
          Address *
        </label>
        <input
          id={`${prefix}-address1`}
          value={values.address1}
          onChange={e => onChange('address1', e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div className="col-span-2">
        <label htmlFor={`${prefix}-address2`} className={labelClass}>
          Apartment, suite, etc.
        </label>
        <input
          id={`${prefix}-address2`}
          value={values.address2 ?? ''}
          onChange={e => onChange('address2', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${prefix}-city`} className={labelClass}>
          City *
        </label>
        <input
          id={`${prefix}-city`}
          value={values.city}
          onChange={e => onChange('city', e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${prefix}-province`} className={labelClass}>
          State / Province *
        </label>
        <input
          id={`${prefix}-province`}
          value={values.province}
          onChange={e => onChange('province', e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${prefix}-country`} className={labelClass}>
          Country *
        </label>
        <input
          id={`${prefix}-country`}
          value={values.country}
          onChange={e => onChange('country', e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${prefix}-postalCode`} className={labelClass}>
          Postal code *
        </label>
        <input
          id={`${prefix}-postalCode`}
          value={values.postalCode}
          onChange={e => onChange('postalCode', e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div className="col-span-2">
        <label htmlFor={`${prefix}-phone`} className={labelClass}>
          Phone
        </label>
        <input
          id={`${prefix}-phone`}
          type="tel"
          value={values.phone ?? ''}
          onChange={e => onChange('phone', e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  )
}

export default function AddressFormModal({
  address,
  onSave,
  onClose,
}: AddressFormModalProps) {
  const isEditing = !!address

  const [name, setName] = useState(address?.name ?? '')
  const [shipping, setShipping] = useState<AddressDto>(
    address?.shippingAddress ?? { ...EMPTY_ADDRESS },
  )
  const [billing, setBilling] = useState<AddressDto>(
    address?.billingAddress ?? { ...EMPTY_ADDRESS },
  )
  const [billingSame, setBillingSame] = useState(
    address?.billingIsSameAsShipping ?? true,
  )
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useBodyScrollLock()

  function patchShipping(field: keyof AddressDto, value: string) {
    setShipping(prev => ({ ...prev, [field]: value }))
  }

  function patchBilling(field: keyof AddressDto, value: string) {
    setBilling(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      await onSave({
        name,
        shippingAddress: shipping,
        billingAddress: billingSame ? shipping : billing,
        billingIsSameAsShipping: billingSame,
      })
    } catch {
      setError('Something went wrong. Please try again.')
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
            <label
              htmlFor="addr-name"
              className="block font-sans text-[10px] uppercase tracking-widest mb-1 text-foreground-subtle"
            >
              Address label *
            </label>
            <input
              id="addr-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Home, Office"
              required
              className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-current font-secondary text-foreground bg-background"
            />
          </div>

          {/* Shipping address */}
          <div>
            <p className="font-sans text-[12px] uppercase tracking-widest mb-4 text-foreground-dark">
              Shipping Address
            </p>
            <AddressFields prefix="ship" values={shipping} onChange={patchShipping} />
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
              <p className="font-sans text-[12px] uppercase tracking-widest mb-4 text-foreground-dark">
                Billing Address
              </p>
              <AddressFields prefix="bill" values={billing} onChange={patchBilling} />
            </div>
          )}

          {error && (
            <p className="text-sm font-secondary text-destructive">
              {error}
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
