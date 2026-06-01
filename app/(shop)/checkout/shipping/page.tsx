// app/(shop)/checkout/shipping/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCheckout } from "@/lib/checkout/CheckoutContext"
import { listShippingMethods, type ShippingMethod } from "@/lib/api/shipping"

export default function ShippingPage() {
  const router = useRouter()
  const { checkout, updateCheckout } = useCheckout()

  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [selected, setSelected] = useState(checkout.shippingMethodId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Guard: step 1 must be complete
  useEffect(() => {
    if (!checkout.email || !checkout.shippingAddress?.address1) {
      router.replace("/checkout/information")
    }
  }, [checkout, router])

  useEffect(() => {
    listShippingMethods()
      .then(setMethods)
      .catch(() => setError("Failed to load shipping methods. Please try again."))
      .finally(() => setLoading(false))
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = methods.find((m) => m.id === selected)
    if (!method) return
    updateCheckout({
      shippingMethodId: method.id,
      shippingMethodName: method.name,
      shippingPrice: method.price,
    })
    router.push("/checkout/payment")
  }

  if (loading) {
    return (
      <p
        className="font-sans text-[13px]"
        style={{ color: "var(--color-foreground-muted)" }}
      >
        Loading shipping methods…
      </p>
    )
  }

  if (error) {
    return (
      <p className="font-sans text-[13px]" style={{ color: "#dc2626" }}>
        {error}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <h2
        className="font-sans text-[20px] uppercase tracking-widest mb-8"
        style={{ color: "var(--color-foreground-dark)" }}
      >
        Shipping Method
      </h2>

      <div className="flex flex-col gap-3 mb-8">
        {methods.map((method) => (
          <label
            key={method.id}
            className="flex items-center justify-between border p-4 cursor-pointer transition-colors"
            style={{
              borderColor:
                selected === method.id
                  ? "var(--color-foreground-dark)"
                  : "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value={method.id}
                checked={selected === method.id}
                onChange={() => setSelected(method.id)}
                className="w-4 h-4 flex-shrink-0"
              />
              <div>
                <p
                  className="font-sans text-[13px] uppercase tracking-widest"
                  style={{ color: "var(--color-foreground-dark)" }}
                >
                  {method.name}
                </p>
                {method.estimatedDays && (
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      fontFamily: "var(--font-secondary)",
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    {method.estimatedDays} business days
                  </p>
                )}
              </div>
            </div>
            <span
              className="font-sans text-[13px] flex-shrink-0"
              style={{ color: "var(--color-foreground)" }}
            >
              {method.price === 0 ? "Free" : `$${method.price.toFixed(2)}`}
            </span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={!selected}
        className="font-sans text-[11px] uppercase tracking-widest px-10 py-4 transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "var(--color-foreground-dark)",
          color: "var(--color-on-dark)",
        }}
      >
        Continue to Payment
      </button>
    </form>
  )
}
