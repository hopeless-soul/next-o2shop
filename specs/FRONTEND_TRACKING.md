# Frontend Tracking — o2shop

> Pair file: `specs/FRONTEND_PROGRESS.md` (completed work history) · `specs/DESIGN_SYSTEM.md` (visual spec)
> Last updated: 2026-05-25

---

## Agent Instructions

Before starting any task:

1. **Claim it** — find a `⬜ todo` entry, change `**Status:**` to `🔄 in-progress` and set `**Owner:**` to a short identifier (e.g. `session-3`, `agent-products`). **Update the Quick Status Table row** (status + owner + date) at the same time.
2. **Read context** — `specs/DESIGN_SYSTEM.md` for all visual rules. Never hardcode hex values; use `var(--color-*)` tokens.
3. **Re-read the API spec** — `C:\Users\hk\Documents\Development\nest\nest-o2shop\specs\openapi.json` is dynamic; always re-read it fresh. The endpoint names below are descriptive — verify actual paths and schemas from that file.
4. **Do not touch** any section another agent has `🔄 in-progress`.
5. **Log every change** — append a row to the section's **Change Log** table with today's date, your agent identifier, and a one-line description of what changed. Do this for every meaningful edit, not just when marking done.
6. **Mark done** — change `**Status:**` to `✅ done` in the section header, **update the Quick Status Table row**, and add any final notes to **Comments / Blockers** only when the route/component renders correctly in `npm run dev` with no console errors.

Status key: `⬜ todo` · `🔄 in-progress` · `✅ done` · `🔒 stable` (built, do not modify without explicit instruction)

---

## Quick Status Table

| Task | Type | Status | Owner | Updated |
|---|---|---|---|---|
| `/` home hero | route | ✅ done | session-2 | 2026-05-25 |
| `/products` list | route | ⬜ todo | — | — |
| `/products/[slug]` detail | route | ⬜ todo | — | — |
| `/login` | route | ⬜ todo | — | — |
| `/register` | route | ⬜ todo | — | — |
| `/account` dashboard | route | ⬜ todo | — | — |
| `/account/orders/[id]` | route | ⬜ todo | — | — |
| `CartDrawer` | component | ⬜ todo | — | — |
| `SearchPopup` | component | ✅ done | session-6 | 2026-05-26 |
| `Navbar` | component | ✅ done | session-5 | 2026-05-26 |
| `Footer` | component | 🔒 stable | session-4 | 2026-05-25 |
| `Skeleton` | component | 🔒 stable | session-2 | 2026-05-25 |
| `Badge` | component | 🔒 stable | session-2 | 2026-05-25 |
| `Button` | component | 🔒 stable | session-2 | 2026-05-25 |
| `StarRating` | component | 🔒 stable | session-2 | 2026-05-25 |
| `ProductCard` | component | 🔒 stable | session-2 | 2026-05-25 |
| `ProductCardSkeleton` | component | 🔒 stable | session-2 | 2026-05-25 |
| `VariantPicker` | component | 🔒 stable | session-2 | 2026-05-25 |
| `ReviewItem` | component | 🔒 stable | session-2 | 2026-05-25 |
| `OrderStatusBadge` | component | 🔒 stable | session-2 | 2026-05-25 |
| `AddressCard` | component | 🔒 stable | session-2 | 2026-05-25 |

---

## Routes

---

### `/` — Home

**Status:** `✅ done`
**Owner:** session-2
**Files:** `app/page.tsx`

**Current state**
Static dark hero (`var(--color-foreground-dark)` background), "O2SHOP" headline, "Shop Now" CTA → `/products`. Navbar is transparent and overlays the hero. No data fetching.

**API resources** *(future — not required now)*
- Featured products: `GET /products?featured=true` — below-fold section not yet designed

**Components used**
- None (static JSX only)

**Skeleton spec**
N/A — fully static page.

**Visual notes**
- Navbar MUST stay transparent on this route (hero background bleeds into header)
- `<section>` is `min-h-screen` so it fills the viewport behind the fixed navbar
- CTA button: Fjalla One 13px uppercase, white border, no fill, border-2

