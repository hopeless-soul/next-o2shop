// app/(shop)/checkout/information/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCheckout } from "@/lib/checkout/CheckoutContext"
import type { AddressDto } from "@/lib/types"

type AddressFieldsProps = {
  value: Partial<AddressDto>
  onChange: (field: keyof AddressDto, val: string) => void
}

function AddressFields({ value, onChange }: AddressFieldsProps) {
  const input =
    "w-full border px-3 py-2 font-sans text-[13px] outline-none focus:border-foreground-dark bg-transparent"
  const style = { borderColor: "var(--color-border)", color: "var(--color-foreground)" }
  const label = "block font-sans text-[11px] uppercase tracking-widest mb-1"
  const labelStyle = { color: "var(--color-foreground-muted)" }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} style={labelStyle}>First Name *</label>
          <input className={input} style={style} value={value.firstName ?? ""} onChange={(e) => onChange("firstName", e.target.value)} required />
        </div>
        <div>
          <label className={label} style={labelStyle}>Last Name *</label>
          <input className={input} style={style} value={value.lastName ?? ""} onChange={(e) => onChange("lastName", e.target.value)} required />
        </div>
      </div>
      <div>
        <label className={label} style={labelStyle}>Company</label>
        <input className={input} style={style} value={value.company ?? ""} onChange={(e) => onChange("company", e.target.value)} />
      </div>
      <div>
        <label className={label} style={labelStyle}>Address *</label>
        <input className={input} style={style} value={value.address1 ?? ""} onChange={(e) => onChange("address1", e.target.value)} required />
      </div>
      <div>
        <label className={label} style={labelStyle}>Apt, suite, etc.</label>
        <input className={input} style={style} value={value.address2 ?? ""} onChange={(e) => onChange("address2", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} style={labelStyle}>City *</label>
          <input className={input} style={style} value={value.city ?? ""} onChange={(e) => onChange("city", e.target.value)} required />
        </div>
        <div>
          <label className={label} style={labelStyle}>Province / State *</label>
          <input className={input} style={style} value={value.province ?? ""} onChange={(e) => onChange("province", e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} style={labelStyle}>Postal Code *</label>
          <input className={input} style={style} value={value.postalCode ?? ""} onChange={(e) => onChange("postalCode", e.target.value)} required />
        </div>
        <div>
          <label className={label} style={labelStyle}>Country *</label>
          <input className={input} style={style} value={value.country ?? ""} onChange={(e) => onChange("country", e.target.value)} required />
        </div>
      </div>
      <div>
        <label className={label} style={labelStyle}>Phone</label>
        <input className={input} style={style} type="tel" value={value.phone ?? ""} onChange={(e) => onChange("phone", e.target.value)} />
      </div>
    </div>
  )
}

export default function InformationPage() {
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

  const heading = "font-sans text-[20px] uppercase tracking-widest mb-6"
  const headingStyle = { color: "var(--color-foreground-dark)" }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <h2 className={heading} style={headingStyle}>
        Contact
      </h2>

      <div className="mb-8">
        <label
          className="block font-sans text-[11px] uppercase tracking-widest mb-1"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          Email *
        </label>
        <input
          type="email"
          required
          className="w-full border px-3 py-2 font-sans text-[13px] outline-none bg-transparent"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-foreground)",
          }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <h2 className={heading} style={headingStyle}>
        Shipping Address
      </h2>

      <div className="mb-8">
        <AddressFields
          value={shipping}
          onChange={(field, val) =>
            setShipping((prev) => ({ ...prev, [field]: val }))
          }
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
          <span
            className="font-sans text-[12px] uppercase tracking-widest"
            style={{ color: "var(--color-foreground)" }}
          >
            Billing same as shipping
          </span>
        </label>

        {!billingIsSame && (
          <div className="mt-6">
            <h3
              className="font-sans text-[14px] uppercase tracking-widest mb-4"
              style={{ color: "var(--color-foreground-dark)" }}
            >
              Billing Address
            </h3>
            <AddressFields
              value={billing}
              onChange={(field, val) =>
                setBilling((prev) => ({ ...prev, [field]: val }))
              }
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="font-sans text-[11px] uppercase tracking-widest px-10 py-4 transition-opacity hover:opacity-80"
        style={{
          background: "var(--color-foreground-dark)",
          color: "var(--color-on-dark)",
        }}
      >
        Continue to Shipping
      </button>
    </form>
  )
}
