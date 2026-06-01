# Cart + Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full cart-to-order flow — localStorage cart, `/cart` page with quantity editing, a 4-step checkout wizard (`/checkout/information → /shipping → /payment → /confirmation`), and Stripe Elements payment in test mode.

**Architecture:** Cart state lives in a React Context persisted to `localStorage`. Checkout form data accumulates in a second Context persisted to `sessionStorage`. Payment uses Stripe Elements; a NestJS `PaymentsModule` creates the PaymentIntent, a Next.js Route Handler proxies to it, and on success `POST /orders` places the order.

**Tech Stack:** Next.js 15 App Router, React Context + useReducer, `@stripe/stripe-js` + `@stripe/react-stripe-js`, NestJS `stripe` npm package, Tailwind + CSS custom properties (design tokens from `globals.css`).

> **No test runner is configured.** All verification steps are manual: start the dev server (`npm run dev`) and follow the click-through instructions. TypeScript checks are done with `npm run lint` (ESLint + TS via `eslint-config-next`).

---

## File Map

### New — Next.js frontend

| Path | Responsibility |
|---|---|
| `lib/cart/CartContext.tsx` | Cart state, `useReducer`, localStorage sync |
| `lib/checkout/CheckoutContext.tsx` | Checkout form state, sessionStorage sync |
| `app/(shop)/cart/page.tsx` | `/cart` page — line items + quantity stepper + order summary |
| `app/(shop)/checkout/layout.tsx` | Provides `CheckoutProvider`, renders `CheckoutShell` |
| `app/(shop)/checkout/CheckoutShell.tsx` | Client shell — breadcrumb + two-column layout + order sidebar |
| `app/(shop)/checkout/information/page.tsx` | Step 1 — contact + shipping address |
| `app/(shop)/checkout/shipping/page.tsx` | Step 2 — shipping method radio cards |
| `app/(shop)/checkout/payment/page.tsx` | Step 3 — Stripe Elements payment form |
| `app/(shop)/checkout/confirmation/page.tsx` | Step 4 — order confirmed display |
| `app/api/payments/create-intent/route.ts` | Route Handler proxy → NestJS PaymentIntent |
| `lib/api/shipping.ts` | `GET /shipping-methods` client function |

### Modified — Next.js frontend

| Path | Change |
|---|---|
| `app/(shop)/layout.tsx` | Wrap children in `<CartProvider>` |
| `components/layout/Navbar.tsx` | Cart badge shows live `itemCount`, icon links to `/cart` |
| `app/(shop)/products/[slug]/ProductDetailClient.tsx` | "Add to Cart" button calls `addItem()` |

### New — NestJS backend (`nest-o2shop`)

| Path | Responsibility |
|---|---|
| `src/payments/dto/create-intent.dto.ts` | `{ amount: number, currency: string }` |
| `src/payments/payments.service.ts` | Stripe SDK — creates PaymentIntent |
| `src/payments/payments.controller.ts` | `POST /payments/stripe/intent` |
| `src/payments/payments.module.ts` | NestJS module |

### Modified — NestJS backend

| Path | Change |
|---|---|
| `src/app.module.ts` | Import `PaymentsModule` |

---

## Task 1: Install dependencies

**Files:** none (package.json changes only)

- [ ] **Step 1: Install Stripe browser SDK in the Next.js project**

```bash
# Run in: C:\Users\hk\Documents\Development\react\next-o2shop
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Expected: both packages appear in `package.json` dependencies. No errors.

- [ ] **Step 2: Install Stripe server SDK in the NestJS project**

```bash
# Run in: C:\Users\hk\Documents\Development\nest\nest-o2shop
npm install stripe
```

Expected: `stripe` appears in `package.json` dependencies.

- [ ] **Step 3: Add environment variables**

In `C:\Users\hk\Documents\Development\react\next-o2shop\.env.local`, add:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_WITH_YOUR_KEY
```

In `C:\Users\hk\Documents\Development\nest\nest-o2shop\.env`, add:

```
STRIPE_SECRET_KEY=sk_test_REPLACE_WITH_YOUR_KEY
```

Get both keys from [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys) (make sure you are in **Test mode**). The publishable key starts with `pk_test_`, the secret key with `sk_test_`.

