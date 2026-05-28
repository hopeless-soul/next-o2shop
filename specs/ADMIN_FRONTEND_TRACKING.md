# Admin Frontend Tracking — o2shop

> Pair file: `specs/ADMIN_DESIGN_SYSTEM.md` (visual spec) · `specs/FRONTEND_TRACKING.md` (storefront)
> Last updated: 2026-05-28 (session-23)
> All admin routes live under `/admin/*` — protected by `middleware.ts` RBAC (already in place).

---

## Agent Instructions

1. **Claim it** — change `**Status:**` to `🔄 in-progress`, set `**Owner:**`, update the Quick Status Table row.
2. **Read design spec** — `specs/ADMIN_DESIGN_SYSTEM.md`. Use `var(--admin-*)` tokens, Plus Jakarta Sans typography, shadcn/ui components from `components/ui/`.
3. **Re-read the API spec** — `C:\Users\hk\Documents\Development\nest\nest-o2shop\specs\openapi.json` is dynamic; always re-read fresh before touching any API call.
4. **Do not touch** any section another agent has `🔄 in-progress`.
5. **Log every change** — append to the section's **Change Log** table.
6. **Mark done** — `✅ done`, update Quick Status Table, verify in `npm run dev` with no console errors.

Status key: `⬜ todo` · `🔄 in-progress` · `✅ done` · `🚫 blocked`

---

## Quick Status Table

| Task | Type | Status | Owner | Updated |
|---|---|---|---|---|
| shadcn/ui + lucide-react install | infra | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| Admin CSS tokens (`--admin-*`) in globals.css | infra | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `AdminLayout` (app/admin/layout.tsx) | shell | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `AdminSidebar` | component | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `AdminPageHeader` | component | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `DataTable` | component | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `FilterBar` | component | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `AdminPagination` | component | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `AdminBadge` | component | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `ConfirmDialog` | component | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `FormCard` | component | ⬜ todo | — | — |
| `/admin` dashboard | route | ✅ done (placeholder) | session-21 | 2026-05-27 |
| `/admin/products` list | route | ⬜ todo | — | — |
| `/admin/products/new` | route | ⬜ todo | — | — |
| `/admin/products/[id]` edit | route | ⬜ todo | — | — |
| `/admin/orders` list | route | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `/admin/orders/[id]` edit | route | ⬜ todo | — | — |
| `/admin/users` list | route | ✅ done | claude-sonnet-4-6 | 2026-05-28 |
| `/admin/users/[id]` edit | route | ⬜ todo | — | — |
| `/admin/users/new` create | route | 🚫 blocked | — | — |
| `/admin/categories` list | route | ⬜ todo | — | — |
| `/admin/categories/new` | route | ⬜ todo | — | — |
| `/admin/categories/[id]` edit | route | ⬜ todo | — | — |
| `/admin/collections` list | route | ⬜ todo | — | — |
| `/admin/collections/new` | route | ⬜ todo | — | — |
| `/admin/collections/[id]` edit | route | ⬜ todo | — | — |
| `/admin/reviews` list | route | ⬜ todo | — | — |
| `/admin/shipping` list + CRUD | route | ⬜ todo | — | — |
| `lib/api/admin-*.ts` service files | infra | ✅ done | claude-sonnet-4-6 | 2026-05-28 |

---

## Infrastructure

---

### shadcn/ui + lucide-react Install

**Status:** `✅ done` | **Files:** `components/ui/*`, `tailwind.config.ts`, `app/globals.css`

Run once before building any admin component:

```bash
npx shadcn@latest init
# Style: Default | Base color: Slate | CSS variables: yes | Alias: @/components

npx shadcn@latest add table button input select dialog badge card form label switch separator avatar dropdown-menu tabs textarea

npm install lucide-react
```

**Notes:**
- shadcn `init` modifies `app/globals.css` — add `--admin-*` tokens after the shadcn block or they will be overwritten.
- shadcn `init` also modifies `tailwind.config.ts` — review before accepting changes.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | `npx shadcn@latest init` (Default/Slate/CSS vars); added all 14 components; installed `lucide-react` (already present v1.16), `@tanstack/react-table`, `react-hook-form`, `@hookform/resolvers`, `zod`; hand-wrote `form.tsx` (CLI silently skipped it); lint passes clean |

