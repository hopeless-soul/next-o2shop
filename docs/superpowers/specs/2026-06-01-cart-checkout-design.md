# Cart + Checkout Design

**Date:** 2026-06-01  
**Scope:** Client-side cart (localStorage), `/cart` page, 4-step checkout wizard, Stripe Elements payment, order placement via `POST /orders`.

---

## Overview

The cart lives entirely on the client — no backend cart endpoint exists. State is persisted to `localStorage` via a React Context provider. Checkout follows a 4-step URL-segment wizard (`/checkout/information → /checkout/shipping → /checkout/payment → /checkout/confirmation`). Payment uses Stripe Elements in test mode; a new `POST /payments/stripe/intent` endpoint on the NestJS backend creates the PaymentIntent. On payment success, the frontend calls `POST /orders` to place the order.

---

## 1. Cart State

### Context & Provider

**File:** `lib/cart/CartContext.tsx`

Wraps `app/(shop)/layout.tsx` only (not the admin layout).

```ts
type CartItem = {
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
  itemCount: number   // sum of all quantities
  subtotal: number    // sum of unitPrice * quantity
}
```

**Actions:**
- `addItem(item: CartItem)` — adds item or increments quantity if `variantId` already exists
- `updateQuantity(variantId: string, qty: number)` — set exact quantity; `qty === 0` removes the item
- `removeItem(variantId: string)`
- `clearCart()` — called after a successful order

**Persistence:** `useEffect` writes `items` to `localStorage` key `o2shop_cart` on every change. On mount, the provider reads from `localStorage` and hydrates state. `itemCount` and `subtotal` are derived values, not stored.

### Navbar Integration

`components/layout/Navbar.tsx` reads `itemCount` from `CartContext`. The existing `ShoppingBag` icon gains a badge (hidden when `itemCount === 0`) and links to `/cart`.

### Add to Cart Trigger

`app/(shop)/products/[slug]/ProductDetailClient.tsx` — the "Add to Cart" button (currently UI-only) calls `addItem()` with the selected variant's data when a color + size are both chosen.

---

## 2. The `/cart` Page

**File:** `app/(shop)/cart/page.tsx` — Client Component.

### Layout

Two-column on desktop (≥768px), stacked on mobile.

**Left — line items table:**
- Columns: thumbnail, product name + variant (color / size), unit price, quantity stepper, line total, remove button
- Quantity stepper: `−` / `qty` / `+`. Hitting `−` at `qty === 1` removes the item (calls `removeItem`)
- Empty state: "Your cart is empty" message + link to `/products`

**Right — order summary:**
- Subtotal (live from context)
- Shipping line: "Calculated at checkout"
- "Proceed to Checkout" → `/checkout/information`
- Fine print: "Taxes and shipping calculated at checkout"

---

## 3. Checkout Routing & Shared State

### File Structure

```
app/(shop)/checkout/
  layout.tsx               ← shared shell: breadcrumb + order summary sidebar
  information/page.tsx     ← Step 1: contact + shipping address
  shipping/page.tsx        ← Step 2: shipping method selection
  payment/page.tsx         ← Step 3: Stripe Elements
  confirmation/page.tsx    ← Step 4: order placed ✓
```

### CheckoutContext

**File:** `lib/checkout/CheckoutContext.tsx`

Persisted to `sessionStorage` (key: `o2shop_checkout`) so a hard refresh doesn't wipe form data.

```ts
type CheckoutState = {
  // Step 1
  email: string
  firstName: string
  lastName: string
  shippingAddress: AddressDto
  billingIsSameAsShipping: boolean
  billingAddress?: AddressDto

  // Step 2
  shippingMethodId: string
  shippingMethodName: string
  shippingPrice: number

  // Step 3 — set after Stripe confirms
  paymentIntentId?: string
}
```

`CheckoutContext` is provided by `app/(shop)/checkout/layout.tsx`.

### Step Guards

Each step page checks that the required prior-step fields are present in `CheckoutContext`. If not, it redirects to `/checkout/information`. This prevents URL-skipping.

| Page | Required prior data |
|---|---|
| `/checkout/shipping` | `email`, `firstName`, `shippingAddress` |
| `/checkout/payment` | `shippingMethodId` |
| `/checkout/confirmation` | `?order=` query param |

### Checkout Layout Shell

Persistent two-column layout:
- **Left:** active step form
- **Right:** static order summary (cart items, subtotal, selected shipping cost once chosen)
- **Breadcrumb:** `Information › Shipping › Payment` with active step highlighted

---

## 4. Step Pages

### Step 1 — `/checkout/information`

**Contact block:**
- Logged-in user: name + email pre-filled, "Logged in as {name}" with logout link
- Guest: "Sign in" link + "Continue as guest" toggle reveals email field
- Logged-in users with saved addresses: "Use saved address" dropdown pre-fills the shipping form (calls `GET /me/addresses`)

**Shipping address form:** `firstName`, `lastName`, `address1`, `address2`, `city`, `country`, `province`, `postalCode`, `phone`

**Billing:** "Billing same as shipping" checkbox (default checked). Unchecking reveals a second address form.

On submit: saves to `CheckoutContext` + `sessionStorage`, navigates to `/checkout/shipping`.

---

### Step 2 — `/checkout/shipping`