- [ ] **Step 4: Commit**

```bash
# in next-o2shop
git add package.json package-lock.json .env.local
git commit -m "chore: install stripe browser SDK"
```

---

## Task 2: CartContext

**Files:**
- Create: `lib/cart/CartContext.tsx`

- [ ] **Step 1: Create the file**

```tsx
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
```

- [ ] **Step 2: Lint check**

```bash
npm run lint
```

Expected: no errors in `lib/cart/CartContext.tsx`.

- [ ] **Step 3: Commit**

```bash
git add lib/cart/CartContext.tsx
git commit -m "feat(cart): add CartContext with localStorage persistence"
```

---

## Task 3: Wrap shop layout with CartProvider

**Files:**
- Modify: `app/(shop)/layout.tsx`

- [ ] **Step 1: Update the layout**

```tsx
// app/(shop)/layout.tsx
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart/CartContext";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  );
}
```

- [ ] **Step 2: Lint check**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/"(shop)"/layout.tsx
git commit -m "feat(cart): wrap shop layout with CartProvider"
```

---

## Task 4: Navbar — live cart badge + link to /cart

**Files:**
- Modify: `components/layout/Navbar.tsx`

The Navbar already renders a hardcoded `3` badge on the `ShoppingBag` icon (lines 158–175). Replace that `<button>` with a `<Link>` driven by `useCart`.

- [ ] **Step 1: Add import at the top of the file (after existing imports)**

Find the existing import block (around line 1–11) and add:

```tsx
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
```

`Link` is already imported — only add `useCart`.

- [ ] **Step 2: Read itemCount from the hook**

Inside the `Navbar` function body, just below the existing `const [activeDropdown, ...]` line, add:

```tsx
const { itemCount } = useCart();
```

- [ ] **Step 3: Replace the static ShoppingBag button with a Link**

Find this block (lines ~158–175):

```tsx
<button
  className="relative opacity-80 hover:opacity-100"
  style={{ color: currentColor, transition: "var(--transition-nav)" }}
  aria-label="Cart (3 items)"
>
  <ShoppingBag size={19} strokeWidth={1.75} />
  <span
    className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-white leading-none"
    style={{
      backgroundColor: "var(--color-badge-cart)",
      fontSize: "9px",
      fontFamily: "var(--font-secondary)",
      fontWeight: 700,
    }}
  >
    3
  </span>
</button>
```

Replace it with:

```tsx
<Link
  href="/cart"
  className="relative opacity-80 hover:opacity-100"
  style={{ color: currentColor, transition: "var(--transition-nav)" }}
  aria-label={`Cart (${itemCount} items)`}
>
  <ShoppingBag size={19} strokeWidth={1.75} />
  {itemCount > 0 && (
    <span
      className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-white leading-none"
      style={{
        backgroundColor: "var(--color-badge-cart)",
        fontSize: "9px",
        fontFamily: "var(--font-secondary)",
        fontWeight: 700,
      }}
    >
      {itemCount}
    </span>
  )}
</Link>
```

- [ ] **Step 4: Verify manually**

Start the dev server (`npm run dev`), open `http://localhost:3000`. The cart badge should not appear (cart is empty). Navigate to a product page and check that the badge is hidden. The icon should link to `/cart` (which 404s for now — that's fine).

- [ ] **Step 5: Commit**

```bash
git add components/layout/Navbar.tsx
git commit -m "feat(cart): wire Navbar cart badge to CartContext"
```

---

## Task 5: Wire "Add to Cart" on product detail page

**Files:**
- Modify: `app/(shop)/products/[slug]/ProductDetailClient.tsx`

The "Add to Cart" button exists at line 290 with no `onClick`. We need to call `addItem()` with the selected variant's data.

- [ ] **Step 1: Add useCart import**

At the top of `ProductDetailClient.tsx`, add:

```tsx
import { useCart } from "@/lib/cart/CartContext";
```

- [ ] **Step 2: Get addItem from the hook**

Inside the `ProductDetailClient` function body, just below the existing `useState` hooks, add:

```tsx
const { addItem } = useCart();
```

- [ ] **Step 3: Add handleAddToCart function**

Add this function just before the `return` statement:

```tsx
function handleAddToCart() {
  if (!selectedColor || !selectedSize) return;
  const variant = product.variants.find(
    (v) => v.colorName === selectedColor && v.size === selectedSize,
  );
  if (!variant || !variant.available) return;

  addItem({
    variantId: variant.id,
    productId: product.id,
    productName: product.displayName,
    variantSku: variant.sku,
    colorName: variant.colorName,
    size: variant.size,
    unitPrice: variant.priceOverride ?? product.basePrice,
    quantity: 1,
    imageUrl:
      variant.featuredImage?.url ??
      product.primaryPhoto?.url ??
      undefined,
  });
}
```

- [ ] **Step 4: Wire the button**

Find the "Add to Cart" `<button>` at line 290. Add `onClick` and a `disabled` state:

```tsx
<button
  onClick={handleAddToCart}
  disabled={!selectedColor || !selectedSize}
  className="atc-button w-full font-sans text-[24px] uppercase tracking-widest text-primary-foreground flex items-center"
  style={{
    justifyContent: 'space-between',
    height: "var(--atc-height)",
    borderRadius: "var(--radius-base)",
    transition: "var(--transition-base)",
    border: "none",
    cursor: !selectedColor || !selectedSize ? "not-allowed" : "pointer",
    opacity: !selectedColor || !selectedSize ? 0.6 : 1,
    WebkitTextStroke: '0.6px white',
    padding: '20px'
  }}
>
```

- [ ] **Step 5: Verify manually**

Open any product page. Select a color and size — the button should become active. Click "Add to Cart". The Navbar badge should immediately show `1`. Click again — badge shows `2`. Open `/cart` (still 404) — fine for now. Check `localStorage` in browser DevTools → Application → `o2shop_cart` — the item should be serialised there.

- [ ] **Step 6: Commit**

```bash
git add "app/(shop)/products/[slug]/ProductDetailClient.tsx"
git commit -m "feat(cart): wire Add to Cart button to CartContext"
```

---

## Task 6: /cart page

**Files:**
- Create: `app/(shop)/cart/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
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
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ paddingTop: "var(--header-height-desktop)" }}
      >
        <ShoppingBag
          size={48}
          style={{ color: "var(--color-foreground-subtle)" }}
        />
        <p
          className="font-sans text-[15px] uppercase tracking-widest"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          Your cart is empty
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
    <div
      style={{
        paddingTop: "var(--header-height-desktop)",
        paddingLeft: "var(--header-px-desktop)",
        paddingRight: "var(--header-px-desktop)",
      }}
    >
      {/* Page heading */}
      <div
        className="py-8 border-b"
        style={{ borderColor: "var(--color-border-light)" }}
      >
        <h1
          className="font-sans text-[32px] uppercase tracking-[0.64px] leading-none"
          style={{ color: "var(--color-foreground-dark)" }}
        >
          Your Cart
        </h1>
      </div>

      <div className="py-10 flex flex-col lg:flex-row gap-10">
        {/* ── Line items ── */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                {["Product", "Price", "Quantity", "Total", ""].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-left font-sans text-[11px] uppercase tracking-widest"
                    style={{ color: "var(--color-foreground-subtle)" }}
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
                  className="border-b"
                  style={{ borderColor: "var(--color-border-light)" }}
                >
                  {/* Product */}
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-4">
                      {item.imageUrl && (
                        <div className="w-16 h-16 relative flex-shrink-0 overflow-hidden bg-gray-100">
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
                          {item.colorName} / {item.size}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Unit price */}
                  <td className="py-5 pr-6">
                    <span
                      className="font-sans text-[13px]"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      ${item.unitPrice.toFixed(2)}
                    </span>
                  </td>

                  {/* Quantity stepper */}
                  <td className="py-5 pr-6">
                    <div
                      className="inline-flex items-center border"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        className="w-8 text-center font-sans text-[13px]"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>

                  {/* Line total */}
                  <td className="py-5 pr-6">
                    <span
                      className="font-sans text-[13px]"
                      style={{ color: "var(--color-foreground-dark)" }}
                    >
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </td>

                  {/* Remove */}
                  <td className="py-5">
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="hover:opacity-60 transition-opacity"
                      aria-label="Remove item"
                    >
                      <X
                        size={16}
                        style={{ color: "var(--color-foreground-muted)" }}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Order summary ── */}
        <div className="lg:w-80 flex-shrink-0">
          <div
            className="border p-6"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h2
              className="font-sans text-[13px] uppercase tracking-widest mb-5"
              style={{ color: "var(--color-foreground-dark)" }}
            >
              Order Summary
            </h2>

            <div className="flex justify-between mb-3">
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

            <div className="flex justify-between mb-6">
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
                className="text-sm"
                style={{
                  fontFamily: "var(--font-secondary)",
                  color: "var(--color-foreground-subtle)",
                }}
              >
                Calculated at checkout
              </span>
            </div>

            <Link
              href="/checkout/information"
              className="block w-full text-center font-sans text-[11px] uppercase tracking-widest py-4 transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-foreground-dark)",
                color: "var(--color-on-dark)",
              }}
            >
              Proceed to Checkout
            </Link>

            <p
              className="mt-3 text-center text-[11px]"
              style={{
                fontFamily: "var(--font-secondary)",
                color: "var(--color-foreground-subtle)",
              }}
            >
              Taxes and shipping calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify manually**

Add an item from the product page. Click the cart icon — you should land on `/cart` and see the item. Test:
- `+` button increments quantity and line total updates
- `−` at qty 1 removes the item
- `×` removes the item
- Empty state shows when all items are removed

- [ ] **Step 3: Commit**

```bash
git add "app/(shop)/cart/page.tsx"
git commit -m "feat(cart): add /cart page with quantity stepper"
```

---

## Task 7: Shipping methods API helper

**Files:**
- Create: `lib/api/shipping.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/api/shipping.ts
import clientApi from "./client"