---

### Admin CSS Tokens

**Status:** `✅ done` | **Files:** `app/globals.css`

Add this block to `app/globals.css` after the shadcn-generated `:root {}` block:

```css
/* Admin design system tokens */
:root {
  --admin-bg: #f9fafb;
  --admin-surface: #ffffff;
  --admin-sidebar-bg: #f3f4f6;
  --admin-sidebar-border: #e5e7eb;
  --admin-border: #e5e7eb;
  --admin-border-input: #d1d5db;
  --admin-ring: #111827;

  --admin-text-primary: #111827;
  --admin-text-secondary: #4b5563;
  --admin-text-muted: #9ca3af;
  --admin-text-on-dark: #ffffff;

  --admin-primary: #1e1e1e;
  --admin-primary-hover: #333333;
  --admin-destructive: #e55151;
  --admin-destructive-hover: #d14343;

  --admin-status-success-bg: #dcfce7;
  --admin-status-success-fg: #16a34a;
  --admin-status-warning-bg: #fef9c3;
  --admin-status-warning-fg: #ca8a04;
  --admin-status-error-bg: #fee2e2;
  --admin-status-error-fg: #dc2626;
  --admin-status-neutral-bg: #f3f4f6;
  --admin-status-neutral-fg: #6b7280;
  --admin-status-info-bg: #dbeafe;
  --admin-status-info-fg: #2563eb;

  --admin-sidebar-width: 240px;
  --admin-content-px: 24px;
  --admin-content-py: 24px;
  --admin-table-row-h: 48px;
}
```

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### Admin API Service Files

**Status:** `✅ done` | **Files:** `lib/api/admin-*.ts`

Create one file per admin resource. All admin mutations use `lib/api/client.ts`. All RSC reads use `lib/api/server.ts`. **Re-read `openapi.json` fresh when implementing each file.**

| File | Endpoints covered |
|---|---|
| `lib/api/admin-products.ts` | `GET/POST /admin/products`, `GET/PATCH/DELETE /admin/products/{id}`, variants CRUD, photos CRUD |
| `lib/api/admin-orders.ts` | `GET /admin/orders`, `GET /admin/orders/{id}`, `PATCH /admin/orders/{id}/status` |
| `lib/api/admin-users.ts` | `GET /admin/users`, `GET/PATCH/DELETE /admin/users/{id}` |
| `lib/api/admin-categories.ts` | `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/{id}`, subcategory CRUD |
| `lib/api/admin-collections.ts` | `GET/POST /admin/collections`, `GET/PATCH/DELETE /admin/collections/{id}` |
| `lib/api/admin-reviews.ts` | `GET /admin/reviews`, `PATCH /admin/reviews/{id}/status`, `DELETE /admin/reviews/{id}` |
| `lib/api/admin-shipping.ts` | `GET/POST /admin/shipping-methods`, `PATCH/DELETE /admin/shipping-methods/{id}` |

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | Created all 7 admin service files with TypeScript types from openapi.json; server reads via server.ts, mutations via client.ts |

---

## Admin Shell

---

### `AdminLayout` — Root Layout

**Status:** `✅ done` | **Files:** `app/admin/layout.tsx`

Replace the current lack of layout with a proper admin layout wrapping all `/admin/*` routes.

- RSC — no `'use client'`
- Calls `getMe()` server-side; redirects to `/login` on failure; passes `user` as prop to `AdminSidebar`
- Plus Jakarta Sans loaded via `next/font/google` with `variable: '--font-admin'`
- Do NOT apply `--font-admin` to the root layout — storefront uses Fjalla One / Montserrat

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | Created RSC layout with Plus Jakarta Sans, sidebar + content area shell; fetches user server-side and passes to AdminSidebar |

---

### `AdminSidebar`

**Status:** `✅ done` | **Files:** `components/admin/AdminSidebar.tsx`

```ts
'use client'
// No props — static nav config
```

Nav items:

```ts
const NAV_ITEMS = [
  // MANAGE group
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', exact: true },
  { label: 'Products', href: '/admin/products', icon: 'Package' },
  { label: 'Orders', href: '/admin/orders', icon: 'ShoppingBag' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  // CATALOG group
  { label: 'Categories', href: '/admin/categories', icon: 'Tag' },
  { label: 'Collections', href: '/admin/collections', icon: 'Layers' },
  // CONTENT group
  { label: 'Reviews', href: '/admin/reviews', icon: 'Star' },
  { label: 'Shipping', href: '/admin/shipping', icon: 'Truck' },
]
```

**Visual spec** — from `ADMIN_DESIGN_SYSTEM.md §9`:
- 240px fixed, `bg-[var(--admin-sidebar-bg)]`, `border-r border-[var(--admin-sidebar-border)]`
- Logo: `<Image src="/logo.svg" width={100} height={36}>`, link to `/admin`
- Active item: `bg-[var(--admin-primary)] text-white rounded-[4px]`
- Inactive hover: `hover:bg-[#e5e7eb] rounded-[4px]`
- Active = `pathname === item.href` (exact) or `pathname.startsWith(item.href)` (prefix)
- Bottom: `getMe()` email + logout button — logout calls `logout()` from `lib/api/auth` then `router.push('/login')`

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | Created Client Component with grouped nav (MANAGE/CATALOG/CONTENT), active state via `usePathname`, bottom user strip with Avatar + email + logout; accepts `user` prop from RSC layout |

---

### `AdminPageHeader`

**Status:** `✅ done` | **Files:** `components/admin/AdminPageHeader.tsx`

```ts
interface AdminPageHeaderProps {
  title: string;
  breadcrumb?: { label: string; href?: string }[];
  action?: React.ReactNode;
}
```

- Flex row, `pb-4 mb-6 border-b border-[var(--admin-border)]`
- Left: optional breadcrumb above title (12px / `--admin-text-muted`), then h1 (22px / 600)
- Right: `action` slot, right-aligned

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | Created server component; flex row with breadcrumb nav, h1, and right action slot |

---

## Shared Components

---

### `DataTable`

**Status:** `✅ done` | **Files:** `components/admin/DataTable.tsx`

```ts
import { ColumnDef } from '@tanstack/react-table'

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  // URL-driven sort (optional)
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}
```

Built on shadcn `<Table>` + `useReactTable`. Visual spec: `ADMIN_DESIGN_SYSTEM.md §10a`.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | Created with TanStack Table (manualSorting/Pagination), URL-driven sort props, 6-row skeleton, PackageOpen empty state |

---

### `FilterBar`

**Status:** `✅ done` | **Files:** `components/admin/FilterBar.tsx`

```ts
interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  onClear?: () => void;
  className?: string;
}
```

- Search debounced 300ms
- URL changes via `router.replace` (not `push`)
- "Clear filters" link: visible only when search or any filter is non-empty

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | Created client component; 300ms debounced search, inline filter selects, clear link; URL routing via parent callbacks |

---

### `AdminPagination`

**Status:** `✅ done` | **Files:** `components/admin/AdminPagination.tsx`

```ts
interface AdminPaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];  // default [20, 50, 100]
}
```

Visual spec: `ADMIN_DESIGN_SYSTEM.md §10c`.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | Created client component; X–Y of Z label, limit select, ellipsis page numbers (max 7), prev/next buttons |

---

### `AdminBadge`

**Status:** `✅ done` | **Files:** `components/admin/AdminBadge.tsx`

```ts
type AdminBadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';

interface AdminBadgeProps {
  variant: AdminBadgeVariant;
  label: string;
  className?: string;
}
```

Export convenience maps from this file:

```ts
export const fulfillmentVariant: Record<string, AdminBadgeVariant> = {
  unfulfilled: 'neutral',
  partially_fulfilled: 'warning',
  fulfilled: 'success',
  cancelled: 'error',
}
export const paymentVariant: Record<string, AdminBadgeVariant> = {
  pending: 'warning', paid: 'success', failed: 'error', refunded: 'neutral',
}
export const reviewVariant: Record<string, AdminBadgeVariant> = {
  pending: 'warning', approved: 'success', rejected: 'error',
}
export const roleVariant: Record<string, AdminBadgeVariant> = {
  admin: 'info', regular: 'neutral',
}
```