**Comments / Blockers**
Done. No API work needed for initial launch.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — static dark hero, transparent navbar overlay, Shop Now CTA |

---

### `/products` — Products List

**Status:** `⬜ todo`
**Owner:** —
**Files:** `app/products/page.tsx`

**Current state**
Prototype with 8 mock products from `lib/mock-data.ts`. Has a manual "Show Skeleton / Show Products" toggle button — **remove this toggle** when wiring real data. Skeleton renders 8 × `ProductCardSkeleton` during load.

**API resources** *(check openapi.json for exact paths/schemas)*
- **Products list** — paginated, supports `?category=` filter. Map response items to the `Product` shape in `lib/mock-data.ts` (or create a separate API type and adapt).
- **Categories list** — for the filter strip at the top. Alternatively hardcode from `MOCK_CATEGORIES` in `lib/mock-data.ts` if no categories endpoint exists yet.

**Components used**
- `ProductCard` (`components/products/ProductCard.tsx`) — one per product
- `ProductCardSkeleton` (`components/products/ProductCardSkeleton.tsx`) — shown while fetching
- `Badge` (`components/ui/Badge.tsx`) — rendered inside `ProductCard` automatically

**Skeleton spec**
Show 8 × `ProductCardSkeleton` arranged in the same 4-col/2-col grid while data is loading. Use React Suspense or a loading state derived from the fetch. Remove the toggle button entirely.

**Visual notes**
- Grid: `grid-cols-2 md:grid-cols-4`, `gap-[2px]` desktop / `gap-[1px]` mobile, `p-[2px]`
- Page heading: h1 Fjalla One 32px uppercase — use actual category name from URL param
- Filter strip: active filter = dark bg + white text; inactive = transparent + border
- Breadcrumbs: Home / {Category name}
- Item count: show real count from API response (e.g., "24 products")
- Pagination or infinite scroll — design TBD; stub with "Load more" button if needed

**Comments / Blockers**
Remove `"use client"` if data fetching moves to a Server Component. `ProductCard` is currently a client component (for hover zones) so the page can remain a Server Component if cards are imported as islands.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial prototype — 8 mock products, shimmer skeleton, filter strip placeholder, skeleton toggle button |

---

### `/products/[slug]` — Product Detail

**Status:** `⬜ todo`
**Owner:** —
**Files:** `app/products/[slug]/page.tsx`

**Current state**
Prototype that reads `slug` from `useParams()` and finds the product in `MOCK_PRODUCTS`. Has a manual skeleton toggle — **remove it** when wiring real data. `VariantPicker`, ATC button, `<details>` accordion, and reviews section all present.

**API resources** *(check openapi.json for exact paths/schemas)*
- **Single product** — fetch by slug or ID. Resolve `params.slug` → product data.
- **Product reviews** — may be a sub-resource (`/products/:id/reviews`) or embedded in the product response.

**Components used**
- `Badge` — if `product.badge` is non-null
- `VariantPicker` — colors + sizes from API response
- `StarRating` — computed average of review ratings
- `ReviewItem` — one per review
- `Button` — "Write a Review" ghost button
- `Skeleton` — image, thumbnails, right-column skeleton during load

**Skeleton spec**
While loading:
- Left 60%: full `aspect-[4/5]` shimmer block + 3 × thumbnail shimmer strips (80×100px each)
- Right 40%: shimmer for badge (optional), h1 line, price line, variant picker area (2 rows), ATC button rect

**Visual notes**
- Left/right split: `md:w-[60%]` / `md:w-[40%]`, flex row on md+
- Thumbnail strip below main image, horizontal row, `80px wide × 100px tall`, selected = dark border
- ATC button: `h-[var(--atc-height)]` (56px), `w-full`, `rounded-base` (6px), `bg-primary`
- Product title: Fjalla One, `clamp(1.5rem, 3vw, 2.6rem)`, `text-transform: capitalize`
- Price: Fjalla One 22px; crossed-out original price at 16px opacity-50 if sale
- `<details>` accordion: summary = Fjalla One 13px uppercase with "+" indicator; body = Montserrat 14px

