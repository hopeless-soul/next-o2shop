// app/(shop)/cart/page.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, X, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart/CartContext"

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 pt-[var(--header-height-desktop)]"
      >
        <ShoppingBag
          size={48}
          className="text-foreground-subtle"
        />
        <p
          className="font-sans text-[15px] uppercase tracking-widest text-foreground-muted"
        >
          Your cart is empty
        </p>
        <Link
          href="/products"
          className="font-sans text-[11px] uppercase tracking-widest underline text-foreground-dark"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div
      className="pt-[var(--header-height-desktop)] px-[var(--header-px-desktop)]"
    >
      {/* Page heading */}
      <div
        className="py-8 border-b border-border-light"
      >
        <h1
          className="font-sans text-[32px] uppercase tracking-[0.64px] leading-none text-foreground-dark"
        >
          Your Cart
        </h1>
      </div>

      <div className="py-10 flex flex-col lg:flex-row gap-10">
        {/* Line items */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                {["Product", "Price", "Quantity", "Total", ""].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-left font-sans text-[11px] uppercase tracking-widest text-foreground-subtle"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.variantId}
                  className="border-b border-border-light"
                >
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-4">
                      {item.imageUrl && (
                        <div className="w-16 h-16 relative flex-shrink-0 overflow-hidden bg-muted">
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <div>
                        <p
                          className="font-sans text-[13px] uppercase tracking-widest text-foreground-dark"
                        >
                          {item.productName}
                        </p>
                        <p
                          className="text-xs mt-0.5 font-secondary text-foreground-muted"
                        >
                          {item.colorName} / {item.size}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 pr-6">
                    <span
                      className="font-sans text-[13px] text-foreground"
                    >
                      ${item.unitPrice.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-5 pr-6">
                    <div
                      className="inline-flex items-center border border-border"
                    >
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center transition-colors hover:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        className="w-8 text-center font-sans text-[13px] text-foreground"
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center transition-colors hover:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="py-5 pr-6">
                    <span
                      className="font-sans text-[13px] text-foreground-dark"
                    >
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-5">
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="hover:opacity-60 transition-opacity"
                      aria-label="Remove item"
                    >
                      <X
                        size={16}
                        className="text-foreground-muted"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div
            className="border p-6 border-border"
          >
            <h2
              className="font-sans text-[13px] uppercase tracking-widest mb-5 text-foreground-dark"
            >
              Order Summary
            </h2>
            <div className="flex justify-between mb-3">
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
            <div className="flex justify-between mb-6">
              <span
                className="text-sm font-secondary text-foreground-muted"
              >
                Shipping
              </span>
              <span
                className="text-sm font-secondary text-foreground-subtle"
              >
                Calculated at checkout
              </span>
            </div>
            <Link
              href="/checkout/information"
              className="block w-full text-center font-sans text-[11px] uppercase tracking-widest py-4 transition-opacity hover:opacity-80 bg-foreground-dark text-on-dark"
            >
              Proceed to Checkout
            </Link>
            <p
              className="mt-3 text-center text-[11px] font-secondary text-foreground-subtle"
            >
              Taxes and shipping calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