Color map: `ADMIN_DESIGN_SYSTEM.md §10d`.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | Created server component; 5 variants using --admin-status-* tokens; all 4 convenience maps exported |

---

### `ConfirmDialog`

**Status:** `✅ done` | **Files:** `components/admin/ConfirmDialog.tsx`

```ts
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;   // default "Delete"
  destructive?: boolean;   // default true
  onConfirm: () => Promise<void>;
}
```

Wraps shadcn `<Dialog>`. Confirm button: spinner + disabled while in-flight. On success: close + toast. On error: inline error, dialog stays open. Visual spec: `ADMIN_DESIGN_SYSTEM.md §10e`.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | Created client component; Loader2 spinner during in-flight, inline error on failure, closes on success; no toast library installed yet |

---

### `FormCard`

**Status:** `⬜ todo` | **Files:** `components/admin/FormCard.tsx`

```ts
interface FormCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}
```

White surface card. Visual spec: `ADMIN_DESIGN_SYSTEM.md §10f`.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

## Routes

---

### `/admin` — Dashboard

**Status:** `✅ done (placeholder)` | **Files:** `app/admin/page.tsx`

Currently: minimal RSC showing user email + role (session-21). Needs to be wrapped by `AdminLayout` once shell is built. Dashboard content: placeholder "Dashboard coming soon" — no stat cards, no API calls.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-27 | session-21 | Initial placeholder — email + role via getMe() |

---

### `/admin/products` — Products List

**Status:** `⬜ todo` | **Files:** `app/admin/products/page.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/products` — params: `page`, `limit`, `search`, `categoryId`, `collectionId`, `subCategoryId`, `isPublished`, `includeDeleted`, `sortBy` (createdAt|basePrice|name), `sortOrder` (asc|desc)
- `DELETE /admin/products/{id}` — soft-delete (204)

**Columns:**

| Column | Source | Notes |
|---|---|---|
| Name | `displayName` | Link to edit page |
| Slug | `name` | Monospace, muted |
| Base Price | `basePrice` | Formatted `$X.XX` |
| Category | `category.displayName` | — |
| Status | `isPublished` (infer from API — re-read schema) | `<AdminBadge>` |
| Created | `createdAt` | Relative date |
| Actions | — | Edit + Delete |

**Filter bar:** Search (name/slug) | Published (All / Published / Draft) | Category select (load `GET /categories`) | Collection select

**Row actions:**
- Edit → `/admin/products/[id]`
- Delete → `<ConfirmDialog>` then `DELETE /admin/products/{id}`

**Pattern:** URL-driven RSC page. `searchParams` → API call → render. No client state except delete confirmation dialog.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/products/new` — Create Product

**Status:** `⬜ todo` | **Files:** `app/admin/products/new/page.tsx`, `app/admin/products/new/ProductCreateClient.tsx`

**API resources** *(re-read openapi.json)*
- `POST /admin/products` — `CreateProductDto`
- `GET /admin/categories` — for category select
- `GET /admin/collections` — for collection select

**Form tabs** (`<Tabs>`): Details | Variants

> Photos tab is not available on create — upload photos after the product is saved (edit page only).

**Details tab fields:**

| Field | Input | Notes |
|---|---|---|
| displayName | text | required |
| name (slug) | text | auto-generated from displayName, editable; pattern `^[a-z0-9_]+$` |
| basePrice | number | required |
| currency | select | default "USD" |
| categoryId | select (load categories) | required |
| subCategoryId | select (load subcategories for chosen category) | optional, cascades |
| collectionId | select (load collections) | optional |
| type | text | e.g. "Ushanka" |
| isPublished | toggle switch | default false on create |
| description | rich text / textarea | JSON block format (re-read schema) |

**Variants tab:** Add at least one variant before saving (re-check API if required). Use the same variant dialog as the edit page.

**On save:** `POST /admin/products` → redirect to `/admin/products/[newId]` (edit page).

**Pattern:** RSC shell (loads categories + collections server-side), client island owns all form state + submission.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/products/[id]` — Edit Product

