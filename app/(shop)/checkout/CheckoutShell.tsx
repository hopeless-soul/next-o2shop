// app/(shop)/checkout/CheckoutShell.tsx
"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useCart } from "@/lib/cart/CartContext"
import { useCheckout } from "@/lib/checkout/CheckoutContext"
import { cn } from "@/lib/utils"

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
    <div className="pt-[var(--header-height-mobile)] lg:pt-[var(--header-height-desktop)]">
      {/* Breadcrumb */}
      {!isConfirmation && (
        <div
          className="py-4 border-b border-border-light px-[var(--header-px-mobile)] lg:px-[var(--header-px-desktop)]"
        >
          <div className="flex items-center gap-3">
            {STEPS.map((step, i) => {
              const isActive = i === activeStepIndex
              const isDone = activeStepIndex > i
              return (
                <span key={step.path} className="flex items-center gap-3">
                  {i > 0 && (
                    <span
                      className="font-sans text-[11px] text-foreground-subtle"
                    >
                      ›
                    </span>
                  )}
                  <span
                    className={cn(
                      "font-sans text-[11px] uppercase tracking-widest",
                      isActive ? "text-foreground-dark font-bold" : isDone ? "text-foreground" : "text-foreground-subtle"
                    )}
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
      <div className="flex flex-col lg:flex-row px-[var(--header-px-mobile)] lg:px-[var(--header-px-desktop)]">
        {/* Left: active step */}
        <div
          className={cn(
            isConfirmation ? "w-full flex justify-center py-10" : "flex-1 py-10 lg:pr-16"
          )}
        >
          {children}
        </div>

        {/* Right: order summary (hidden on confirmation) */}
        {!isConfirmation && (
          <div
            className="lg:w-96 flex-shrink-0 py-10 border-l border-border-light lg:pl-10"
          >
            <h3
              className="font-sans text-[13px] uppercase tracking-widest mb-5 text-foreground-dark"
            >
              Order Summary
            </h3>

            <div className="flex flex-col gap-3 mb-5">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center gap-3"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative size-16 flex-shrink-0 overflow-hidden rounded-sm"
                    style={{ backgroundColor: "var(--color-surface-subtle)" }}
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : null}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-sans text-[12px] uppercase tracking-widest text-foreground-dark"
                    >
                      {item.productName}
                    </p>
                    <p
                      className="text-xs mt-0.5 font-secondary text-foreground-muted"
                    >
                      {item.colorName} / {item.size} × {item.quantity}
                    </p>
                  </div>

                  {/* Price */}
                  <span
                    className="font-sans text-[12px] flex-shrink-0 text-foreground"
                  >
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="border-t border-border-light pt-4 flex flex-col gap-2"
            >
              <div className="flex justify-between">
                <span
                  className="text-sm font-secondary text-foreground-muted"
                >
                  Subtotal
                </span>
                <span
                  className="font-sans text-[13px] text-foreground"
                >
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className="text-sm font-secondary text-foreground-muted"
                >
                  Shipping
                </span>
                <span
                  suppressHydrationWarning
                  className="font-sans text-[13px] text-foreground"
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
                  className="flex justify-between border-t border-border pt-2"
                >
                  <span
                    className="font-sans text-[13px] uppercase tracking-widest text-foreground-dark"
                  >
                    Total
                  </span>
                  <span
                    className="font-sans text-[15px] text-foreground-dark"
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
