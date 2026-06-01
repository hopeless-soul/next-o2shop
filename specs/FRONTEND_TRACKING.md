# Frontend Tracking — o2shop

> Pair file: `specs/FRONTEND_PROGRESS.md` (completed work history) · `specs/DESIGN_SYSTEM.md` (visual spec)
> Last updated: 2026-06-01

---

## Agent Instructions

1. **Claim it** — change `**Status:**` to `🔄 in-progress`, set `**Owner:**`, update the Quick Status Table row.
2. **Read context** — `specs/DESIGN_SYSTEM.md`. Never hardcode hex values; use `var(--color-*)` tokens.
3. **Re-read the API spec** — `C:\Users\hk\Documents\Development\nest\nest-o2shop\specs\openapi.json` is dynamic; always re-read fresh.
4. **Do not touch** any section another agent has `🔄 in-progress`.
5. **Log every change** — append to the section's **Change Log** table.
6. **Mark done** — `✅ done`, update Quick Status Table, verify renders in `npm run dev` with no console errors.

Status key: `⬜ todo` · `🔄 in-progress` · `✅ done`

---

## Quick Status Table

| Task | Type | Status | Owner | Updated |
|---|---|---|---|---|
| `/` home hero | route | ✅ done | session-2 | 2026-05-25 |
| `/products` list | route | ✅ done | session-10 | 2026-05-26 |
| `/products/[slug]` detail | route | ✅ done | session-19 | 2026-05-27 |
| `/login` | route | ✅ done | session-21 | 2026-05-27 |
| `/register` | route | ⬜ todo | — | — |
| `/admin` | route | ✅ done | session-21 | 2026-05-27 |
| `/account` dashboard | route | ✅ done | session-10 | 2026-05-26 |
| `/account/orders/[id]` | route | ✅ done | session-10 | 2026-05-26 |
| `CartDrawer` | component | ⬜ todo | — | — |
| API integration layer | infra | ✅ done | session-10 | 2026-05-26 |
| `SearchPopup` | component | ✅ done | session-6 | 2026-05-26 |
| `Navbar` | component | ✅ done | session-20 | 2026-05-27 |
| `Footer` | component | ✅ done | session-4 | 2026-05-25 |
| `Skeleton` | component | ✅ done | session-2 | 2026-05-25 |
| `Badge` | component | ✅ done | session-7 | 2026-05-26 |
| `Button` | component | ✅ done | session-2 | 2026-05-25 |
| `StarRating` | component | ✅ done | session-15 | 2026-05-27 |
| `ProductCard` | component | ✅ done | session-18 | 2026-05-27 |
| `ProductCardSkeleton` | component | ✅ done | session-2 | 2026-05-25 |
| `VariantPicker` | component | ✅ done | session-9 | 2026-05-26 |
| `ReviewItem` | component | ✅ done | session-17 | 2026-05-27 |
| `ReviewsBlock` | component | ✅ done | session-17 | 2026-05-27 |
| `OrderStatusBadge` | component | ✅ done | session-9 | 2026-05-26 |
| `AddressCard` | component | ✅ done | session-9 | 2026-05-26 |
| `PaymentStatusBadge` | component | ✅ done | session-9 | 2026-05-26 |

---

## Routes

---

### `/` — Home

**Status:** `✅ done` | **Files:** `app/page.tsx`

Static dark hero (`var(--color-foreground-dark)` bg), "O2SHOP" headline, "Shop Now" CTA → `/products`. Navbar transparent + overlays hero. No data fetching.

- Navbar MUST stay transparent; `<section>` is `min-h-screen`
- CTA: Fjalla One 13px uppercase, white border, no fill, `border-2`

---

### `/products` — Products List

**Status:** `✅ done` | **Files:** `app/(shop)/products/page.tsx`

Async RSC. `searchParams` drives `categorySlug` + `subCategorySlug` + `sale` + `search`. Wired `listProducts()`. Filter strip uses `<Link>` elements. Product count from `result.total`. Skeleton: 8 × `ProductCardSkeleton` in same grid. Empty state message when no products match filters.