**Status:** `⬜ todo` | **Files:** `app/admin/products/[id]/page.tsx`, `app/admin/products/[id]/ProductEditClient.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/products/{id}` — full `AdminProductResponseDto`
- `PATCH /admin/products/{id}` — `UpdateProductDto`
- `POST /admin/products/{id}/variants` — `CreateVariantDto`
- `PATCH /admin/products/{id}/variants/{variantId}` — `UpdateVariantDto`
- `DELETE /admin/products/{id}/variants/{variantId}` — 204
- `POST /admin/products/{id}/variants/{variantId}/default` — set default
- `POST /admin/products/{id}/photos` — multipart/form-data (`file`, optional `altText` query param)
- `DELETE /admin/products/{id}/photos/{photoId}` — 204

**Tabs:** Details | Variants | Photos

**Details tab:** Same fields as create, pre-filled. Save via `PATCH`.

**Variants tab:** See `ADMIN_DESIGN_SYSTEM.md §11` for full variant section spec.

**Photos tab:** See `ADMIN_DESIGN_SYSTEM.md §12` for photo upload spec. sortOrder 0=main, 1=left-hover, 2=right-hover, -1=accent (from storefront convention).

**Pattern:** RSC fetches product server-side; client island owns tabs, variant dialogs, photo upload, save mutations.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/orders` — Orders List

**Status:** `✅ done` | **Files:** `app/admin/orders/page.tsx`, `app/admin/orders/OrdersContent.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/orders` — params: `page`, `limit` (check openapi.json for additional filters)

> ⚠️ NOTE: Current spec shows only `page`/`limit` params on `GET /admin/orders`. Verify in fresh openapi.json read whether search/status filters exist before building the filter bar.

**Columns:**

| Column | Source | Notes |
|---|---|---|
| Order # | `orderNumber` | Link to edit page |
| Customer | `email` or user info | Re-check AdminOrderResponseDto |
| Date | `createdAt` | Formatted |
| Fulfillment | `fulfillmentStatus` | `<AdminBadge variant={fulfillmentVariant[...]}>`  |
| Payment | `paymentStatus` | `<AdminBadge variant={paymentVariant[...]}>` |
| Total | `total` | Formatted `$X.XX` |
| Actions | — | View/Edit |

**Row actions:** View/Edit → `/admin/orders/[id]`

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | RSC page reads async searchParams, fetches via getAdminOrders (page+limit only — no filter params in API); OrdersContent client island owns pagination URL routing; columns: Order #, Customer, Date, Fulfillment/Payment badges, Total, View link |

---

### `/admin/orders/[id]` — Edit Order

**Status:** `⬜ todo` | **Files:** `app/admin/orders/[id]/page.tsx`, `app/admin/orders/[id]/OrderEditClient.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/orders/{id}` — UUID (NOT orderNumber — different from customer-facing endpoint)
- `PATCH /admin/orders/{id}/status` — `UpdateOrderStatusDto` (fulfillmentStatus and/or paymentStatus)

**Layout:**
- Page header: order number (display) + customer email + created date
- Status form (`<FormCard>`): fulfillment status select + payment status select + Save button (client mutation)
- Line items table: read-only; product name, variant, qty, unit price, line total
- Address cards: shipping + billing, read-only `<AddressCard>` from storefront component (or new admin version)
- Totals: subtotal, shipping, total, `max-w-xs ml-auto`

**Pattern:** RSC fetches order; client island owns status form + submission.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/users` — Users List

**Status:** `✅ done` | **Files:** `app/admin/users/page.tsx`, `app/admin/users/UsersContent.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/users` — params: `page`, `limit`, `search`, `role` (regular|admin), `isDeleted`, `userId`, `createdAfter`, `createdBefore`
- `DELETE /admin/users/{id}` — soft-delete (204)

**Columns:**

| Column | Source | Notes |
|---|---|---|
| User | `avatarUrl` + `email` | Avatar 28px circle + email |
| Display Name | `displayName` | May be null |
| Role | `role` | `<AdminBadge variant={roleVariant[...]}>`  |
| Active | `isActive` | `<AdminBadge>` success/error |
| Created | `createdAt` | Formatted |
| Actions | — | Edit + Delete |