export type ShippingMethod = {
  id: string
  name: string
  price: number
  currency: string
  estimatedDays?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type PaginatedResponse<T> = {
  total: number
  page: number
  limit: number
  data: T[]
}

export async function listShippingMethods(): Promise<ShippingMethod[]> {
  const res = await clientApi.get<PaginatedResponse<ShippingMethod>>(
    "/shipping-methods",
  )
  return res.data.data
}
```

- [ ] **Step 2: Lint check**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/api/shipping.ts
git commit -m "feat(checkout): add listShippingMethods API helper"
```

---

## Task 8: CheckoutContext

**Files:**
- Create: `lib/checkout/CheckoutContext.tsx`

- [ ] **Step 1: Create the file**

```tsx
// lib/checkout/CheckoutContext.tsx
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

const STORAGE_KEY = "o2shop_checkout"

type CheckoutContextValue = {
  checkout: CheckoutState
  updateCheckout: (partial: Partial<CheckoutState>) => void
  clearCheckout: () => void
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null)

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [checkout, setCheckout] = useState<CheckoutState>(INITIAL)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) setCheckout(JSON.parse(stored))
    } catch {
      // ignore corrupt storage
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checkout))
  }, [checkout])

  const updateCheckout = (partial: Partial<CheckoutState>) =>
    setCheckout((prev) => ({ ...prev, ...partial }))

  const clearCheckout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setCheckout(INITIAL)
  }

  return (
    <CheckoutContext.Provider value={{ checkout, updateCheckout, clearCheckout }}>
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext)
  if (!ctx) throw new Error("useCheckout must be used inside CheckoutProvider")
  return ctx
}
```

- [ ] **Step 2: Lint check**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/checkout/CheckoutContext.tsx
git commit -m "feat(checkout): add CheckoutContext with sessionStorage persistence"
```

---

## Task 9: Checkout layout shell

**Files:**
- Create: `app/(shop)/checkout/layout.tsx`
- Create: `app/(shop)/checkout/CheckoutShell.tsx`

- [ ] **Step 1: Create the layout file**

```tsx
// app/(shop)/checkout/layout.tsx
import { CheckoutProvider } from "@/lib/checkout/CheckoutContext"
import CheckoutShell from "./CheckoutShell"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CheckoutProvider>
      <CheckoutShell>{children}</CheckoutShell>
    </CheckoutProvider>
  )
}
```

- [ ] **Step 2: Create CheckoutShell**

```tsx
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
```

- [ ] **Step 3: Lint check**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(shop)/checkout/layout.tsx" "app/(shop)/checkout/CheckoutShell.tsx"
git commit -m "feat(checkout): add checkout layout shell with breadcrumb and order summary"
```