**Comments / Blockers**
Currently `"use client"` because of `useParams()` + variant state. If migrating to Server Component, use `params` prop (Next.js 15 — it's a Promise; `await params`). Keep variant selection as a client island.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial prototype — 60/40 split layout, mock product lookup by slug, variant picker, ATC button, accordion, reviews |

---

### `/login` — Login

**Status:** `⬜ todo`
**Owner:** —
**Files:** `app/login/page.tsx`

**Current state**
Presentational form only — no action wired. Email + password fields, "Sign In" button, "Forgot password?" link, link to `/register`.

**API resources** *(check openapi.json for exact paths/schemas)*
- **Login** — POST with email + password → returns token / sets session cookie
- **Current user** — optional: fetch after login to confirm session before redirect

**Components used**
- `Button` (primary, fullWidth, lg) — submit

**Skeleton spec**
N/A — form is static. Show a loading spinner or disable the button during submission.

**Visual notes**
- Container: centered card, `max-w-md`, `bg-card`, `shadow-2` (`0 0 10px rgba(0,0,0,0.1)`)
- Inputs: `border: 1px solid var(--color-border-input)` (very dark navy), `rounded-base`, white bg
- Input labels: Montserrat 12px bold uppercase tracking-widest
- Error state: show error message below the button in Montserrat 13px `color: var(--color-destructive)`
- On success: redirect to `/account`

**Comments / Blockers**
Use Next.js Server Actions or a client-side fetch — TBD based on auth strategy. If using JWT, store in httpOnly cookie via a route handler.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial prototype — presentational form, email + password fields, link to /register |

---

### `/register` — Register

**Status:** `⬜ todo`
**Owner:** —
**Files:** `app/register/page.tsx`

**Current state**
Presentational form — first name, last name, email, password, confirm password. "Create Account" button. Link to `/login`.

**API resources** *(check openapi.json for exact paths/schemas)*
- **Register** — POST with first name, last name, email, password → creates account + returns token/session

**Components used**
- `Button` (primary, fullWidth, lg) — submit

**Skeleton spec**
N/A — static form.

**Visual notes**
- Same card layout as `/login`
- Client-side validate: passwords match before submitting
- Error state: Montserrat 13px `color: var(--color-destructive)` below button
- On success: redirect to `/account`

**Comments / Blockers**
Mirror the auth strategy chosen for `/login`.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial prototype — presentational form, 5 fields, passwords match validation placeholder |

---

### `/account` — Account Dashboard

**Status:** `⬜ todo`
**Owner:** —
**Files:** `app/account/page.tsx`

**Current state**
Prototype with `MOCK_ORDERS` and `MOCK_ADDRESSES`. Renders an order history table (5 cols + View action) and a 2-col address grid. No auth guard.

**API resources** *(check openapi.json for exact paths/schemas)*
- **Current user** — GET to verify auth; redirect to `/login` if unauthenticated
- **Orders list** — GET current user's orders; map to `Order` shape from `lib/mock-data.ts`
- **Addresses list** — GET saved addresses for the current user

**Components used**
- `OrderStatusBadge` — fulfillment + payment status cells
- `AddressCard` — one per saved address

**Skeleton spec**
While fetching orders:
- Table: show 3 skeleton rows; each row = 6 shimmer cells of varying widths
While fetching addresses:
- Grid: show 2 skeleton cards at `h-36`

**Visual notes**
- Page padding: `pt-[var(--header-height-desktop)]`, `px-[var(--header-px-desktop)]`
- Section headings: Fjalla One 18px uppercase `tracking-[0.36px]`
- Order table "View" button: `bg-accent text-accent-foreground`, Fjalla One 11px uppercase
- Add Address button: ghost style, top-right of addresses section
- Empty state (no orders): center-aligned Montserrat text "No orders yet." with a "Start Shopping" CTA

**Comments / Blockers**
Requires auth — add a redirect to `/login` if no session. `AddressCard` "Edit" button is currently inert; wire to an inline edit form or modal in a future task.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial prototype — order history table, saved addresses grid, mock data from lib/mock-data.ts |

---

### `/account/orders/[id]` — Order Detail

**Status:** `⬜ todo`
**Owner:** —
**Files:** `app/account/orders/[id]/page.tsx`

**Current state**
Prototype with `MOCK_ORDERS[0]` as default. Has skeleton toggle (remove when wiring). Renders: order header + status, status timeline stepper, line items table with totals, billing + shipping address cards.

**API resources** *(check openapi.json for exact paths/schemas)*
- **Current user** — verify auth; redirect to `/login` if unauthenticated
- **Single order** — GET by ID; confirm the order belongs to the current user

**Components used**
- `OrderStatusBadge` — order header + timeline
- `AddressCard` — billing + shipping
- `Skeleton` — header, table rows, address cards during load

**Skeleton spec**
`isLoading = true` initial state:
- Header: one `h-9 w-64` shimmer + one `h-5 w-40` shimmer
- Table: 2 × skeleton rows with 6 cells each
- Addresses: 2 × `h-36` skeleton blocks side-by-side

**Visual notes**
- Breadcrumbs: Home / Account / Order #XXXXXX
- Status timeline: 4 steps (Placed → Processing → Shipped → Delivered), horizontal connector bars
  - Completed steps: filled dark circle + dark connector
  - Future steps: open circle + light border connector
  - Cancelled order: skip timeline entirely
- Totals: right-aligned below table, `max-w-xs ml-auto`
- "Shipping: Free" when `order.shipping === 0`

**Comments / Blockers**
The `id` param must match the backend's order ID format. If IDs are UUIDs (not the `COOL*` display numbers), fetch by UUID and display the `number` field as the human-readable reference.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial prototype — status timeline stepper, line items table with totals, address cards, shimmer skeleton toggle |

---

## Components — Planned (not yet built)

---

### `CartDrawer` — Slide-in Cart

**Status:** `⬜ todo`
**Owner:** —
**Files:** `components/layout/CartDrawer.tsx` *(create)*

**Props interface**
```ts
interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}
```

**API resources** *(check openapi.json for exact paths/schemas)*
- **Cart** — GET current cart (items, quantities, subtotal)
- **Add to cart** — POST (called from ATC button on product page)
- **Update quantity** — PATCH or PUT on cart item
- **Remove item** — DELETE cart item

**Skeleton spec**
While loading cart:
- 2–3 skeleton rows: `100px × 100px` image placeholder + two text shimmer lines beside it

**Visual notes** *(from DESIGN_SYSTEM.md §8o)*
- Width: `var(--cart-drawer-width)` = 458px; slides in from right
- Overlay: `rgba(0,0,0,0.55)` behind drawer
- Background: white; footer area: `var(--color-muted-2)` (`#f1f1f1`)
- CTA button: black bg, white text, 64px height, full width
- Product image: 100px wide, `rounded-sm` (4px)
- Cart badge on Navbar icon: `var(--color-badge-cart)` = `#e64984` (pink — NOT brand accent)
- Shadow: `var(--shadow-4)` on drawer panel

**Comments / Blockers**
Navbar cart icon badge count must be wired to cart item count from the same cart state. Consider React Context or Zustand for client-side cart state if real-time updates are needed.

**Change Log**

| Date | Agent | Change |
|---|---|---|

---

## Components — Stable (do not modify without explicit instruction)

---

### `Navbar` — Site Header

**Status:** `✅ done`
**Owner:** session-3
**Files:** `components/layout/Navbar.tsx`

**Props interface**
```ts
interface NavbarProps {
  background?: string;        // bg color when at top of page (default: var(--color-foreground-dark))
  textColor?: string;         // text + icon + logo color at top (default: var(--color-on-dark))
  scrolledBackground?: string; // bg color when scrolled (default: var(--color-foreground-dark))
  scrolledColor?: string;     // text + icon + logo color when scrolled (default: var(--color-on-dark))
}
```

**Notes**
Fixed header with route-based theming via `usePathname()`. Logo is centered (3-col grid layout) using `/public/logo.svg` tinted via CSS `filter`. Route configs: `/` uses dark bg + white text always; `/products*` uses transparent bg + dark text at top, dark bg + white text on scroll. Props accept overrides. Category dropdowns with 80ms hover-intent close delay. Mobile slide-in drawer. Cart badge hardcoded at 3 — wire to cart state when `CartDrawer` is built.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — transparent/scroll header, category dropdowns, mobile drawer, lucide-react icons, cart badge |
| 2026-05-25 | session-3 | SVG logo centered (3-col grid), NavbarProps (background/textColor/scrolledBackground/scrolledColor), route-based theming via usePathname for `/` and `/products*` |
| 2026-05-25 | session-3 | Extracted `<nav>` from `<header>`; logo row owns `height: var(--header-height-desktop)`; category nav is fixed sibling at `top: var(--header-height-desktop)`, height 40px, with shadow |
| 2026-05-26 | session-5 | Made `Category.items` optional in `lib/mock-data.ts`; added `ChevronDown` (lucide-react) to expandable category labels; desktop + mobile drawer render plain links for categories with no items |

---

### `Footer` — Site Footer

**Status:** `🔒 stable`
**Owner:** session-2
**Files:** `components/layout/Footer.tsx`

**Props interface**
```ts
// No props — static link groups hardcoded in file
```

**Notes**
3-column desktop (brand 28% / links grid 72%) / column-reverse mobile. All links are mock hrefs — update to real routes once those pages exist.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — 3-column layout, Montserrat link groups, copyright strip |
| 2026-05-25 | session-4 | Replaced "O2SHOP" text link with `<Image src="/logo.svg">` at 120px tall in brand column |

---

### `Skeleton`

**Status:** `🔒 stable`
**Files:** `components/ui/Skeleton.tsx`

**Props interface**
```ts
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}
```

**Notes**
Renders a `<div className="skeleton ...">`. The `.skeleton` class is defined in `app/globals.css` — shimmer gradient animation. Use `style` for width/height when Tailwind arbitrary values aren't clean enough.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — shimmer keyframes in globals.css, passthrough className/style props |

---

### `Badge`

**Status:** `🔒 stable`
**Files:** `components/ui/Badge.tsx`

**Props interface**
```ts
interface BadgeProps {
  variant: "sale" | "new" | "sold-out";
  className?: string;
}
```

**Notes**
Fjalla One 11px uppercase, `rounded-none`, tight padding. `sale` → red (`bg-accent`), `new` → black (`bg-primary`), `sold-out` → grey.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — sale/new/sold-out variants |

---

### `Button`

**Status:** `🔒 stable`
**Files:** `components/ui/Button.tsx`

**Props interface**
```ts
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "base" | "lg";
  fullWidth?: boolean;
}
```

**Notes**
`rounded-none` always. ATC button on product page is NOT this component — it's an inline `<button>` with `rounded-base` (6px) per spec. Use `Button` for all other CTAs.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — primary/secondary/ghost variants, sm/base/lg sizes, fullWidth prop |

---

### `StarRating`

**Status:** `🔒 stable`
**Files:** `components/ui/StarRating.tsx`

**Props interface**
```ts
interface StarRatingProps {
  rating: number;     // 0–5, supports decimals
  max?: number;       // default 5
  size?: number;      // px, default 14
  className?: string;
}
```

**Notes**
SVG polygon stars with linear-gradient partial fill for fractional ratings. Color: `var(--color-accent)` filled, `#e0e0e0` empty.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — SVG stars, linear-gradient partial fill for decimal ratings |

---

### `ProductCard`

**Status:** `🔒 stable`
**Files:** `components/products/ProductCard.tsx`

**Props interface**
```ts
interface ProductCardProps {
  product: Product; // from lib/mock-data.ts
}
```

**Notes**
Client component (hover zone state). Left/right hover zones → opacity fade on second color placeholder. No real `<img>` tags yet — uses color-tinted divs as placeholders. **When real product images exist:** replace color divs with `<Image>` from `next/image`; add `images` array to the `Product` type (already exists as `string[]`, just needs real URLs). Badge rendered automatically if `product.badge` is set.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — left/right hover zones, color-tinted placeholder divs, 4:5 ratio, badge overlay |

---

### `ProductCardSkeleton`

**Status:** `🔒 stable`
**Files:** `components/products/ProductCardSkeleton.tsx`

**Props interface**
```ts
// No props
```

**Notes**
`aspect-[4/5]` shimmer block + two detail lines. Matches `ProductCard` dimensions exactly.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — 4:5 image shimmer + two detail line skeletons |

---

### `VariantPicker`

**Status:** `🔒 stable`
**Files:** `components/products/VariantPicker.tsx`

**Props interface**
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

**Notes**
Color swatches: 149×30px rectangles per design spec, `border-radius: var(--radius-swatch)` (2px). Sold-out = `opacity: 0.65`, `cursor: no-drop`. Empty `colors` or `sizes` arrays hide the respective section.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — 149×30px color swatches, size buttons, sold-out states |

---

### `ReviewItem`

**Status:** `🔒 stable`
**Files:** `components/products/ReviewItem.tsx`

**Props interface**
```ts
interface ReviewItemProps {
  review: Review; // { id, author, rating, date, text }
}
```

**Notes**
Initials avatar circle (`var(--color-foreground-mid)` bg), author name Fjalla One 14px uppercase, date Montserrat 12px right-aligned, `StarRating` below name, review text Montserrat 14px.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — initials avatar, star rating, Montserrat body copy |

---

### `OrderStatusBadge`

**Status:** `🔒 stable`
**Files:** `components/account/OrderStatusBadge.tsx`

**Props interface**
```ts
interface OrderStatusBadgeProps {
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  className?: string;
}
```

**Notes**
Color map: pending → grey, processing → amber (`#fff3cd`/`#856404`), shipped → blue (`#cce5ff`/`#004085`), delivered → green (`#d4edda`/`#155724`), cancelled → destructive red. Fjalla One 11px uppercase, `rounded-none`.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — 5-status color map, Fjalla One uppercase |

---

### `AddressCard`

**Status:** `🔒 stable`
**Files:** `components/account/AddressCard.tsx`

**Props interface**
```ts
interface AddressCardProps {
  address: Address; // { id, label, firstName, lastName, line1, line2?, city, state, zip, country }
  heading?: string; // e.g. "Shipping Address"
}
```

**Notes**
Border `var(--color-border)`. Optional `heading` label rendered as Fjalla One 11px uppercase above the address. "Edit" button is currently inert — wire when edit flow is designed.

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-25 | session-2 | Initial build — address display, optional heading, inert Edit button |

---

### `SearchPopup` — Search Banner

**Status:** `✅ done`
**Owner:** session-6
**Files:** `components/layout/SearchPopup.tsx` *(created)*

**Props interface**
```ts
interface SearchPopupProps {
  open: boolean;
  onClose: () => void;
  background: string;  // CSS var string, e.g. "var(--color-foreground-dark)"
  textColor: string;   // CSS var string, e.g. "var(--color-on-dark)"
}
```

**Visual notes**
- Fixed banner at `top: 0`, full viewport width, slides down from `-translateY(100%)` to `translateY(0)`
- Background and text color match current Navbar route theme (passed as props from Navbar)
- Semi-transparent dark backdrop (rgba 0,0,0,0.55) behind the popup; click backdrop to close
- Contains: close (X) button, h4 "What are you looking for?", search input + submit button
- Esc key closes; form submit navigates to `/products?q=...` via `router.push`
- Static shell only — no live results in this iteration
- Portal-rendered (`ReactDOM.createPortal`) to avoid z-index conflicts; backdrop z-[70], popup z-[80]

**Change Log**

| Date | Agent | Change |
|---|---|---|
| 2026-05-26 | session-6 | Created SearchPopup component; wired Search icon in Navbar |
