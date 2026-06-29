// app/(shop)/checkout/payment/page.tsx
"use client"

import { useEffect, useRef, useState } from "react"
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

type PaymentFormProps = {
  orderNumber: string
}

function PaymentForm({ orderNumber }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { clearCart } = useCart()
  const { clearCheckout } = useCheckout()
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

    clearCart()
    clearCheckout()
    router.push(`/checkout/confirmation?order=${orderNumber}`)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <h2 className="font-sans text-[20px] uppercase tracking-widest mb-8 text-foreground-dark">
        Payment
      </h2>

      <div className="mb-8">
        <PaymentElement />
      </div>

      {error && (
        <p className="mb-4 text-sm font-secondary text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="font-sans text-[11px] uppercase tracking-widest px-10 py-4 transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed bg-foreground-dark text-on-dark"
      >
        {processing ? "Processing…" : "Place Order"}
      </button>
    </form>
  )
}

export default function PaymentPage() {
  const router = useRouter()
  const { checkout } = useCheckout()
  const { items } = useCart()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intentCreated = useRef(false)

  useEffect(() => {
    if (intentCreated.current) return
    intentCreated.current = true

    if (!checkout.shippingMethodId) {
      router.replace("/checkout/shipping")
      return
    }

    const billingAddress = checkout.billingIsSameAsShipping
      ? checkout.shippingAddress
      : checkout.billingAddress

    if (!checkout.shippingAddress || !billingAddress) {
      router.replace("/checkout/information")
      return
    }

    // Step 1: create the order (pending payment)
    clientApi
      .post<Order>("/orders", {
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
      .then((orderRes) => {
        setOrderNumber(orderRes.data.orderNumber)
        // Step 2: create payment intent using the order's UUID
        return axios.post<{ clientSecret: string }>("/api/payments/create-intent", {
          orderId: orderRes.data.id,
        })
      })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch(() => setError("Could not initialise payment. Please go back and try again."))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <p className="font-sans text-[13px] text-destructive">
        {error}
      </p>
    )
  }

  if (!clientSecret || !orderNumber) {
    return (
      <p className="font-sans text-[13px] text-foreground-muted">
        Loading payment…
      </p>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm orderNumber={orderNumber} />
    </Elements>
  )
}