- Grid: `grid-cols-2 md:grid-cols-4`, `gap-[2px]` desktop / `gap-[1px]` mobile, `p-[2px]`
- Heading: h1 Fjalla One 32px uppercase — actual category name from URL param
- Filter strip: active = dark bg + white text; inactive = transparent + border
- Supports subcategory + `?sale=true` filter params

---

### `/products/[slug]` — Product Detail

**Status:** `✅ done` | **Files:** `app/(shop)/products/[slug]/page.tsx`, `app/(shop)/products/[slug]/ProductDetailClient.tsx`, `app/(shop)/products/[slug]/ReviewsBlock.tsx`

RSC wrapper + client island. `getProductBySlug()` + `listReviewsByProduct(product.id)`. `notFound()` on 404. Back button above layout (`router.back()`, fallback `/products`). Real `<Image fill>` from `product.photos`; `sortOrder:-1` renders 64×80px accent photo beside title.

- 60/40 flex split (md+); thumbnail strip: vertical-right column (`flex-col gap-2`, 80×100px each)
- ATC: `h-[var(--atc-height)]` (56px), `w-full`, `rounded-base` (6px), `bg-primary`
- Title: Fjalla One `clamp(1.5rem, 3vw, 2.6rem)` capitalize; price: Fjalla One 22px; sale: crossed-out at 16px opacity-50
- Accordion: Fjalla One 13px uppercase + "+" indicator; body Montserrat 14px

---

### `/login` — Login

**Status:** `✅ done` | **Files:** `app/login/page.tsx`, `app/login/LoginForm.tsx`

Form wired to `login()` from `lib/api/auth`. Client component island (`LoginForm.tsx`) owns all state; page shell remains RSC. On success → `router.push('/account')`. Error display below button. Button disabled + "Signing in…" while in-flight. Backend sets HttpOnly cookies automatically on login.

**Components used:** `Button` (primary, fullWidth, lg, disabled)

**Visual notes**
- Container: `max-w-md` centered card, `bg-card`, `shadow-2`
- Inputs: `border: 1px solid var(--color-border-input)`, `rounded-base`, white bg
- Labels: Montserrat 12px bold uppercase tracking-widest
- Error: Montserrat 13px `color: var(--color-destructive)` below button
- On success: redirect to `/account`

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial prototype — presentational form, email + password, link to /register |
| 2026-05-27 | session-21 | Wired to auth API — LoginForm.tsx client island, loading state, error display, redirect to /account |

---

### `/admin` — Admin Dashboard (RBAC draft)

**Status:** `✅ done` | **Files:** `app/admin/page.tsx`, `middleware.ts`

Minimal RSC protected by `middleware.ts`. Middleware decodes `access_token` JWT payload (base64, no signature verification) in Edge runtime, checks `payload.role === 'admin'`. Non-authenticated → `/login`; authenticated non-admin → `/`. Admin page calls `getMe()` to display email + role. Middleware matcher: `/admin/:path*` only.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-27 | session-21 | Created middleware.ts (Edge RBAC) + app/admin/page.tsx (minimal RSC placeholder) |

---

### `/register` — Register

**Status:** `⬜ todo` | **Files:** `app/register/page.tsx`

**Current state:** Presentational form — first/last name, email, password, confirm password. "Create Account" button. Link to `/login`.

**API resources** *(re-read openapi.json)*
- Register — POST first/last name, email, password → creates account + sets session

**Components used:** `Button` (primary, fullWidth, lg)

**Visual notes**
- Same card layout as `/login`
- Client-side validate: passwords match before submitting
- Error: Montserrat 13px `color: var(--color-destructive)` below button
- On success: redirect to `/account`

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial prototype — 5 fields, passwords match validation placeholder |

---

### `/account` — Account Dashboard

**Status:** `✅ done` | **Files:** `app/account/page.tsx`

