// app/(shop)/checkout/payment/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { useCart } from "@/lib/cart/CartContext"
import { useCheckout } from "@/lib/checkout/CheckoutContext"
import axios from "axios"
import clientApi from "@/lib/api/client"
import type { Order } from "@/lib/types"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
)

function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { checkout, clearCheckout } = useCheckout()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.")
      setProcessing(false)
      return
    }

    if (!checkout.shippingAddress) {
      setError("Shipping address is missing. Please go back and re-enter your details.")
      setProcessing(false)
      return
    }

    try {
      const billingAddress = checkout.billingIsSameAsShipping
        ? checkout.shippingAddress
        : checkout.billingAddress

      if (!billingAddress) {
        setError("Billing address is missing. Please go back to Information.")
        setProcessing(false)
        return
      }

      const res = await clientApi.post<Order>("/orders", {
        email: checkout.email,
        firstName: checkout.firstName,
        lastName: checkout.lastName,
        shippingMethodId: checkout.shippingMethodId,
        shippingAddress: checkout.shippingAddress,
        billingIsSameAsShipping: checkout.billingIsSameAsShipping,
        billingAddress,
        items: items.map((item) => ({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
        })),
      })

      clearCart()
      clearCheckout()
      router.push(`/checkout/confirmation?order=${res.data.orderNumber}`)
    } catch {
      setError(
        "Payment succeeded but order placement failed. Please contact support.",
      )
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <h2
        className="font-sans text-[20px] uppercase tracking-widest mb-8"
        style={{ color: "var(--color-foreground-dark)" }}
      >
        Payment
      </h2>

      <div className="mb-8">
        <PaymentElement />
      </div>

      {error && (
        <p
          className="mb-4 text-sm"
          style={{
            fontFamily: "var(--font-secondary)",
            color: "var(--color-destructive)",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="font-sans text-[11px] uppercase tracking-widest px-10 py-4 transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "var(--color-foreground-dark)",
          color: "var(--color-on-dark)",
        }}
      >
        {processing ? "Processing…" : "Place Order"}
      </button>
    </form>
  )
}

export default function PaymentPage() {
  const router = useRouter()
  const { checkout } = useCheckout()
  const { subtotal } = useCart()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Guard: shipping step must be complete
    if (!checkout.shippingMethodId) {
      router.replace("/checkout/shipping")
      return
    }

    const amount = Math.round((subtotal + checkout.shippingPrice) * 100)

    axios
      .post<{ clientSecret: string }>("/api/payments/create-intent", {
        amount,
        currency: "usd",
      })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch(() => setError("Could not initialise payment. Please go back and try again."))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <p className="font-sans text-[13px]" style={{ color: "var(--color-destructive)" }}>
        {error}
      </p>
    )
  }

  if (!clientSecret) {
    return (
      <p
        className="font-sans text-[13px]"
        style={{ color: "var(--color-foreground-muted)" }}
      >
        Loading payment…
      </p>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm />
    </Elements>
  )
}
