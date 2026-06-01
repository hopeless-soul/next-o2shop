# Admin Order Detail Page — Design Spec

**Date:** 2026-06-01
**Route:** `/admin/orders/[id]`
**Scope:** View order details + update payment/fulfillment status only. No cancellation, notes, or other mutations beyond what the current API exposes.

---

## Architecture

Three files under `app/(admin)/admin/orders/[id]/`:

| File | Role |
|---|---|
| `page.tsx` | RSC: fetches order, handles errors, renders header + client |
| `OrderDetailClient.tsx` | `'use client'`: all display + status edit state |
| `actions.ts` | `'use server'`: `updateOrderStatusAction` via `serverApi.patch` |

### RSC page (`page.tsx`)

- Receives `params: Promise<{ id: string }>`, awaits to extract `id`
- Calls `getAdminOrder(id)` from `lib/api/admin-orders-server.ts` (already exists)
- Error handling: `NotFoundError` → `notFound()`, `AuthError` → `redirect('/admin')`
- Renders `AdminPageHeader` with:
  - `title`: order number (e.g. `ORD-20240101-0001`)
  - `breadcrumb`: `[Admin → /admin] [Orders → /admin/orders] [orderNumber]`
  - `action`: "← Back to Orders" link (same style as product page)
- Passes full `AdminOrder` object into `OrderDetailClient`

### Server Action (`actions.ts`)

```ts
'use server'
import serverApi from '@/lib/api/server'
import type { AdminOrder, UpdateOrderStatusDto } from '@/lib/api/admin-orders'

export async function updateOrderStatusAction(
  id: string,
  dto: UpdateOrderStatusDto,
): Promise<AdminOrder> {
  const res = await serverApi.patch<AdminOrder>(`/admin/orders/${id}/status`, dto)
  return res.data
}
```

No new API service functions needed — `getAdminOrder` and the `UpdateOrderStatusDto` type already exist.

---

## Page Layout

Single scrollable page, two-column asymmetric grid (`flex flex-row gap-6` or `grid grid-cols-[1fr_320px] gap-6`):

```
┌─────────────────────────────────────────────────────────┐
│ AdminPageHeader: ORD-XXXX-XXXX          ← Back to Orders│
├──────────────────────────────┬──────────────────────────┤
│  LEFT (flex-1)               │  RIGHT (w-[320px])        │
│                              │                           │
│  ┌─ Order Items ───────────┐ │  ┌─ Customer ──────────┐  │
│  │ item rows…              │ │  │ email, name, userId  │  │
│  └─────────────────────────┘ │  └─────────────────────┘  │
│                              │                           │
│  ┌─ Summary ───────────────┐ │  ┌─ Shipping Address ──┐  │
│  │ shipping + total        │ │  │ formatted address    │  │
│  └─────────────────────────┘ │  └─────────────────────┘  │
│                              │                           │
│  ┌─ Status ────────────────┐ │  ┌─ Billing Address ───┐  │
│  │ Payment  [select]       │ │  │ address or "Same as  │  │
│  │ Fulfillment [select]    │ │  │  shipping"           │  │
│  │               [Save]    │ │  └─────────────────────┘  │
│  └─────────────────────────┘ │                           │
│                              │  ┌─ Payment ───────────┐  │
│                              │  │ provider + ref       │  │
│                              │  └─────────────────────┘  │
└──────────────────────────────┴──────────────────────────┘
```

All cards use the existing `FormCard` component (`@/components/admin/FormCard`).

---

## Sections

### Left Column

#### Order Items (`FormCard` title="Order Items")
- One row per `AdminOrderItem`
- Header row: Product, SKU, Qty, Unit Price, Total — `text-[12px] text-[var(--admin-text-muted)]`
- Data rows: `text-[14px]`
- Prices formatted with `formatAmount(amount, currency)` from `lib/admin/formatters`

#### Summary (`FormCard` title="Summary")
- Row: Shipping — `{shippingMethodName}` / `formatAmount(shippingPrice, shippingCurrency)`
- Row: **Total** (bold) — `formatAmount(totalAmount, totalCurrency)`

#### Status (`FormCard` title="Status")
- Two `Select` dropdowns from `@/components/admin/ui/select`:
  - Payment Status: `pending | paid | failed | refunded`
  - Fulfillment Status: `unfulfilled | partially_fulfilled | fulfilled | cancelled`
- Local state initialised from the passed `order` prop
- **Save Status** button:
  - Disabled + `Loader2` spinner while saving
  - On success: "Status updated." green flash, 3s auto-clear
  - On error: red error message below the button

### Right Column

#### Customer (`FormCard` title="Customer")
- Email in `text-[14px] font-medium`
- Full name below in `text-[13px] text-[var(--admin-text-secondary)]` (if present)
- If `userId` present: link to `/admin/users/{userId}` — small `text-[12px]` styled as muted underline

#### Shipping Address (`FormCard` title="Shipping Address")
- Uses `AddressBlock` internal helper component
- Renders: name, company (if set), address1, address2 (if set), city/province/postal, country, phone

#### Billing Address (`FormCard` title="Billing Address")
- If all address fields equal shipping: renders `"Same as shipping address"` in `text-[13px] text-[var(--admin-text-muted)]`
- Otherwise: renders `AddressBlock` with billing fields

#### Payment (`FormCard` title="Payment")
- Only renders if `paymentProviderId` is present
- Two labeled read-only rows: Provider ID, Provider Ref

---

## Internal Helper

`AddressBlock` is a small internal component inside `OrderDetailClient.tsx` (not exported):

```tsx
function AddressBlock({ address }: { address: AdminOrderAddress }) {
  // renders address fields as compact multi-line text
}
```

---

## Error & Loading States

- Order not found: Next.js `notFound()` — renders the admin 404 page
- Auth failure: `redirect('/admin')`
- Status save error: inline red message under Save button, stays until next save attempt
- No skeleton loaders — data is server-fetched before the page renders

---

## Types Used (all existing)

- `AdminOrder`, `AdminOrderItem`, `AdminOrderAddress` — from `lib/api/admin-orders.ts`
- `UpdateOrderStatusDto` — from `lib/api/admin-orders.ts`
- `PaymentStatus`, `FulfillmentStatus` — from `lib/api/admin-orders.ts`
- `formatAmount` — from `lib/admin/formatters`
- `AdminBadge`, `fulfillmentVariant`, `paymentVariant` — from `@/components/admin/AdminBadge`