Async RSC. Auth guard: `getMe()` → `redirect('/login')` on `AuthError`. Wired `listMyOrders()` + `listAddresses()`. Order detail `href` uses `order.orderNumber`. Renders order history table + 2-col address grid.

- Padding: `pt-[var(--header-height-desktop)]`, `px-[var(--header-px-desktop)]`
- Section headings: Fjalla One 18px uppercase `tracking-[0.36px]`
- "View" button: `bg-accent text-accent-foreground`, Fjalla One 11px uppercase
- Empty state: centered Montserrat "No orders yet." + "Start Shopping" CTA

---

### `/account/orders/[id]` — Order Detail

**Status:** `✅ done` | **Files:** `app/account/orders/[id]/page.tsx`

Async RSC. `params.id` is the `orderNumber` display string. `getOrderByNumber(id)` → `notFound()` on 404. Renders order header + status, 4-step status timeline, line items table with totals, billing + shipping address cards.

- Breadcrumbs: Home / Account / Order #XXXXXX
- Timeline: Placed → Processing → Shipped → Delivered; completed = filled dark circle + dark connector; skip for cancelled
- Totals: `max-w-xs ml-auto`; "Shipping: Free" when `order.shipping === 0`

---

## Infrastructure

---

### API Integration Layer

**Status:** `✅ done`
**Files:** `lib/api/errors.ts`, `lib/api/server.ts`, `lib/api/client.ts`, `lib/api/categories.ts`, `lib/api/auth.ts`, `lib/api/products.ts`, `lib/api/reviews.ts`, `lib/api/orders.ts`, `lib/api/addresses.ts`, `lib/api/cart.ts`, `.env.local`

- `errors.ts` — typed classes (`ApiError`, `AuthError`, `NotFoundError`, `ValidationError`, `ForbiddenError`) + `parseApiError()`
- `server.ts` — `import 'server-only'`; reads `access_token` HttpOnly cookie → `Authorization: Bearer`
- `client.ts` — `withCredentials: true`; 401 → refresh → retry; concurrent 401s queued
- `cart.ts` — stub (no cart endpoint yet)
- URL: `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`

---

## Components — Planned

---

### `CartDrawer` — Slide-in Cart

**Status:** `⬜ todo` | **Files:** `components/layout/CartDrawer.tsx` *(create)*

```ts
interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}
```

**API resources** *(re-read openapi.json)*
- Cart — GET items, quantities, subtotal
- Add to cart — POST (called from ATC button on product page)
- Update quantity — PATCH/PUT cart item
- Remove item — DELETE cart item

**Skeleton:** 2–3 rows: `100px × 100px` image placeholder + two text shimmer lines beside it

**Visual notes**
- Width: `var(--cart-drawer-width)` = 458px; slides in from right
- Overlay: `rgba(0,0,0,0.55)` behind drawer; bg: white; footer area: `var(--color-muted-2)`
- CTA: black bg, white text, 64px height, full width
- Product image: 100px wide, `rounded-sm` (4px)
- Cart badge on Navbar icon: `var(--color-badge-cart)` = `#e64984` (pink — NOT brand accent)
- Shadow: `var(--shadow-4)` on panel
- Navbar cart badge count must wire to cart item count — consider React Context or Zustand

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

## Components — Stable (do not modify without explicit instruction)

---

### `Navbar` — Site Header

**Status:** `✅ done` | **Files:** `components/layout/Navbar.tsx`

```ts
interface NavbarProps {
  background?: string;
  textColor?: string;
  scrolledBackground?: string;
  scrolledColor?: string;
}
```

Fixed header. Route-based theming via `usePathname()`. Logo centered (3-col grid, `/public/logo.svg` CSS-filtered). Nav entries from `lib/nav-config.ts` (`NAV_CATEGORIES: NavCategory[]` — edit there to add/remove/reorder). `/` = dark bg + white always; `/products*` = transparent + dark at top, dark + white on scroll. Category dropdowns with 80ms hover-intent close delay. Mobile slide-in drawer (positioning + visibility improved). Cart badge hardcoded at `3` — wire to cart state when `CartDrawer` is built. Accessories category (hats, bags, jewellery subcategories) added to `lib/nav-config.ts`.

