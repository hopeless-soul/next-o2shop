import { CART_STORAGE_KEY } from "@/lib/cart/CartContext"
import { CHECKOUT_STORAGE_KEY } from "@/lib/checkout/CheckoutContext"

// Wipes locally-persisted cart/checkout state on login, register, logout, or
// session expiry, so data never leaks between accounts/guests sharing a browser.
// Pass the real `clearCart()` from `useCart()` when available so in-memory
// React state resets too — otherwise a later write-effect could re-persist
// the stale cart back to localStorage.
export function clearLocalAppState(clearCart?: () => void) {
  if (clearCart) {
    clearCart()
  } else if (typeof window !== "undefined") {
    localStorage.removeItem(CART_STORAGE_KEY)
  }
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY)
  }
}