Fetches `GET /shipping-methods` on mount. Renders as a radio card list — each card: method name, description, price, estimated delivery. Selecting a card saves `shippingMethodId`, `shippingMethodName`, and `shippingPrice` to `CheckoutContext`.

"Continue to Payment" navigates to `/checkout/payment`.

---

### Step 3 — `/checkout/payment`

**On mount:**
1. Calls the Next.js Route Handler `POST /api/payments/create-intent` with `{ amount: subtotal + shippingPrice, currency: 'usd' }`
2. Route Handler proxies to `POST /payments/stripe/intent` on the NestJS backend
3. Returns `{ clientSecret }` to the browser

**Renders** `@stripe/react-stripe-js` `<Elements>` with the `clientSecret`, then `<PaymentElement>` inside.

**On submit:**
1. `stripe.confirmPayment({ redirect: 'if_required' })`
2. On Stripe success: calls `POST /orders` via the client Axios instance with:
   - All `CheckoutContext` data (addresses, `shippingMethodId`)
   - If `billingIsSameAsShipping === true`, send `shippingAddress` as `billingAddress` (the API always requires `billingAddress`)
   - Cart items mapped to `CreateOrderItemDto[]` (`productId`, `variantSku`, `quantity`)
   - `email` (required for guest; ignored by backend if authenticated)
3. On order success: calls `clearCart()`, navigates to `/checkout/confirmation?order={orderNumber}`

**Error handling:** Stripe errors shown inline below the `<PaymentElement>`. Order placement errors shown as a toast/inline message.

---

### Step 4 — `/checkout/confirmation`

Reads `?order=` query param. Calls `GET /orders/{orderNumber}` to display the confirmed order. Reuses `OrderStatusBadge` and `AddressCard` components (already built). Shows a "Continue Shopping" link to `/products`.

---

## 5. Backend Addition (NestJS)

### New Module: `src/payments/`

```
src/payments/
  payments.module.ts
  payments.controller.ts    ← POST /payments/stripe/intent
  payments.service.ts       ← Stripe SDK call
  dto/create-intent.dto.ts  ← { amount: number, currency: string }
```

**`POST /payments/stripe/intent`** — no auth required (works for guest checkout). Calls `stripe.paymentIntents.create({ amount, currency, automatic_payment_methods: { enabled: true } })`. Returns `{ clientSecret }`.

### Environment Variables

| Variable | Where |
|---|---|
| `STRIPE_SECRET_KEY=sk_test_...` | NestJS `.env` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` | Next.js `.env.local` |

Both from Stripe Dashboard → Test mode → API keys (free, no real charges).

### Next.js Route Handler

**File:** `app/api/payments/create-intent/route.ts`

Thin proxy: receives `{ amount, currency }` from browser, forwards to NestJS backend using the server Axios instance (keeps NestJS URL hidden from the client), returns `{ clientSecret }`.

### New Frontend Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install stripe   # in the NestJS project
```

---

## 6. File Inventory

### New files — Next.js frontend

| File | Purpose |
|---|---|
| `lib/cart/CartContext.tsx` | Cart state + localStorage sync |
| `lib/checkout/CheckoutContext.tsx` | Checkout form state + sessionStorage sync |
| `app/(shop)/cart/page.tsx` | Cart page |
| `app/(shop)/checkout/layout.tsx` | Checkout shell (breadcrumb + summary) |
| `app/(shop)/checkout/information/page.tsx` | Step 1 |
| `app/(shop)/checkout/shipping/page.tsx` | Step 2 |
| `app/(shop)/checkout/payment/page.tsx` | Step 3 |
| `app/(shop)/checkout/confirmation/page.tsx` | Step 4 |
| `app/api/payments/create-intent/route.ts` | Route Handler proxy |
| `lib/api/shipping.ts` | `GET /shipping-methods` client function |

### Modified files — Next.js frontend

| File | Change |
|---|---|
| `app/(shop)/layout.tsx` | Wrap with `CartProvider` |
| `components/layout/Navbar.tsx` | Cart icon badge + link to `/cart` |
| `app/(shop)/products/[slug]/ProductDetailClient.tsx` | "Add to Cart" button wired to `addItem()` |

### New files — NestJS backend

| File | Purpose |
|---|---|
| `src/payments/payments.module.ts` | Module |
| `src/payments/payments.controller.ts` | `POST /payments/stripe/intent` |
| `src/payments/payments.service.ts` | Stripe SDK call |
| `src/payments/dto/create-intent.dto.ts` | Request DTO |

---

## 7. Data Flow Summary

```
Product page
  → addItem() → CartContext → localStorage

/cart page
  → reads CartContext
  → "Proceed to Checkout" → /checkout/information

/checkout/information
  → saves to CheckoutContext + sessionStorage
  → /checkout/shipping

/checkout/shipping
  → GET /shipping-methods
  → saves shippingMethodId to CheckoutContext
  → /checkout/payment

/checkout/payment
  → POST /api/payments/create-intent (Next.js route handler)
      → POST /payments/stripe/intent (NestJS)
          → Stripe PaymentIntents API → clientSecret
  → <PaymentElement> mounted with clientSecret
  → stripe.confirmPayment()
  → POST /orders (NestJS) with cart items + CheckoutContext
  → clearCart()
  → /checkout/confirmation?order=ORD-xxxx

/checkout/confirmation
  → GET /orders/{orderNumber}
  → display order summary
```