---

### `Footer` — Site Footer

**Status:** `✅ done` | **Files:** `components/layout/Footer.tsx`

No props. 3-column desktop (brand 28% / links 72%) / column-reverse mobile. Brand column: `<Image src="/logo.svg">` at 120px tall. All links are mock hrefs.

---

### `Skeleton`

**Status:** `✅ done` | **Files:** `components/ui/Skeleton.tsx`

```ts
interface SkeletonProps { className?: string; style?: React.CSSProperties; }
```

Renders `<div className="skeleton ...">`. `.skeleton` shimmer defined in `app/globals.css`. Use `style` for width/height when Tailwind arbitrary values aren't clean.

---

### `Badge`

**Status:** `✅ done` | **Files:** `components/ui/Badge.tsx`

```ts
interface BadgeProps { variant: "sale" | "new" | "sold-out"; className?: string; }
```

Fjalla One 12px uppercase, `rounded-none`, `px-2.5 py-1.5`. `-webkit-text-stroke: 0.3px white`. `sale` → `bg-accent` (red), `new` → `bg-primary` (black), `sold-out` → grey.

---

### `Button`

**Status:** `✅ done` | **Files:** `components/ui/Button.tsx`

```ts
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "base" | "lg";
  fullWidth?: boolean;
}
```

`rounded-none` always. ATC button on product page is NOT this component — it's an inline `<button>` with `rounded-base` (6px) per spec.

---

### `StarRating`

**Status:** `✅ done` | **Files:** `components/ui/StarRating.tsx`

```ts
interface StarRatingProps {
  rating: number;     // 0–5, supports decimals
  max?: number;       // default 5
  size?: number;      // px, default 14
  color?: string;     // default var(--color-star)
  className?: string;
}
```

