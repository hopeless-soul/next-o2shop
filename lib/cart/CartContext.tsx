// lib/cart/CartContext.tsx
"use client"

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
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

type CartState = {
  items: CartItem[]
  itemCount: number
  subtotal: number
}

type CartAction =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_QUANTITY"; variantId: string; qty: number }
  | { type: "REMOVE_ITEM"; variantId: string }
  | { type: "CLEAR_CART" }

function derive(items: CartItem[]): CartState {
  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
  }
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return derive(action.items)

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

    case "UPDATE_QUANTITY": {
      if (action.qty <= 0)
        return derive(state.items.filter((i) => i.variantId !== action.variantId))
      return derive(
        state.items.map((i) =>
          i.variantId === action.variantId ? { ...i, quantity: action.qty } : i,
        ),
      )
    }

    case "REMOVE_ITEM":
      return derive(state.items.filter((i) => i.variantId !== action.variantId))

    case "CLEAR_CART":
      return derive([])

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

const STORAGE_KEY = "o2shop_cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, derive([]))

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) dispatch({ type: "HYDRATE", items: JSON.parse(stored) })
    } catch {
      // ignore corrupt storage
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
        updateQuantity: (variantId, qty) =>
          dispatch({ type: "UPDATE_QUANTITY", variantId, qty }),
        removeItem: (variantId) =>
          dispatch({ type: "REMOVE_ITEM", variantId }),
        clearCart: () => dispatch({ type: "CLEAR_CART" }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
