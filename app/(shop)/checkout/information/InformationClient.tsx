"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCheckout } from "@/lib/checkout/CheckoutContext"
import type { AddressDto, SavedAddress } from "@/lib/types"

// ── Shared field components ────────────────────────────────────────────────────

type AddressFieldsProps = {
  value: Partial<AddressDto>
  onChange: (field: keyof AddressDto, val: string) => void
}

function AddressFields({ value, onChange }: AddressFieldsProps) {
  const input =
    "w-full border border-border px-3 py-2 font-sans text-[13px] outline-none bg-transparent text-foreground"
  const label = "block font-sans text-[11px] uppercase tracking-widest mb-1 text-foreground-muted"

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>First Name *</label>
          <input className={input} value={value.firstName ?? ""} onChange={(e) => onChange("firstName", e.target.value)} required />
        </div>
        <div>
          <label className={label}>Last Name *</label>
          <input className={input} value={value.lastName ?? ""} onChange={(e) => onChange("lastName", e.target.value)} required />
        </div>
      </div>
      <div>
        <label className={label}>Company</label>
        <input className={input} value={value.company ?? ""} onChange={(e) => onChange("company", e.target.value)} />
      </div>
      <div>
        <label className={label}>Address *</label>
        <input className={input} value={value.address1 ?? ""} onChange={(e) => onChange("address1", e.target.value)} required />
      </div>
      <div>
        <label className={label}>Apt, suite, etc.</label>
        <input className={input} value={value.address2 ?? ""} onChange={(e) => onChange("address2", e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>City *</label>
          <input className={input} value={value.city ?? ""} onChange={(e) => onChange("city", e.target.value)} required />
        </div>
        <div>
          <label className={label}>Province / State *</label>
          <input className={input} value={value.province ?? ""} onChange={(e) => onChange("province", e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>Postal Code *</label>
          <input className={input} value={value.postalCode ?? ""} onChange={(e) => onChange("postalCode", e.target.value)} required />
        </div>
        <div>
          <label className={label}>Country *</label>
          <input className={input} value={value.country ?? ""} onChange={(e) => onChange("country", e.target.value)} required />
        </div>
      </div>
      <div>
        <label className={label}>Phone *</label>
        <input className={input} type="tel" value={value.phone ?? ""} onChange={(e) => onChange("phone", e.target.value)} required />
      </div>
    </div>
  )
}

function SavedAddressCard({
  address,
  selected,
  onUse,
}: {
  address: SavedAddress
  selected: boolean
  onUse: () => void
}) {
  const a = address.shippingAddress
  return (
    <div
      className={cn(
        "p-3 border transition-all",
        selected ? "border-accent" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[12px] uppercase tracking-widest truncate text-foreground-dark">
            {address.name}
          </p>
          <p className="font-sans text-[11px] mt-1 leading-snug text-foreground-muted">
            {a.firstName} {a.lastName}
          </p>
          <p className="font-sans text-[11px] leading-snug text-foreground-muted">
            {a.address1}, {a.city}
          </p>
          <p className="font-sans text-[11px] leading-snug text-foreground-muted">
            {a.province} {a.postalCode}
          </p>
        </div>
        <button
          type="button"
          onClick={onUse}
          className={cn(
            "font-sans text-[10px] uppercase tracking-widest px-3 py-1.5 shrink-0 transition-opacity hover:opacity-80 text-on-dark",
            selected ? "bg-accent" : "bg-foreground-dark"
          )}
        >
          {selected ? "✓ Used" : "Use"}
        </button>
      </div>
    </div>
  )
}

// ── Layout props ───────────────────────────────────────────────────────────────

type LayoutProps = {
  email: string
  setEmail: (v: string) => void
  shipping: Partial<AddressDto>
  setShipping: React.Dispatch<React.SetStateAction<Partial<AddressDto>>>
  billingIsSame: boolean
  setBillingIsSame: (v: boolean) => void
  billing: Partial<AddressDto>
  setBilling: React.Dispatch<React.SetStateAction<Partial<AddressDto>>>
  addresses: SavedAddress[]
  selectedId: string | null
  onUse: (addr: SavedAddress) => void
}

// ── Mobile layout ──────────────────────────────────────────────────────────────

function MobileInformationLayout({
  email, setEmail,
  shipping, setShipping,
  billingIsSame, setBillingIsSame,
  billing, setBilling,
  addresses, selectedId, onUse,
}: LayoutProps) {
  const heading = "font-sans text-[18px] uppercase tracking-widest mb-5 text-foreground-dark"

  return (
    <div className="flex sm:hidden flex-col gap-8">
      {/* Saved addresses first — quickest path for returning users */}
      {addresses.length > 0 && (
        <div>
          <h3 className="font-sans text-[11px] uppercase tracking-widest mb-3 text-foreground-muted">
            Saved Addresses
          </h3>
          <div className="flex flex-col gap-2">
            {addresses.map((addr) => (
              <SavedAddressCard
                key={addr.id}
                address={addr}
                selected={selectedId === addr.id}
                onUse={() => onUse(addr)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      <div>
        <h2 className={heading}>Contact</h2>
        <label className="block font-sans text-[11px] uppercase tracking-widest mb-1 text-foreground-muted">
          Email *
        </label>
        <input
          type="email"
          required
          className="w-full border border-border px-3 py-2 font-sans text-[13px] outline-none bg-transparent text-foreground"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Shipping */}
      <div>
        <h2 className={heading}>Shipping Address</h2>
        <AddressFields
          value={shipping}
          onChange={(field, val) => setShipping((prev) => ({ ...prev, [field]: val }))}
        />
      </div>

      {/* Billing */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={billingIsSame}
            onChange={(e) => setBillingIsSame(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="font-sans text-[12px] uppercase tracking-widest text-foreground">
            Billing same as shipping
          </span>
        </label>
        {!billingIsSame && (
          <div className="mt-6">
            <h3 className="font-sans text-[14px] uppercase tracking-widest mb-4 text-foreground-dark">
              Billing Address
            </h3>
            <AddressFields
              value={billing}
              onChange={(field, val) => setBilling((prev) => ({ ...prev, [field]: val }))}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full font-sans text-[11px] uppercase tracking-widest px-10 py-4 transition-opacity hover:opacity-80 bg-foreground-dark text-on-dark"
      >
        Continue to Shipping
      </button>
    </div>
  )
}

// ── Desktop layout ─────────────────────────────────────────────────────────────

function DesktopInformationLayout({
  email, setEmail,
  shipping, setShipping,
  billingIsSame, setBillingIsSame,
  billing, setBilling,
  addresses, selectedId, onUse,
}: LayoutProps) {
  const heading = "font-sans text-[20px] uppercase tracking-widest mb-6 text-foreground-dark"

  return (
    <div className="hidden sm:flex flex-row gap-8 lg:items-start">
      <div className="flex-1 max-w-xl">
        <h2 className={heading}>Contact</h2>

        <div className="mb-8">
          <label className="block font-sans text-[11px] uppercase tracking-widest mb-1 text-foreground-muted">
            Email *
          </label>
          <input
            type="email"
            required
            className="w-full border border-border px-3 py-2 font-sans text-[13px] outline-none bg-transparent text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <h2 className={heading}>Shipping Address</h2>

        <div className="mb-8">
          <AddressFields
            value={shipping}
            onChange={(field, val) => setShipping((prev) => ({ ...prev, [field]: val }))}
          />
        </div>

        <div className="mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={billingIsSame}
              onChange={(e) => setBillingIsSame(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-sans text-[12px] uppercase tracking-widest text-foreground">
              Billing same as shipping
            </span>
          </label>
          {!billingIsSame && (
            <div className="mt-6">
              <h3 className="font-sans text-[14px] uppercase tracking-widest mb-4 text-foreground-dark">
                Billing Address
              </h3>
              <AddressFields
                value={billing}
                onChange={(field, val) => setBilling((prev) => ({ ...prev, [field]: val }))}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto font-sans text-[11px] uppercase tracking-widest px-10 py-4 transition-opacity hover:opacity-80 bg-foreground-dark text-on-dark"
        >
          Continue to Shipping
        </button>
      </div>

      {addresses.length > 0 && (
        <div className="w-full lg:w-64 shrink-0">
          <h3 className="font-sans text-[11px] uppercase tracking-widest mb-3 text-foreground-muted">
            Saved Addresses
          </h3>
          <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: "360px" }}>
            {addresses.map((addr) => (
              <SavedAddressCard
                key={addr.id}
                address={addr}
                selected={selectedId === addr.id}
                onUse={() => onUse(addr)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────────────────

type Props = {
  addresses: SavedAddress[]
}

export default function InformationClient({ addresses }: Props) {
  const router = useRouter()
  const { checkout, updateCheckout } = useCheckout()

  const [email, setEmail] = useState(checkout.email)
  const [shipping, setShipping] = useState<Partial<AddressDto>>(
    checkout.shippingAddress ?? {},
  )
  const [billingIsSame, setBillingIsSame] = useState(
    checkout.billingIsSameAsShipping,
  )
  const [billing, setBilling] = useState<Partial<AddressDto>>(
    checkout.billingAddress ?? {},
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function handleUse(addr: SavedAddress) {
    setShipping(addr.shippingAddress)
    setBillingIsSame(addr.billingIsSameAsShipping)
    setBilling(addr.billingAddress)
    setSelectedId(addr.id)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateCheckout({
      email,
      firstName: shipping.firstName ?? "",
      lastName: shipping.lastName ?? "",
      shippingAddress: shipping as AddressDto,
      billingIsSameAsShipping: billingIsSame,
      billingAddress: billingIsSame ? null : (billing as AddressDto),
    })
    router.push("/checkout/shipping")
  }

  const layoutProps: LayoutProps = {
    email, setEmail,
    shipping, setShipping,
    billingIsSame, setBillingIsSame,
    billing, setBilling,
    addresses,
    selectedId,
    onUse: handleUse,
  }

  return (
    <form onSubmit={handleSubmit}>
      <MobileInformationLayout {...layoutProps} />
      <DesktopInformationLayout {...layoutProps} />
    </form>
  )
}
