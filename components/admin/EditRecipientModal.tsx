'use client'

import { useState, useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import type { AdminOrder, AdminOrderAddress, UpdateRecipientDto } from '@/lib/api/admin-orders'

interface EditRecipientModalProps {
  order: AdminOrder
  onSave: (updated: AdminOrder) => void
  onClose: () => void
  onSubmit: (id: string, dto: UpdateRecipientDto) => Promise<AdminOrder>
}

const EMPTY_ADDRESS: AdminOrderAddress = {
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

function addressesMatch(a: AdminOrderAddress, b: AdminOrderAddress): boolean {
  return (
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.company === b.company &&
    a.address1 === b.address1 &&
    a.address2 === b.address2 &&
    a.city === b.city &&
    a.province === b.province &&
    a.postalCode === b.postalCode &&
    a.country === b.country &&
    a.phone === b.phone
  )
}

function AddressFields({
  prefix,
  values,
  onChange,
}: {
  prefix: string
  values: AdminOrderAddress
  onChange: (field: keyof AdminOrderAddress, value: string) => void
}) {
  const inputCls =
    'w-full border border-[var(--admin-border)] rounded-[4px] px-3 py-2 text-[14px] text-[var(--admin-text-primary)] bg-white outline-none focus:border-[var(--admin-primary)] transition-colors duration-150'
  const labelCls = 'block text-[12px] font-medium text-[var(--admin-text-secondary)] mb-1'

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label htmlFor={`${prefix}-firstName`} className={labelCls}>First name *</label>
        <input id={`${prefix}-firstName`} value={values.firstName} onChange={e => onChange('firstName', e.target.value)} required className={inputCls} />
      </div>
      <div>
        <label htmlFor={`${prefix}-lastName`} className={labelCls}>Last name *</label>
        <input id={`${prefix}-lastName`} value={values.lastName} onChange={e => onChange('lastName', e.target.value)} required className={inputCls} />
      </div>
      <div className="col-span-2">
        <label htmlFor={`${prefix}-company`} className={labelCls}>Company</label>
        <input id={`${prefix}-company`} value={values.company ?? ''} onChange={e => onChange('company', e.target.value)} className={inputCls} />
      </div>
      <div className="col-span-2">
        <label htmlFor={`${prefix}-address1`} className={labelCls}>Address *</label>
        <input id={`${prefix}-address1`} value={values.address1} onChange={e => onChange('address1', e.target.value)} required className={inputCls} />
      </div>
      <div className="col-span-2">
        <label htmlFor={`${prefix}-address2`} className={labelCls}>Apartment, suite, etc.</label>
        <input id={`${prefix}-address2`} value={values.address2 ?? ''} onChange={e => onChange('address2', e.target.value)} className={inputCls} />
      </div>
      <div>
        <label htmlFor={`${prefix}-city`} className={labelCls}>City *</label>
        <input id={`${prefix}-city`} value={values.city} onChange={e => onChange('city', e.target.value)} required className={inputCls} />
      </div>
      <div>
        <label htmlFor={`${prefix}-province`} className={labelCls}>State / Province *</label>
        <input id={`${prefix}-province`} value={values.province} onChange={e => onChange('province', e.target.value)} required className={inputCls} />
      </div>
      <div>
        <label htmlFor={`${prefix}-country`} className={labelCls}>Country *</label>
        <input id={`${prefix}-country`} value={values.country} onChange={e => onChange('country', e.target.value)} required className={inputCls} />
      </div>
      <div>
        <label htmlFor={`${prefix}-postalCode`} className={labelCls}>Postal code *</label>
        <input id={`${prefix}-postalCode`} value={values.postalCode} onChange={e => onChange('postalCode', e.target.value)} required className={inputCls} />
      </div>
      <div className="col-span-2">
        <label htmlFor={`${prefix}-phone`} className={labelCls}>Phone *</label>
        <input id={`${prefix}-phone`} type="tel" value={values.phone ?? ''} onChange={e => onChange('phone', e.target.value)} className={inputCls} />
      </div>
    </div>
  )
}

export default function EditRecipientModal({ order, onSave, onClose, onSubmit }: EditRecipientModalProps) {
  const [email, setEmail] = useState(order.email ?? '')
  const [firstName, setFirstName] = useState(order.firstName ?? '')
  const [lastName, setLastName] = useState(order.lastName ?? '')
  const [shipping, setShipping] = useState<AdminOrderAddress>(order.shippingAddress ?? { ...EMPTY_ADDRESS })
  const [billing, setBilling] = useState<AdminOrderAddress>(order.billingAddress ?? { ...EMPTY_ADDRESS })
  const [billingSame, setBillingSame] = useState(() => addressesMatch(order.shippingAddress, order.billingAddress))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function patchShipping(field: keyof AdminOrderAddress, value: string) {
    setShipping(prev => ({ ...prev, [field]: value }))
  }

  function patchBilling(field: keyof AdminOrderAddress, value: string) {
    setBilling(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const dto: UpdateRecipientDto = {
        email: email || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        shippingAddress: shipping,
        billingAddress: billingSame ? shipping : billing,
      }
      const updated = await onSubmit(order.id, dto)
      onSave(updated)
    } catch {
      setError('Failed to save. Please try again.')
      setPending(false)
    }
  }

  const sectionTitle = 'text-[13px] font-semibold text-[var(--admin-text-primary)] uppercase tracking-wide mb-3'
  const labelCls = 'block text-[12px] font-medium text-[var(--admin-text-secondary)] mb-1'
  const inputCls = 'w-full border border-[var(--admin-border)] rounded-[4px] px-3 py-2 text-[14px] text-[var(--admin-text-primary)] bg-white outline-none focus:border-[var(--admin-primary)] transition-colors duration-150'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[8px] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)] sticky top-0 bg-white z-10">
          <h2 className="text-[16px] font-semibold text-[var(--admin-text-primary)]">Edit Recipient</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--admin-border)] text-[var(--admin-text-muted)] transition-colors duration-150"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-6">
          {/* Customer info */}
          <div>
            <p className={sectionTitle}>Customer</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="rec-email" className={labelCls}>Email</label>
                <input
                  id="rec-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="rec-firstName" className={labelCls}>First name</label>
                <input
                  id="rec-firstName"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="rec-lastName" className={labelCls}>Last name</label>
                <input
                  id="rec-lastName"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div>
            <p className={sectionTitle}>Shipping Address</p>
            <AddressFields prefix="ship" values={shipping} onChange={patchShipping} />
          </div>

          {/* Same as billing toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={billingSame}
              onChange={e => setBillingSame(e.target.checked)}
              className="w-4 h-4"
              style={{ accentColor: 'var(--admin-primary)' }}
            />
            <span className="text-[14px] text-[var(--admin-text-secondary)]">
              Billing address same as shipping
            </span>
          </label>

          {/* Billing address */}
          {!billingSame && (
            <div>
              <p className={sectionTitle}>Billing Address</p>
              <AddressFields prefix="bill" values={billing} onChange={patchBilling} />
            </div>
          )}

          {error && (
            <p className="text-[13px] text-[var(--admin-destructive)]">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 pb-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="h-9 px-4 rounded-[4px] text-[13px] font-medium border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border)] transition-colors duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-2 h-9 px-5 rounded-[4px] text-[14px] font-medium bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] transition-colors duration-150 disabled:opacity-70"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
