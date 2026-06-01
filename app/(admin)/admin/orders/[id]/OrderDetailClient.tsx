'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import FormCard from '@/components/admin/FormCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import { formatAmount } from '@/lib/admin/formatters'
import type {
  AdminOrder,
  AdminOrderAddress,
  PaymentStatus,
  FulfillmentStatus,
} from '@/lib/api/admin-orders'
import { updateOrderStatusAction } from './actions'

// ── Internal helpers ─────────────────────────────────────

function AddressBlock({ address }: { address: AdminOrderAddress }) {
  const { firstName, lastName, company, address1, address2, city, province, postalCode, country, phone } = address
  return (
    <div className="space-y-0.5 text-[14px] text-[var(--admin-text-primary)]">
      <p>{firstName} {lastName}</p>
      {company && <p>{company}</p>}
      <p>{address1}</p>
      {address2 && <p>{address2}</p>}
      <p>{city}, {province} {postalCode}</p>
      <p>{country}</p>
      <p className="text-[var(--admin-text-secondary)]">{phone}</p>
    </div>
  )
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

// ── Constants ────────────────────────────────────────────

const PAYMENT_OPTIONS: { label: string; value: PaymentStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
]

const FULFILLMENT_OPTIONS: { label: string; value: FulfillmentStatus }[] = [
  { label: 'Unfulfilled', value: 'unfulfilled' },
  { label: 'Partially Fulfilled', value: 'partially_fulfilled' },
  { label: 'Fulfilled', value: 'fulfilled' },
  { label: 'Cancelled', value: 'cancelled' },
]

// ── Main component ───────────────────────────────────────

interface OrderDetailClientProps {
  order: AdminOrder
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.paymentStatus)
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>(order.fulfillmentStatus)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await updateOrderStatusAction(order.id, { paymentStatus, fulfillmentStatus })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const labelCls = 'block text-[12px] font-medium text-[var(--admin-text-secondary)] mb-1'
  const billingIsSame = addressesMatch(order.shippingAddress, order.billingAddress)

  return (
    <div className="flex gap-6 items-start">

      {/* ── Left column ── */}
      <div className="flex-1 space-y-4 min-w-0">

        {/* Order Items */}
        <FormCard title="Order Items">
          <div className="mt-3">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-6 gap-y-2">
              <span className="text-[12px] text-[var(--admin-text-muted)]">Product</span>
              <span className="text-[12px] text-[var(--admin-text-muted)]">SKU</span>
              <span className="text-[12px] text-[var(--admin-text-muted)] text-right">Qty</span>
              <span className="text-[12px] text-[var(--admin-text-muted)] text-right">Unit Price</span>
              <span className="text-[12px] text-[var(--admin-text-muted)] text-right">Total</span>
              <div className="col-span-5 h-px bg-[var(--admin-border)]" />
              {order.items.map((item) => (
                <React.Fragment key={item.id}>
                  <span className="text-[14px] text-[var(--admin-text-primary)]">{item.productName}</span>
                  <span className="text-[14px] text-[var(--admin-text-secondary)]">{item.productSku}</span>
                  <span className="text-[14px] text-[var(--admin-text-primary)] text-right">{item.quantity}</span>
                  <span className="text-[14px] text-[var(--admin-text-primary)] text-right">
                    {formatAmount(item.productPrice, item.productCurrency)}
                  </span>
                  <span className="text-[14px] font-medium text-[var(--admin-text-primary)] text-right">
                    {formatAmount(item.total, item.productCurrency)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </FormCard>

        {/* Summary */}
        <FormCard title="Summary">
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-[14px]">
              <span className="text-[var(--admin-text-secondary)]">
                Shipping — {order.shippingMethodName}
              </span>
              <span>{formatAmount(order.shippingPrice, order.shippingCurrency)}</span>
            </div>
            <div className="flex justify-between text-[14px] font-semibold border-t border-[var(--admin-border)] pt-2">
              <span>Total</span>
              <span>{formatAmount(order.totalAmount, order.totalCurrency)}</span>
            </div>
          </div>
        </FormCard>

        {/* Status */}
        <FormCard title="Status">
          <div className="mt-3 space-y-3">
            <div>
              <label className={labelCls}>Payment Status</label>
              <Select
                value={paymentStatus}
                onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={labelCls}>Fulfillment Status</label>
              <Select
                value={fulfillmentStatus}
                onValueChange={(v) => setFulfillmentStatus(v as FulfillmentStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FULFILLMENT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {saveError && (
              <p className="text-[13px] text-[var(--admin-destructive)]">{saveError}</p>
            )}
            {saveSuccess && (
              <p className="text-[13px] text-[var(--admin-status-success-fg)]">Status updated.</p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 h-9 px-5 rounded-[4px] text-[14px] font-medium bg-[var(--admin-primary)] text-[var(--admin-text-on-dark)] hover:bg-[var(--admin-primary-hover)] transition-colors duration-150 disabled:opacity-70"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save Status
              </button>
            </div>
          </div>
        </FormCard>
      </div>

      {/* ── Right column ── */}
      <div className="w-[320px] shrink-0 space-y-4">

        {/* Customer */}
        <FormCard title="Customer">
          <div className="mt-3 space-y-1">
            <p className="text-[14px] font-medium text-[var(--admin-text-primary)]">
              {order.email ?? '—'}
            </p>
            {(order.firstName || order.lastName) && (
              <p className="text-[13px] text-[var(--admin-text-secondary)]">
                {[order.firstName, order.lastName].filter(Boolean).join(' ')}
              </p>
            )}
            {order.userId && (
              <Link
                href={`/admin/users/${order.userId}`}
                className="text-[12px] text-[var(--admin-text-muted)] underline hover:text-[var(--admin-text-secondary)]"
              >
                View user account
              </Link>
            )}
          </div>
        </FormCard>

        {/* Shipping Address */}
        <FormCard title="Shipping Address">
          <div className="mt-3">
            <AddressBlock address={order.shippingAddress} />
          </div>
        </FormCard>

        {/* Billing Address */}
        <FormCard title="Billing Address">
          <div className="mt-3">
            {billingIsSame ? (
              <p className="text-[13px] text-[var(--admin-text-muted)]">Same as shipping address</p>
            ) : (
              <AddressBlock address={order.billingAddress} />
            )}
          </div>
        </FormCard>

        {/* Payment refs — only if provider info is present */}
        {order.paymentProviderId && (
          <FormCard title="Payment">
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-[12px] text-[var(--admin-text-muted)]">Provider ID</p>
                <p className="text-[14px] text-[var(--admin-text-primary)] break-all">
                  {order.paymentProviderId}
                </p>
              </div>
              {order.paymentProviderRef && (
                <div>
                  <p className="text-[12px] text-[var(--admin-text-muted)]">Reference</p>
                  <p className="text-[14px] text-[var(--admin-text-primary)] break-all">
                    {order.paymentProviderRef}
                  </p>
                </div>
              )}
            </div>
          </FormCard>
        )}
      </div>
    </div>
  )
}
