"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { AddressDto } from "@/lib/types"

export type CheckoutState = {
  email: string
  firstName: string
  lastName: string
  shippingAddress: AddressDto | null
  billingIsSameAsShipping: boolean
  billingAddress: AddressDto | null
  shippingMethodId: string
  shippingMethodName: string
  shippingPrice: number
}

const INITIAL: CheckoutState = {
  email: "",
  firstName: "",
  lastName: "",
  shippingAddress: null,
  billingIsSameAsShipping: true,
  billingAddress: null,
  shippingMethodId: "",
  shippingMethodName: "",
  shippingPrice: 0,
}


type CheckoutContextValue = {
  checkout: CheckoutState
  updateCheckout: (partial: Partial<CheckoutState>) => void
  clearCheckout: () => void
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null)

export const CHECKOUT_STORAGE_KEY = "o2shop_checkout"

function loadFromStorage(): CheckoutState {
  if (typeof window === "undefined") return INITIAL
  try {
    const stored = sessionStorage.getItem(CHECKOUT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as CheckoutState
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return INITIAL
}
export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [checkout, setCheckout] = useState<CheckoutState>(loadFromStorage)

  useEffect(() => {
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkout))
  }, [checkout])

  const updateCheckout = (partial: Partial<CheckoutState>) =>
    setCheckout((prev) => ({ ...prev, ...partial }))

  const clearCheckout = () => {
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY)
    setCheckout(INITIAL)
  }

  return (
    <CheckoutContext.Provider value={{ checkout, updateCheckout, clearCheckout }}>
      {children}
    </CheckoutContext.Provider>
  )
}

// Guards against using the checkout outside <CheckoutProvider>, e.g. forgetting to
// wrap a page/layout, and surfaces it as an explicit error instead of a
// silent null-reference bug at the call site.
export function useCheckout() {
  const ctx = useContext(CheckoutContext)
  if (!ctx) throw new Error("useCheckout must be used inside CheckoutProvider")
  return ctx
}