---

## Task 10: Step 1 — /checkout/information

**Files:**
- Create: `app/(shop)/checkout/information/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
// app/(shop)/checkout/information/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCheckout } from "@/lib/checkout/CheckoutContext"
import type { AddressDto } from "@/lib/types"

type AddressFieldsProps = {
  value: Partial<AddressDto>
  onChange: (field: keyof AddressDto, val: string) => void
}

function AddressFields({ value, onChange }: AddressFieldsProps) {
  const input =
    "w-full border px-3 py-2 font-sans text-[13px] outline-none focus:border-foreground-dark bg-transparent"
  const style = { borderColor: "var(--color-border)", color: "var(--color-foreground)" }
  const label = "block font-sans text-[11px] uppercase tracking-widest mb-1"
  const labelStyle = { color: "var(--color-foreground-muted)" }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} style={labelStyle}>First Name *</label>
          <input className={input} style={style} value={value.firstName ?? ""} onChange={(e) => onChange("firstName", e.target.value)} required />
        </div>
        <div>
          <label className={label} style={labelStyle}>Last Name *</label>
          <input className={input} style={style} value={value.lastName ?? ""} onChange={(e) => onChange("lastName", e.target.value)} required />
        </div>
      </div>
      <div>
        <label className={label} style={labelStyle}>Company</label>
        <input className={input} style={style} value={value.company ?? ""} onChange={(e) => onChange("company", e.target.value)} />
      </div>
      <div>
        <label className={label} style={labelStyle}>Address *</label>
        <input className={input} style={style} value={value.address1 ?? ""} onChange={(e) => onChange("address1", e.target.value)} required />
      </div>
      <div>
        <label className={label} style={labelStyle}>Apt, suite, etc.</label>
        <input className={input} style={style} value={value.address2 ?? ""} onChange={(e) => onChange("address2", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} style={labelStyle}>City *</label>
          <input className={input} style={style} value={value.city ?? ""} onChange={(e) => onChange("city", e.target.value)} required />
        </div>
        <div>
          <label className={label} style={labelStyle}>Province / State *</label>
          <input className={input} style={style} value={value.province ?? ""} onChange={(e) => onChange("province", e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} style={labelStyle}>Postal Code *</label>
          <input className={input} style={style} value={value.postalCode ?? ""} onChange={(e) => onChange("postalCode", e.target.value)} required />
        </div>
        <div>
          <label className={label} style={labelStyle}>Country *</label>
          <input className={input} style={style} value={value.country ?? ""} onChange={(e) => onChange("country", e.target.value)} required />
        </div>
      </div>
      <div>
        <label className={label} style={labelStyle}>Phone</label>
        <input className={input} style={style} type="tel" value={value.phone ?? ""} onChange={(e) => onChange("phone", e.target.value)} />
      </div>
    </div>
  )
}

export default function InformationPage() {
  const router = useRouter()
  const { checkout, updateCheckout } = useCheckout()

  const [email, setEmail] = useState(checkout.email)
  const [shipping, setShipping] = useState<Partial<AddressDto>>(
    checkout.shippingAddress ?? {},
  )
  const [billingIsSame, setBillingIsSame] = useState(
    checkout.billingIsSameAsShipping,
  )
  const [billing, setBilling] = useState<Partial<AddressDto>>(
    checkout.billingAddress ?? {},
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateCheckout({
      email,
      firstName: shipping.firstName ?? "",
      lastName: shipping.lastName ?? "",
      shippingAddress: shipping as AddressDto,
      billingIsSameAsShipping: billingIsSame,
      billingAddress: billingIsSame ? null : (billing as AddressDto),
    })
    router.push("/checkout/shipping")
  }

  const heading =
    "font-sans text-[20px] uppercase tracking-widest mb-6"
  const headingStyle = { color: "var(--color-foreground-dark)" }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <h2 className={heading} style={headingStyle}>
        Contact
      </h2>

      <div className="mb-8">
        <label
          className="block font-sans text-[11px] uppercase tracking-widest mb-1"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          Email *
        </label>
        <input
          type="email"
          required
          className="w-full border px-3 py-2 font-sans text-[13px] outline-none bg-transparent"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-foreground)",
          }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <h2 className={heading} style={headingStyle}>
        Shipping Address
      </h2>

      <div className="mb-8">
        <AddressFields
          value={shipping}
          onChange={(field, val) =>
            setShipping((prev) => ({ ...prev, [field]: val }))
          }
        />
      </div>

      <div className="mb-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={billingIsSame}
            onChange={(e) => setBillingIsSame(e.target.checked)}
            className="w-4 h-4"
          />
          <span
            className="font-sans text-[12px] uppercase tracking-widest"
            style={{ color: "var(--color-foreground)" }}
          >
            Billing same as shipping
          </span>
        </label>

        {!billingIsSame && (
          <div className="mt-6">
            <h3
              className="font-sans text-[14px] uppercase tracking-widest mb-4"
              style={{ color: "var(--color-foreground-dark)" }}
            >
              Billing Address
            </h3>
            <AddressFields
              value={billing}
              onChange={(field, val) =>
                setBilling((prev) => ({ ...prev, [field]: val }))
              }
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="font-sans text-[11px] uppercase tracking-widest px-10 py-4 transition-opacity hover:opacity-80"
        style={{
          background: "var(--color-foreground-dark)",
          color: "var(--color-on-dark)",
        }}
      >
        Continue to Shipping
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Verify manually**

Add an item to cart, click "Proceed to Checkout". You should land on `/checkout/information` with the breadcrumb showing **Information** bold and the order summary sidebar on the right. Fill in email + address + click "Continue to Shipping" — it should navigate to `/checkout/shipping` (404 for now). Refresh `/checkout/information` — form should be blank again (sessionStorage is set but the hydration happens in the context, so the state is from the initial empty state on a fresh load — that's correct).

- [ ] **Step 3: Commit**

```bash
git add "app/(shop)/checkout/information/page.tsx"
git commit -m "feat(checkout): add step 1 – contact + shipping address form"
```

---

## Task 11: Step 2 — /checkout/shipping

**Files:**
- Create: `app/(shop)/checkout/shipping/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
// app/(shop)/checkout/shipping/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCheckout } from "@/lib/checkout/CheckoutContext"
import { listShippingMethods, type ShippingMethod } from "@/lib/api/shipping"

