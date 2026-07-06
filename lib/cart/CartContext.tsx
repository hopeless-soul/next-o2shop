"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react"

export type CartItem = {
  variantId: string
  productId: string
  productName: string
  variantSku: string
  colorName: string
  size: string
  unitPrice: number
  quantity: number
  imageUrl?: string
}

// itemCount/subtotal are derived, so they can never drift out of sync with `items`.
type CartState = {
  items: CartItem[]
  itemCount: number
  subtotal: number
}

// All state transitions the cart reducer supports.
type CartAction =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_QUANTITY"; variantId: string; qty: number }
  | { type: "REMOVE_ITEM"; variantId: string }
  | { type: "CLEAR_CART" }

// Recomputes itemCount/subtotal from a raw items array. Every reducer branch
// funnels its result through this so the two totals are always consistent.
function derive(items: CartItem[]): CartState {
  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
  }
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    // Note: Replaces the whole cart with what was loaded from localStorage on mount.
    case "HYDRATE":
      return derive(action.items)

    // Note: Same variant already in the cart: increment its quantity instead of
    // pushing a duplicate line item.
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.variantId === action.payload.variantId,
      )
      const items = existing
        ? state.items.map((i) =>
          i.variantId === action.payload.variantId
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i,
        )
        : [...state.items, action.payload]
      return derive(items)
    }

    // Note: Dropping quantity to 0 (or below) removes the line item entirely
    // rather than leaving a zero-quantity row in the cart.
    case "UPDATE_QUANTITY": {
      if (action.qty <= 0)
        return derive(state.items.filter((i) => i.variantId !== action.variantId))
      return derive(
        state.items.map((i) =>
          i.variantId === action.variantId ? { ...i, quantity: action.qty } : i,
        ),
      )
    }

    // Note: Drops the matching line item from the cart entirely.
    case "REMOVE_ITEM":
      return derive(state.items.filter((i) => i.variantId !== action.variantId))

    // Note: Empties the cart, e.g. after a successful checkout.
    case "CLEAR_CART":
      return derive([])

    // Note: Unknown action type — return state unchanged.
    default:
      return state
  }
}

type CartContextValue = CartState & {
  addItem: (item: CartItem) => void
  updateQuantity: (variantId: string, qty: number) => void
  removeItem: (variantId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export const CART_STORAGE_KEY = "o2shop_cart"

export function CartProvider({ children }: { children: ReactNode }) {
  // Reducer always starts from an empty cart because localStorage isn't
  // available during SSR/first render; real state is loaded below.
  const [state, dispatch] = useReducer(reducer, derive([]))
  const isHydrated = useRef(false)

  // Runs once on mount to load any previously saved cart from localStorage.
  // Effects run after the write-effect below has already mounted, but since
  // isHydrated.current starts false, that effect's write is skipped until
  // this one finishes — preventing it from clobbering saved data with the
  // initial empty cart.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", items: parsed })
        }
      }
    } catch {
      // ignore corrupt storage
    }
    isHydrated.current = true
  }, [])

  // Persists the cart on every change, but only after hydration has
  // completed — otherwise this would run first (with the empty initial
  // state) and immediately overwrite whatever was saved from a prior visit.
  useEffect(() => {
    if (!isHydrated.current) return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  const value = useMemo(
    () => ({
      ...state,
      addItem: (item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item }),
      updateQuantity: (variantId: string, qty: number) => dispatch({ type: "UPDATE_QUANTITY", variantId, qty }),
      removeItem: (variantId: string) => dispatch({ type: "REMOVE_ITEM", variantId }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    }),
    [state],
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Guards against using the cart outside <CartProvider>, e.g. forgetting to
// wrap a page/layout, and surfaces it as an explicit error instead of a
// silent null-reference bug at the call site.
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