**Filter bar:** Search (email) | Role (All / Admin / Regular) | Status (Active / Deleted)

**Row actions:**
- Edit → `/admin/users/[id]`
- Delete → `<ConfirmDialog>` then `DELETE /admin/users/{id}`

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-28 | claude-sonnet-4-6 | RSC page reads async searchParams, fetches via getAdminUsers, passes Server Action for delete; UsersContent client island owns filter/pagination URL routing + delete dialog |

---

### `/admin/users/[id]` — Edit User

**Status:** `⬜ todo` | **Files:** `app/admin/users/[id]/page.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/users/{id}` — `AdminUserResponseDto`
- `PATCH /admin/users/{id}` — `UpdateAdminUserDto`: `role?`, `isActive?`, `resetTokenVersion?`

**Form** (`<FormCard>`):

| Field | Input | Notes |
|---|---|---|
| Email | read-only | Display only — not editable |
| Display Name | read-only | No update endpoint |
| Google linked | read-only badge | `googleLinked` boolean |
| Role | select (regular / admin) | Editable |
| Active | toggle switch | `isActive` |
| Reset tokens | checkbox | `resetTokenVersion: true` invalidates all sessions |

Save via `PATCH /admin/users/{id}`. Success toast "User updated." Error shown inline.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/users/new` — Create User

**Status:** `🚫 blocked` | **Blocked by:** `POST /admin/users` endpoint does not exist in the API

No create-user page until the backend adds this endpoint. When unblocked, re-read `openapi.json` for the new DTO shape.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/categories` — Categories List

**Status:** `⬜ todo` | **Files:** `app/admin/categories/page.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/categories` — `PaginatedCategoryResponseDto` (page, limit)
- `DELETE /admin/categories/{id}` — 204

**Columns:** Name | Slug | Subcategories (count from `subCategories.length`) | Created | Actions

**Row actions:** Edit → `/admin/categories/[id]` | Delete → `<ConfirmDialog>`

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/categories/new` — Create Category

**Status:** `⬜ todo` | **Files:** `app/admin/categories/new/page.tsx`

**API resources** *(re-read openapi.json)*
- `POST /admin/categories` — `CreateCategoryDto`: `slug` (pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`), `displayName`

**Form:** displayName (text) + slug (auto-derived from displayName → lowercase + hyphens, editable) + Save.

On save: redirect to `/admin/categories/[newId]` to add subcategories.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/categories/[id]` — Edit Category

**Status:** `⬜ todo` | **Files:** `app/admin/categories/[id]/page.tsx`, `app/admin/categories/[id]/CategoryEditClient.tsx`

**API resources** *(re-read openapi.json)*
- `GET /categories/{id}` — `CategoryResponseDto` with `subCategories[]`
- `PATCH /admin/categories/{id}` — `CreateCategoryDto` (same shape — re-read to confirm)
- `POST /admin/categories/{id}/subcategories` — `CreateSubCategoryDto`: `slug`, `displayName`
- `PATCH /admin/categories/{id}/subcategories/{subId}` — `CreateSubCategoryDto`
- `DELETE /admin/categories/{id}/subcategories/{subId}` — 204

**Layout:**
- Top `<FormCard>`: category displayName + slug edit + Save
- Below: subcategories inline list — each row: displayName + slug + Edit (inline) + Delete (`<ConfirmDialog>`)
- "Add subcategory" button at bottom of list: opens a small inline form (not a full dialog)

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/collections` — Collections List

**Status:** `⬜ todo` | **Files:** `app/admin/collections/page.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/collections` — `PaginatedAdminCollectionResponseDto`
- `DELETE /admin/collections/{id}` — 204

**Columns:** Name | Slug | Active | Created | Actions