export default function ShippingPage() {
  const router = useRouter()
  const { checkout, updateCheckout } = useCheckout()

  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [selected, setSelected] = useState(checkout.shippingMethodId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Guard: step 1 must be complete
  useEffect(() => {
    if (!checkout.email || !checkout.shippingAddress?.address1) {
      router.replace("/checkout/information")
    }
  }, [checkout, router])

  useEffect(() => {
    listShippingMethods()
      .then(setMethods)
      .catch(() => setError("Failed to load shipping methods. Please try again."))
      .finally(() => setLoading(false))
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = methods.find((m) => m.id === selected)
    if (!method) return
    updateCheckout({
      shippingMethodId: method.id,
      shippingMethodName: method.name,
      shippingPrice: method.price,
    })
    router.push("/checkout/payment")
  }

  if (loading) {
    return (
      <p
        className="font-sans text-[13px]"
        style={{ color: "var(--color-foreground-muted)" }}
      >
        Loading shipping methods…
      </p>
    )
  }

  if (error) {
    return (
      <p className="font-sans text-[13px]" style={{ color: "#dc2626" }}>
        {error}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <h2
        className="font-sans text-[20px] uppercase tracking-widest mb-8"
        style={{ color: "var(--color-foreground-dark)" }}
      >
        Shipping Method
      </h2>

      <div className="flex flex-col gap-3 mb-8">
        {methods.map((method) => (
          <label
            key={method.id}
            className="flex items-center justify-between border p-4 cursor-pointer transition-colors"
            style={{
              borderColor:
                selected === method.id
                  ? "var(--color-foreground-dark)"
                  : "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value={method.id}
                checked={selected === method.id}
                onChange={() => setSelected(method.id)}
                className="w-4 h-4 flex-shrink-0"
              />
              <div>
                <p
                  className="font-sans text-[13px] uppercase tracking-widest"
                  style={{ color: "var(--color-foreground-dark)" }}
                >
                  {method.name}
                </p>
                {method.estimatedDays && (
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      fontFamily: "var(--font-secondary)",
                      color: "var(--color-foreground-muted)",
                    }}
                  >
                    {method.estimatedDays} business days
                  </p>
                )}
              </div>
            </div>
            <span
              className="font-sans text-[13px] flex-shrink-0"
              style={{ color: "var(--color-foreground)" }}
            >
              {method.price === 0 ? "Free" : `$${method.price.toFixed(2)}`}
            </span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={!selected}
        className="font-sans text-[11px] uppercase tracking-widest px-10 py-4 transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "var(--color-foreground-dark)",
          color: "var(--color-on-dark)",
        }}
      >
        Continue to Payment
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Verify manually**

Complete step 1, land on `/checkout/shipping`. Shipping methods from the backend should load as radio cards. Selecting one updates the order summary sidebar's shipping line. Clicking "Continue to Payment" navigates to `/checkout/payment` (404 for now). Try navigating directly to `/checkout/shipping` with no prior step data — it should redirect to `/checkout/information`.

- [ ] **Step 3: Commit**

```bash
git add "app/(shop)/checkout/shipping/page.tsx"
git commit -m "feat(checkout): add step 2 – shipping method selection"
```

---

## Task 12: NestJS — Stripe PaymentsModule

**All steps in this task run in the NestJS project at:** `C:\Users\hk\Documents\Development\nest\nest-o2shop`

**Files:**
- Create: `src/payments/dto/create-intent.dto.ts`
- Create: `src/payments/payments.service.ts`
- Create: `src/payments/payments.controller.ts`
- Create: `src/payments/payments.module.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Create the DTO**

```ts
// src/payments/dto/create-intent.dto.ts
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateIntentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  currency: string;
}
```

- [ ] **Step 2: Create the service**

```ts
// src/payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      // If TypeScript reports a type error here, check the installed stripe
      // package version for the valid apiVersion strings and update accordingly.
      apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
  ): Promise<{ clientSecret: string }> {
    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: intent.client_secret! };
  }
}
```

> **Note on apiVersion:** The string `'2024-06-20'` may not match your installed `stripe` package's type definitions. If TypeScript errors, run `npm ls stripe` to see the version and look at the `Stripe.LatestApiVersion` type in `node_modules/stripe/types/index.d.ts` for a valid string. Replace `'2024-06-20'` with any value from that union.

- [ ] **Step 3: Create the controller**

```ts
// src/payments/payments.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateIntentDto } from './dto/create-intent.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe/intent')
  createIntent(@Body() dto: CreateIntentDto) {
    return this.paymentsService.createPaymentIntent(dto.amount, dto.currency);
  }
}
```

- [ ] **Step 4: Create the module**

```ts
// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
```

- [ ] **Step 5: Register in AppModule**

In `src/app.module.ts`, add the import and register it:

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { StorageModule } from './common/storage/storage.module';
import { CollectionsModule } from './collections/collections.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ShippingModule } from './shipping/shipping.module';
import { AddressesModule } from './addresses/addresses.module';
import { OrdersModule } from './orders/orders.module';
import { MeModule } from './me/me.module';
import { ClsModule } from 'nestjs-cls';
import { AuditModule } from './audit/audit.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ClsModule.forRoot({ middleware: { mount: true } }),
    DatabaseModule,
    StorageModule,
    AuthModule,
    CollectionsModule,
    CategoriesModule,
    ProductsModule,
    ReviewsModule,
    ShippingModule,
    AddressesModule,
    OrdersModule,
    MeModule,
    AuditModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 6: Verify the endpoint works**

Start the NestJS dev server:

```bash
npm run start:dev
```

Then test the endpoint with curl or a REST client:

```bash
curl -X POST http://localhost:3001/payments/stripe/intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 1999, "currency": "usd"}'
```

Expected response:
```json
{ "clientSecret": "pi_xxx_secret_xxx" }
```

- [ ] **Step 7: Commit (in nest-o2shop)**

```bash
git add src/payments src/app.module.ts
git commit -m "feat(payments): add Stripe PaymentIntent endpoint"
```

---

## Task 13: Next.js Route Handler — create-intent proxy

**Files:**
- Create: `app/api/payments/create-intent/route.ts`

- [ ] **Step 1: Create the file**

```ts
// app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from "next/server"
import serverApi from "@/lib/api/server"

export async function POST(req: NextRequest) {
  const { amount, currency } = await req.json()
  const res = await serverApi.post<{ clientSecret: string }>(
    "/payments/stripe/intent",
    { amount, currency },
  )
  return NextResponse.json(res.data)
}
```

- [ ] **Step 2: Verify manually**

With both servers running (`npm run dev` for Next.js, `npm run start:dev` for NestJS), send a request from the browser console:

```js
const r = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1999, currency: 'usd' })
})
const data = await r.json()
console.log(data.clientSecret)  // should be "pi_xxx_secret_xxx"
```

- [ ] **Step 3: Commit**

```bash
git add app/api/payments/create-intent/route.ts
git commit -m "feat(checkout): add create-intent route handler proxy"
```

---

## Task 14: Step 3 — /checkout/payment

**Files:**
- Create: `app/(shop)/checkout/payment/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
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

    try {
      const billingAddress = checkout.billingIsSameAsShipping
        ? checkout.shippingAddress
        : checkout.billingAddress

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
            color: "#dc2626",
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

    fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: "usd" }),
    })
      .then((r) => r.json())
      .then((data: { clientSecret: string }) => setClientSecret(data.clientSecret))
      .catch(() => setError("Could not initialise payment. Please go back and try again."))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <p className="font-sans text-[13px]" style={{ color: "#dc2626" }}>
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
```

- [ ] **Step 2: Verify manually — end-to-end test**

Complete steps 1 and 2, arrive on `/checkout/payment`. The Stripe `<PaymentElement>` card form should render. Enter the Stripe test card:

| Field | Value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g. `12/30`) |
| CVC | Any 3 digits (e.g. `123`) |
| ZIP | Any 5 digits (e.g. `10001`) |

Click "Place Order". Expected: Stripe processes the payment, then `POST /orders` fires, cart and checkout state are cleared, and you are redirected to `/checkout/confirmation?order=ORD-xxxx`.

- [ ] **Step 3: Commit**

```bash
git add "app/(shop)/checkout/payment/page.tsx"
git commit -m "feat(checkout): add step 3 – Stripe Elements payment form"
```

---

## Task 15: Step 4 — /checkout/confirmation

**Files:**
- Create: `app/(shop)/checkout/confirmation/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
// app/(shop)/checkout/confirmation/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import clientApi from "@/lib/api/client"
import type { Order } from "@/lib/types"
import OrderStatusBadge from "@/components/account/OrderStatusBadge"
import AddressCard from "@/components/account/AddressCard"