SVG polygon stars (Feather-style) with linear-gradient partial fill for fractional ratings. Default color `var(--color-star)` = `var(--color-foreground-subtle)` (#8c8c8c). Empty star fill: `var(--color-border-light)`.

---

### `ProductCard`

**Status:** `✅ done` | **Files:** `components/products/ProductCard.tsx`

```ts
interface ProductCardProps { product: Product; }
```

Client component (hover zone state). Left zone → `sortOrder:1` image; right zone → `sortOrder:2` image — both `<Image fill>` overlays with `transition: var(--transition-nav)` opacity. Falls back to color-tinted divs when `product.photos` is empty. `next/image` remotePatterns wired in `next.config.ts` from `NEXT_PUBLIC_API_URL`.

Badge logic: `sold-out` if `!product.available`; `sale` if `compareAtPrice && compareAtPrice < basePrice`; `new` if `product.tags?.includes("new")`. Price display: `basePrice` crossed out, `compareAtPrice` shown as current price when on sale. Badge positioned `top-3 left-3`, `md:scale-120 md:top-4 md:left-4`.

---

### `ProductCardSkeleton`

**Status:** `✅ done` | **Files:** `components/products/ProductCardSkeleton.tsx`

No props. `aspect-[4/5]` shimmer + two detail lines. Matches `ProductCard` dimensions exactly.

---

### `VariantPicker`

**Status:** `✅ done` | **Files:** `components/products/VariantPicker.tsx`

```ts
interface VariantPickerProps {
  colors: ProductColor[];       // { name, hex, available }[]
  sizes: ProductSize[];         // { label, available }[]
  selectedColor: string | null;
  selectedSize: string | null;
  onColorChange: (name: string) => void;
  onSizeChange: (label: string) => void;
}
```

Color swatches: 149×30px, `border-radius: var(--radius-swatch)` (2px). Sold-out: `opacity: 0.65`, `cursor: no-drop`. Empty arrays hide the respective section.

---

### `ReviewItem`

**Status:** `✅ done` | **Files:** `components/products/ReviewItem.tsx`

```ts
interface ReviewItemProps { review: Review; }
```

Three rows: (1) `StarRating` + date right-aligned (Montserrat 12px); (2) author (Montserrat 16px weight-600, no uppercase) + gray-filled "Verified" badge (9px white text, column-adjusted layout); (3) body (Montserrat weight-500, `rgb(115,115,115)`). Card: `borderTop: 0.667px solid rgba(0,0,0,0.1)`, `py-4`. Date: MM/DD/YYYY. Verified shown unconditionally (no API field).

---

### `ReviewsBlock`

**Status:** `✅ done` | **Files:** `app/products/[slug]/ReviewsBlock.tsx`

```ts
interface ReviewsBlockProps {
  productId: string;
  initialReviews: Review[];   // server-fetched first page
  totalReviews: number;
}
```

Client Component. Summary row: single star + Fjalla One 32px weight-600 score + Fjalla One 12px `rgb(156,156,156)` sub-text + "Write a review" button right-aligned (Fjalla One 14px bold, `padding: 8px 32px`, 2px border). Sort dropdown: Most Recent / Highest / Lowest, client-side `useMemo` (Fjalla One 14px, `borderBottom: 0.667px solid rgba(0,0,0,0.1)`, `padding: 4px 20px 4px 0`). Inline write-review form: star picker, textarea, display name, email, submit via `createReview()` from `lib/api/reviews-client.ts` → on success shows pending-approval message (not prepended). Load More uses `listReviewsByProductClient()`. Known gap: no review title (API `Review` has no `title` field).

---

### `OrderStatusBadge`

**Status:** `✅ done` | **Files:** `components/account/OrderStatusBadge.tsx`

```ts
interface OrderStatusBadgeProps {
  status: "unfulfilled" | "fulfilled" | "partially_fulfilled" | "cancelled";
  className?: string;
}
```

Color map: unfulfilled → grey, fulfilled → green (`--color-status-success-*`), partially_fulfilled → amber (`--color-status-warning-*`), cancelled → destructive red. Fjalla One 11px uppercase, `rounded-none`, `h-6 min-w-[72px] inline-flex items-center justify-center`.

---

### `AddressCard`

**Status:** `✅ done` | **Files:** `components/account/AddressCard.tsx`

```ts
interface AddressCardProps {
  address: AddressDto; // { id, label, firstName, lastName, address1, address2?, city, province, postalCode, country }
  heading?: string;
  editable?: boolean; // default false
}
```

Border `var(--color-border)`. Optional `heading`: Fjalla One 11px uppercase. `editable={true}` renders inert Edit (neutral ghost) + Delete (`--color-destructive` border/text) buttons.

---

### `PaymentStatusBadge`

**Status:** `✅ done` | **Files:** `components/account/PaymentStatusBadge.tsx`

```ts
interface PaymentStatusBadgeProps {
  status: "paid" | "pending" | "refunded" | "failed";
  className?: string;
}
```

Color map: paid → green, pending → grey, refunded → grey bg + destructive text, failed → warning bg/fg. Fjalla One 11px uppercase, `rounded-none`, `h-6 min-w-[72px] inline-flex items-center justify-center`.

---

### `SearchPopup` — Search Banner

**Status:** `✅ done` | **Files:** `components/layout/SearchPopup.tsx`

```ts
interface SearchPopupProps {
  open: boolean;
  onClose: () => void;
  background: string;  // e.g. "var(--color-foreground-dark)"
  textColor: string;   // e.g. "var(--color-on-dark)"
}
```

Portal-rendered (`ReactDOM.createPortal`). Fixed banner at `top: 0`, full-width, slides from `-translateY(100%)` to `translateY(0)`. Background/textColor match current Navbar route theme. Backdrop `rgba(0,0,0,0.55)` z-[70]; popup z-[80]. Esc closes; form submit → `/products?q=...` via `router.push`. Static — no live results.