**Row actions:** Edit → `/admin/collections/[id]` | Delete → `<ConfirmDialog>`

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/collections/new` — Create Collection

**Status:** `⬜ todo` | **Files:** `app/admin/collections/new/page.tsx`

**API resources** *(re-read openapi.json)*
- `POST /admin/collections` — `CreateCollectionDto`: `slug`, `displayName`, `description?`, `isActive?` (default true)

**Form fields:** displayName, slug (auto-derived, editable), description (textarea), isActive toggle. On save → redirect to `/admin/collections/[id]`.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/collections/[id]` — Edit Collection

**Status:** `⬜ todo` | **Files:** `app/admin/collections/[id]/page.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/collections/{id}` — `AdminCollectionResponseDto`
- `PATCH /admin/collections/{id}` — `UpdateCollectionDto`
- `DELETE /admin/collections/{id}` — 204 (accessible from edit page too, with `<ConfirmDialog>`)

**Form fields:** displayName, slug, description, isActive toggle. Check openapi.json for `bannerImageUrl` — if an upload endpoint exists, include photo upload section.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/reviews` — Reviews List

**Status:** `⬜ todo` | **Files:** `app/admin/reviews/page.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/reviews` — params: `page`, `limit`, `productId`, `status` (`ReviewStatus` enum — re-read), `userId`, `search`
- `PATCH /admin/reviews/{id}/status` — `UpdateReviewStatusDto`
- `DELETE /admin/reviews/{id}` — hard-delete (204)

**Columns:**

| Column | Source | Notes |
|---|---|---|
| Author | `authorName` or user email | Re-check AdminReviewResponseDto |
| Product | product name | Re-check schema for embedded product |
| Rating | `rating` | `<StarRating>` at 12px or numeric |
| Body | `body` | Truncated to 80 chars |
| Status | `status` | `<AdminBadge variant={reviewVariant[...]}>` |
| Date | `createdAt` | Formatted |
| Actions | — | Approve / Reject / Delete |

**Filter bar:** Search | Status (All / Pending / Approved / Rejected)

**Row actions:**
- Approve (only if pending) — `PATCH .../status` with `{ status: 'approved' }`
- Reject (only if pending) — `PATCH .../status` with `{ status: 'rejected' }`
- Delete — `<ConfirmDialog>` then hard-delete

> No edit review page — admin can only change status or delete.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

### `/admin/shipping` — Shipping Methods

**Status:** `⬜ todo` | **Files:** `app/admin/shipping/page.tsx`

**API resources** *(re-read openapi.json)*
- `GET /admin/shipping-methods` — paginated list (re-read for schema)
- `POST /admin/shipping-methods` — `CreateShippingMethodDto`
- `PATCH /admin/shipping-methods/{id}` — `CreateShippingMethodDto`
- `DELETE /admin/shipping-methods/{id}` — 204

**Approach:** Inline CRUD (no separate edit page — shipping methods are simple). Each row has inline Edit (opens dialog) + Delete (`<ConfirmDialog>`). "Add shipping method" button opens same dialog for create.

**Columns:** Name | Price | Active | Actions

Re-read `CreateShippingMethodDto` in openapi.json for exact fields before building the form.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

## Key Decisions & Gotchas

- **`GET /admin/orders/{id}` takes a UUID** — NOT the `orderNumber` display string. Use `order.id` for admin edit links, not `order.orderNumber`.
- **No create-user endpoint** — `/admin/users/new` is blocked. Users self-register via `POST /auth/register`.
- **shadcn init modifies globals.css** — always add `--admin-*` tokens after the shadcn block or they will be overwritten.
- **Plus Jakarta Sans scoped to admin layout** — load via `next/font/google` in `app/admin/layout.tsx` only. Do not apply to root layout.
- **`ReviewStatus` enum** — re-read openapi.json for exact values before building review filter/badge maps.
- **`UpdateOrderStatusDto`** — re-read openapi.json; may support setting fulfillmentStatus and paymentStatus independently.
- **Product description format** — `description` is `{ blocks: ProductDescriptionBlock[] }`, not a flat string. The create/edit form needs to handle this shape. Re-read `CreateProductDto` in openapi.json.
- **Variant `default` concept** — `POST /admin/products/{id}/variants/{variantId}/default` sets one variant as default for the product. Display with `<AdminBadge variant="info">Default</AdminBadge>`.