export default function ConfirmationPage() {
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
    <div className="max-w-2xl py-10">
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
```

- [ ] **Step 2: Verify the full flow end-to-end**

Complete the entire flow from scratch:

1. Open `http://localhost:3000/products`
2. Select a product, choose color + size, click "Add to Cart" — badge appears
3. Click the cart icon → `/cart` — item visible, quantity stepper works
4. Click "Proceed to Checkout" → `/checkout/information`
5. Fill in email + shipping address, click "Continue to Shipping"
6. Select a shipping method, click "Continue to Payment"
7. Enter test card `4242 4242 4242 4242`, any future expiry, any CVC
8. Click "Place Order"
9. Should land on `/checkout/confirmation?order=ORD-xxxx`
10. Confirm: order details shown, cart badge gone from Navbar, `localStorage` `o2shop_cart` is empty

- [ ] **Step 3: Final lint check**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(shop)/checkout/confirmation/page.tsx"
git commit -m "feat(checkout): add step 4 – order confirmation page"
```

---

## Done

All 15 tasks complete. The full cart-to-order flow is live:

- `localStorage` cart with live badge in the Navbar
- `/cart` page with quantity stepper and remove
- 4-step checkout wizard with step guards
- Stripe Elements test payment
- `POST /orders` on payment success
- Order confirmation page
