// app/(shop)/checkout/CheckoutShell.tsx
"use client"

import { usePathname } from "next/navigation"
import { useCart } from "@/lib/cart/CartContext"
import { useCheckout } from "@/lib/checkout/CheckoutContext"

const STEPS = [
  { label: "Information", path: "/checkout/information" },
  { label: "Shipping", path: "/checkout/shipping" },
  { label: "Payment", path: "/checkout/payment" },
]

export default function CheckoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { items, subtotal } = useCart()
  const { checkout } = useCheckout()

  const isConfirmation = pathname === "/checkout/confirmation"
  const activeStepIndex = STEPS.findIndex((s) => s.path === pathname)

  return (
    <div style={{ paddingTop: "var(--header-height-desktop)" }}>
      {/* Breadcrumb */}
      {!isConfirmation && (
        <div
          className="py-4 border-b"
          style={{
            borderColor: "var(--color-border-light)",
            paddingLeft: "var(--header-px-desktop)",
            paddingRight: "var(--header-px-desktop)",
          }}
        >
          <div className="flex items-center gap-3">
            {STEPS.map((step, i) => {
              const isActive = i === activeStepIndex
              const isDone = activeStepIndex > i
              return (
                <span key={step.path} className="flex items-center gap-3">
                  {i > 0 && (
                    <span
                      className="font-sans text-[11px]"
                      style={{ color: "var(--color-foreground-subtle)" }}
                    >
                      ›
                    </span>
                  )}
                  <span
                    className="font-sans text-[11px] uppercase tracking-widest"
                    style={{
                      color: isActive
                        ? "var(--color-foreground-dark)"
                        : isDone
                          ? "var(--color-foreground)"
                          : "var(--color-foreground-subtle)",
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Two-column body */}
      <div
        className="flex flex-col lg:flex-row"
        style={{
          paddingLeft: "var(--header-px-desktop)",
          paddingRight: "var(--header-px-desktop)",
        }}
      >
        {/* Left: active step */}
        <div className="flex-1 py-10 lg:pr-16">{children}</div>

        {/* Right: order summary (hidden on confirmation) */}
        {!isConfirmation && (
          <div
            className="lg:w-96 flex-shrink-0 py-10 border-l lg:pl-10"
            style={{ borderColor: "var(--color-border-light)" }}
          >
            <h3
              className="font-sans text-[13px] uppercase tracking-widest mb-5"
              style={{ color: "var(--color-foreground-dark)" }}
            >
              Order Summary
            </h3>

            <div className="flex flex-col gap-3 mb-5">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex justify-between gap-4"
                >
                  <div>
                    <p
                      className="font-sans text-[12px] uppercase tracking-widest"
                      style={{ color: "var(--color-foreground-dark)" }}
                    >
                      {item.productName}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        fontFamily: "var(--font-secondary)",
                        color: "var(--color-foreground-muted)",
                      }}
                    >
                      {item.colorName} / {item.size} × {item.quantity}
                    </p>
                  </div>
                  <span
                    className="font-sans text-[12px] flex-shrink-0"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="border-t pt-4 flex flex-col gap-2"
              style={{ borderColor: "var(--color-border-light)" }}
            >
              <div className="flex justify-between">
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-secondary)",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  Subtotal
                </span>
                <span
                  className="font-sans text-[13px]"
                  style={{ color: "var(--color-foreground)" }}
                >
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-secondary)",
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  Shipping
                </span>
                <span
                  className="font-sans text-[13px]"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {checkout.shippingMethodId
                    ? checkout.shippingPrice === 0
                      ? "Free"
                      : `$${checkout.shippingPrice.toFixed(2)}`
                    : "—"}
                </span>
              </div>
              {checkout.shippingMethodId && (
                <div
                  className="flex justify-between border-t pt-2"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <span
                    className="font-sans text-[13px] uppercase tracking-widest"
                    style={{ color: "var(--color-foreground-dark)" }}
                  >
                    Total
                  </span>
                  <span
                    className="font-sans text-[15px]"
                    style={{ color: "var(--color-foreground-dark)" }}
                  >
                    ${(subtotal + checkout.shippingPrice).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
