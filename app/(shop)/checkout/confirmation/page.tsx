// app/(shop)/checkout/confirmation/page.tsx
"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import clientApi from "@/lib/api/client"
import type { Order } from "@/lib/types"
import OrderStatusBadge from "@/components/account/OrderStatusBadge"
import AddressCard from "@/components/account/AddressCard"

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!orderNumber) return
    clientApi
      .get<Order>(`/orders/${orderNumber}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError(true))
  }, [orderNumber])

  if (!orderNumber || error) {
    return (
      <div className="py-16 text-center">
        <p
          className="font-sans text-[13px] mb-4"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          Order details unavailable.
        </p>
        <Link
          href="/products"
          className="font-sans text-[11px] uppercase tracking-widest underline"
          style={{ color: "var(--color-foreground-dark)" }}
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <CheckCircle
          size={32}
          style={{ color: "var(--color-foreground-dark)" }}
        />
        <div>
          <h1
            className="font-sans text-[28px] uppercase tracking-widest leading-none"
            style={{ color: "var(--color-foreground-dark)" }}
          >
            Order Confirmed
          </h1>
          {order && (
            <p
              className="text-sm mt-1"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-foreground-muted)",
              }}
            >
              #{order.orderNumber}
            </p>
          )}
        </div>
        {order && (
          <div className="ml-auto">
            <OrderStatusBadge status={order.fulfillmentStatus} />
          </div>
        )}
      </div>

      {order ? (
        <>
          {/* Line items */}
          <div className="flex flex-col gap-3 mb-8">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-3"
                style={{ borderColor: "var(--color-border-light)" }}
              >
                <div>
                  <p
                    className="font-sans text-[13px] uppercase tracking-widest"
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
                    SKU: {item.productSku} × {item.quantity}
                  </p>
                </div>
                <span
                  className="font-sans text-[13px]"
                  style={{ color: "var(--color-foreground)" }}
                >
                  ${item.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mb-10 flex flex-col gap-1.5 max-w-xs ml-auto">
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
                ${order.items.reduce((s, i) => s + i.total, 0).toFixed(2)}
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
                Shipping ({order.shippingMethodName})
              </span>
              <span
                className="font-sans text-[13px]"
                style={{ color: "var(--color-foreground)" }}
              >
                {order.shippingPrice === 0
                  ? "Free"
                  : `$${order.shippingPrice.toFixed(2)}`}
              </span>
            </div>
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
                className="font-sans text-[16px]"
                style={{ color: "var(--color-foreground-dark)" }}
              >
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <AddressCard
              address={order.shippingAddress}
              heading="Shipping Address"
            />
            <AddressCard
              address={order.billingAddress}
              heading="Billing Address"
            />
          </div>
        </>
      ) : (
        <p
          className="font-sans text-[13px]"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          Loading order details…
        </p>
      )}

      <Link
        href="/products"
        className="inline-block font-sans text-[11px] uppercase tracking-widest px-8 py-4 transition-opacity hover:opacity-80"
        style={{
          background: "var(--color-foreground-dark)",
          color: "var(--color-on-dark)",
        }}
      >
        Continue Shopping
      </Link>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <p
          className="font-sans text-[13px]"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          Loading…
        </p>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
