# Frontend Progress — o2shop

> Last updated: 2026-05-27

---

## Session 1 — Design System Extraction

Scraped and reverse-engineered the reference Shopify store (Cool Shirtz) across 7 pages using Playwright MCP and static HTML file analysis.

**Output:** `specs/DESIGN_SYSTEM.md`

Captured:
- Color tokens (23 semantic names → hex + oklch)
- Typography scale (Fjalla One primary, Montserrat secondary, roles per element)
- Spacing scale (9 tokens, `--space-1` through `--space-15`)
- Border radius scale (8 tokens)
- Elevation/shadow scale (5 levels)
- Motion tokens (4 transition presets)
- Layout constants (header heights, gutters, ATC height, cart drawer width)
- Component inventory: Header, Footer, Buttons, Product Card, Swatches, Size Selector, Order Tables, Account Layout, Checkout, FAQ
- Product card hover interaction (dual hover-zone image-swap mechanic)
- Screenshots at `specs/screenshots/<slug>/{desktop,tablet,mobile}.png`

All tokens were then applied to `app/globals.css` as CSS custom properties and mapped to Tailwind v4 utilities via `@theme inline`.

---

## Session 2 — Public Pages + Skeleton Components

Built all public-facing pages and shared layout components. No real API calls — mock data only. Aesthetic: editorial streetwear (bold Fjalla One uppercase, flat design, red accent `#e55151`, sharp edges).

### Dependencies added
- `lucide-react` — icons (Search, User, ShoppingBag, Menu, X)

### Foundation

| File | Change |
|---|---|
| `app/layout.tsx` | Replaced Geist fonts with Fjalla One + Montserrat via `next/font/google`; added Navbar + Footer to root layout |
| `app/globals.css` | Added `@keyframes shimmer` and `.skeleton` utility class for shimmer loading states |
| `app/page.tsx` | Replaced Next.js boilerplate with a dark hero section matching the transparent navbar aesthetic |
| `lib/mock-data.ts` | Created typed mock data: 4 categories (with sub-items), 8 products, 5 reviews, 3 orders, 2 addresses |

### Components

**Layout**
- `components/layout/Navbar.tsx` — Fixed header, transparent → solid on scroll (8px threshold), category dropdowns with hover-intent delay (80ms), cart icon with badge, mobile slide-in drawer with overlay
- `components/layout/Footer.tsx` — 3-column desktop / column-reverse mobile, Montserrat link groups, copyright strip

**UI Primitives**
- `components/ui/Skeleton.tsx` — Shimmer skeleton primitive (passthrough className/style)
- `components/ui/Badge.tsx` — Variants: `sale` (red), `new` (black), `sold-out` (grey); Fjalla One 11px uppercase
- `components/ui/Button.tsx` — Variants: `primary`, `secondary`, `ghost`; sizes: `sm`, `base`, `lg`; `fullWidth` prop
- `components/ui/StarRating.tsx` — SVG stars with linear-gradient partial fill for fractional ratings

**Products**
- `components/products/ProductCard.tsx` — Left/right hover zones (opacity fade), color-tinted placeholder backgrounds, sale badge overlay, 4:5 aspect ratio per spec
- `components/products/ProductCardSkeleton.tsx` — Shimmer placeholder at exact 4:5 ratio matching card dimensions
- `components/products/VariantPicker.tsx` — 149×30px color swatches (design spec dimensions), size buttons, sold-out opacity + strikethrough states
- `components/products/ReviewItem.tsx` — Initials avatar, star rating, Montserrat body copy

**Account**
- `components/account/OrderStatusBadge.tsx` — Color-coded per status: pending (grey), processing (amber), shipped (blue), delivered (green), cancelled (red)
- `components/account/AddressCard.tsx` — Address display with inert "Edit" button

### Pages

All interactive pages include a **"Show Skeleton ↔ Show Products"** toggle button for prototyping/demo purposes.

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Dark hero, transparent navbar overlay, "Shop Now" CTA |
| `/products` | `app/products/page.tsx` | 4-col desktop / 2-col mobile grid (2px gap), filter strip placeholder, 8 skeleton or product cards |
| `/products/[slug]` | `app/products/[slug]/page.tsx` | 60/40 split layout; image + thumbnail strip left; badge, title, price, star rating, VariantPicker, ATC button, `<details>` accordion sections, reviews section right |
| `/login` | `app/login/page.tsx` | Centered card, email + password inputs, link to register |
| `/register` | `app/register/page.tsx` | Same layout, first/last name + email + password + confirm |
| `/account` | `app/account/page.tsx` | Order history table (5 columns + View action), saved addresses 2-col card grid |
| `/account/orders/[id]` | `app/account/orders/[id]/page.tsx` | Status timeline stepper, line items table with totals, billing + shipping address cards, shimmer skeleton state |

### Build output (verified)

```
Route (app)
○  /                          static
○  /account                   static
ƒ  /account/orders/[id]       dynamic
○  /login                     static
○  /products                  static
ƒ  /products/[slug]           dynamic
○  /register                  static
```

All routes compile with zero TypeScript errors and zero ESLint warnings.

---

## Session 5 — Navbar Category Nav: ChevronDown + Optional Items

**Files changed:** `components/layout/Navbar.tsx`, `lib/mock-data.ts`

### Changes

- Made `Category.items` optional (`items?`) in `lib/mock-data.ts` — allows leaf/single categories with no sub-items
- Added `ChevronDown` (12px, lucide-react, static) inline after the label on expandable categories in the desktop nav
- Desktop nav: expandable categories (have `items`) keep the existing hover dropdown; leaf categories (no `items`) render as plain `<Link>` with no icon and no dropdown
- Mobile drawer: expandable categories keep the existing section header + sub-item list; leaf categories render as a plain `<Link>` row directly in the nav

### Build verified

- `npm run lint` — clean (0 errors, 0 warnings)
- Dev server at `http://localhost:3000` — 0 console errors; all 4 category nav items visible with chevron icons

---

---

## Session 6 — Navbar Search Popup Component

**Files changed:** `components/layout/SearchPopup.tsx` *(created)*, `components/layout/Navbar.tsx`, `specs/FRONTEND_TRACKING.md`

### Changes

- Created `components/layout/SearchPopup.tsx` — fixed banner that slides down from `top: 0` on search icon click
- Popup uses `background` + `textColor` props passed from Navbar so it always matches the current route theme
- Semi-transparent dark backdrop (rgba 0,0,0,0.55) behind popup; backdrop click closes it
- Close triggers: close (×) button, backdrop click, Esc key
- Form submits via `router.push('/products?q=...')` — no dedicated `/search` route needed
- Static shell only — no live search results in this iteration
- No React portal needed: popup rendered as a fragment sibling to `<header>` (not nested inside it), so z-index stacking context is clean without a portal
- Backdrop `z-[70]`, popup panel `z-[80]` — both above mobile drawer (z-60/z-61) and Navbar (z-50)
- Wired Navbar Search icon `onClick → setSearchOpen(true)`; merged body `overflow: hidden` effect to block on either `mobileOpen || searchOpen`
- Removed `SearchOverlay` entry from `FRONTEND_TRACKING.md`; added `SearchPopup` entry in Components group

### Build verified

- `npm run lint` — clean (0 errors, 0 warnings)

---

## What's Next

- Connect pages to the O2Shop API (`C:\Users\hk\Documents\Development\nest\nest-o2shop\specs\openapi.json`)
- Replace mock data with real `fetch` calls (Server Components where possible)
- Implement actual auth flow (login/register → session/token handling)
- Cart drawer component (458px wide, per design spec §8o)
- Hero section on home page with real imagery
- Live search results in SearchPopup (debounced API call, result rows)
- Sticky ATC bar on mobile product page (§10 open question #3)
- Confirm header scroll-state background color (§10 open question #9)

---

## Session 7 — Badge Resize

**Date:** 2026-05-26
**Files changed:** `components/ui/Badge.tsx`, `specs/FRONTEND_TRACKING.md`

Resized the `Badge` component to match the reference product card tag. Padding changed from `px-2 py-0.5` (8px/2px) to `px-2.5 py-1.5` (10px/6px). Font size changed from `text-[11px]` (arbitrary value — constraint violation) to `text-xs` (12px). Added `style={{ WebkitTextStroke: "0.3px white" }}` for legibility on colored backgrounds, matching the reference's `-webkit-text-stroke: 0.3px white`. Lint passes clean.

---

## Session 8 — Account: Payment Badge + AddressCard editable prop

**Date:** 2026-05-26
**Files changed:** `app/globals.css`, `components/account/PaymentStatusBadge.tsx` *(created)*, `components/account/OrderStatusBadge.tsx`, `components/account/AddressCard.tsx`, `app/account/page.tsx`

### Changes

**New status color tokens (`app/globals.css`)**
Added 6 semantic tokens for status badge colors (both in `:root` and `@theme inline`):
- `--color-status-success-bg/fg` — green (paid, delivered)
- `--color-status-warning-bg/fg` — amber (processing)
- `--color-status-info-bg/fg` — blue (shipped)

**New `PaymentStatusBadge` component**
Created `components/account/PaymentStatusBadge.tsx` — handles `"paid" | "pending" | "refunded"`. Uniform `h-6 min-w-[72px] inline-flex items-center justify-center` sizing. No hardcoded hex — uses `--color-status-success-*`, `--color-muted-2`, `--color-foreground-muted`, `--color-destructive` tokens.

**`OrderStatusBadge` — token cleanup + uniform sizing**
Replaced all hardcoded hex values (`#fff3cd`, `#856404`, `#cce5ff`, `#004085`, `#d4edda`, `#155724`, `#ffd9d9`) with `var(--color-status-*)` token references. Added `h-6 min-w-[72px] inline-flex items-center justify-center` so payment and fulfillment columns in the order table have uniform box dimensions.

**`AddressCard` — `editable` prop**
Added `editable?: boolean` (default `false`). When `true`, renders Edit (neutral ghost) + Delete (`--color-destructive` border/text) buttons side-by-side. Defaults to `false` so read-only usages (e.g. order detail page address cards) require no changes.

**`app/account/page.tsx`**
- Replaced the inline payment `<span>` (which had hardcoded hex) with `<PaymentStatusBadge status={order.paymentStatus} />`
- Added `editable={true}` to both `<AddressCard>` usages in the Saved Addresses section

### Build verified (session 8)
- `npm run lint` — clean (0 errors, 0 warnings)

---

## Session 9 — Schema Alignment: lib/types.ts + Mock Data

**Date:** 2026-05-26
**Files changed:** `lib/types.ts` *(created)*, `lib/mock-data.ts`, `components/account/OrderStatusBadge.tsx`, `components/account/PaymentStatusBadge.tsx`, `components/account/AddressCard.tsx`, `components/products/ReviewItem.tsx`, `components/products/ProductCard.tsx`, `components/products/VariantPicker.tsx`, `components/layout/Navbar.tsx`, `app/products/[slug]/page.tsx`, `app/account/page.tsx`, `app/account/orders/[id]/page.tsx`, `specs/FRONTEND_TRACKING.md`

### Changes

**New `lib/types.ts`**
Extracted all TypeScript type definitions out of `lib/mock-data.ts` into a dedicated `lib/types.ts`. All types are now API-aligned against the backend's OpenAPI schema:
- `SubCategory`, `Category`, `Collection` — navigation hierarchy types; `Category` replaces flat `items?` with `subCategories: SubCategory[]`
- `AddressDto` — flat address fields aligned to API (`address1`, `province`, `postalCode`, `country` ISO code); replaces old `Address`
- `SavedAddress` — outer wrapper with `id`, `name`, `shippingAddress`, `billingAddress`, `billingIsSameAsShipping`
- `ProductVariant` — full variant shape with `colorName`, `colorValue`, `size`, `sku`, `stock`, `available`, `inventoryPolicy`, etc.
- `ProductColor` / `ProductSize` — retained as UI adapter types, derived from variants at call sites
- `ProductDescriptionBlock` — discriminated union `{ type:"text"; content:string } | { type:"points"; content:string[] }`
- `Product` — API-aligned: `name` (slug), `displayName`, `basePrice`, `compareAtPrice`, `currency`, `available`, `tags`, `description: ProductDescriptionBlock[]`, `photos`, `variants[]`; removed `title`, `price`, `originalPrice`, `badge`, `colors`, `sizes`, `type`, `images`
- `Review` — `displayName`, `content`, `createdAt`, `photoUrls`; `rating` is 1–10 (API scale)
- `OrderItem` — `productName`, `productSku`, `productPrice`, `productCurrency`, `total`; removed `color`, `size`
- `OrderStatus` — `"unfulfilled" | "fulfilled" | "partially_fulfilled" | "cancelled"`
- `PaymentStatus` — `"pending" | "paid" | "failed" | "refunded"` (adds `"failed"`)
- `Order` — `orderNumber`, `createdAt`, `totalAmount`, `shippingPrice`, `shippingMethodName`, `totalCurrency`, `shippingCurrency`

**`lib/mock-data.ts` — rewritten**
All type definitions removed (now in `lib/types.ts`). All mock arrays updated to new field names and structures:
- `MOCK_CATEGORIES` — added `id`, `createdAt`, `updatedAt`; `name→displayName`; `items→subCategories` (always array)
- `MOCK_PRODUCTS` — `slug→name` (underscores), `title→displayName`, `price→basePrice`, `originalPrice→compareAtPrice`; removed `type`, `badge`, `colors`, `sizes`, `images`; added `variants[]` (full variant objects per product), `description` as blocks, `currency`, `available`, `priceMin/Max`, `priceVaries`, `rating`, `photos: []`
- `MOCK_REVIEWS` — `author→displayName`, `text→content`, `date→createdAt`; ratings converted to 1–10 scale
- `MOCK_ADDRESSES` — changed from `Address[]` to `SavedAddress[]`; each entry wraps `shippingAddress` and `billingAddress` as `AddressDto`
- `MOCK_ORDERS` — `number→orderNumber`, `date→createdAt`, `total→totalAmount`, `shipping→shippingPrice`; added `totalCurrency`, `shippingCurrency`, `shippingMethodName`; order items updated to new `OrderItem` shape; addresses now `AddressDto`

**Component updates (schema alignment)**
- `OrderStatusBadge` — new `OrderStatus` enum and STATUS_CONFIG (`unfulfilled`→grey, `partially_fulfilled`→amber, `fulfilled`→green, `cancelled`→blue-info)
- `PaymentStatusBadge` — added `"failed"` status (warning colours)
- `AddressCard` — prop `Address→AddressDto`; field refs updated (`line1→address1`, `state→province`, `zip→postalCode`)
- `ReviewItem` — field refs updated (`author→displayName`, `text→content`, `date→createdAt`); rating normalised `÷2` for StarRating
- `ProductCard` — colors derived from `variants[0/1].colorValue`; `title→displayName`, `price→basePrice`, `originalPrice→compareAtPrice`; badge derived from `available`/`compareAtPrice`/`tags`; href uses `product.name`
- `VariantPicker` — import path only: `@/lib/mock-data` → `@/lib/types`
- `Navbar` — `cat.name→cat.displayName`, `cat.items→cat.subCategories`, `item.name→subCat.displayName` throughout desktop + mobile nav

**Page updates**
- `app/products/[slug]/page.tsx` — find by `product.name`; derive `uniqueColors`/`uniqueSizes` from variants; render `ProductDescriptionBlock[]`; normalise avgRating `÷2`; badge derived inline
- `app/account/page.tsx` — `order.number→orderNumber`, `date→createdAt`, `total→totalAmount`; pass `addr.shippingAddress` to `AddressCard` with `addr.name` as heading
- `app/account/orders/[id]/page.tsx` — `STATUS_STEPS` updated to `["unfulfilled","partially_fulfilled","fulfilled"]`; order + item field renames; subtotal derived from `items.reduce`; "Color / Size" column removed

### Build verified (session 9)
- `npm run lint` — clean (0 errors, 0 warnings)

---

## Session 10 — API Integration Layer

**Date:** 2026-05-26
**Files created:** `.env.local`, `lib/api/errors.ts`, `lib/api/server.ts`, `lib/api/client.ts`, `lib/api/categories.ts`, `lib/api/auth.ts`, `lib/api/products.ts`, `lib/api/reviews.ts`, `lib/api/orders.ts`, `lib/api/addresses.ts`, `lib/api/cart.ts`, `app/products/[slug]/ProductDetailClient.tsx`
**Files modified:** `app/layout.tsx`, `components/layout/Navbar.tsx`, `app/account/page.tsx`, `app/account/orders/[id]/page.tsx`, `app/products/page.tsx`, `app/products/[slug]/page.tsx`, `CLAUDE.md`, `specs/FRONTEND_TRACKING.md`

### Dependencies added
- `axios` — HTTP client for all API calls
- `server-only` — compile-time guard preventing server-side Axios instance from leaking into browser bundles

### Infrastructure built

**Error layer (`lib/api/errors.ts`)**
Typed error class hierarchy: `ApiError` (base) → `AuthError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ValidationError` (400). `parseApiError()` factory normalises any Axios error or network failure into the correct subclass using `ErrorResponseDto` shape from the backend.

**Server Axios instance (`lib/api/server.ts`)**
- `import 'server-only'` at top — hard build error if accidentally imported client-side
- Reads `access_token` from HttpOnly cookie via `await cookies()` (Next.js 15 async API)
- Attaches as `Authorization: Bearer <token>` on every request
- Response interceptor normalises errors via `parseApiError`

**Client Axios instance (`lib/api/client.ts`)**
- `withCredentials: true` — browser sends HttpOnly cookies automatically
- Token refresh interceptor: on 401, calls `POST /auth/refresh`, queues concurrent requests, retries original after refresh; on refresh failure → `window.location.href = '/login'`
- `_retry` flag prevents infinite retry loops

**Domain services**

| File | Key functions |
|---|---|
| `lib/api/categories.ts` | `listCategories()`, `getCategoryById()` |
| `lib/api/auth.ts` | `login()`, `register()`, `logout()`, `refreshTokens()`, `getMe()` |
| `lib/api/products.ts` | `listProducts(params)`, `getProductBySlug(slug)` |
| `lib/api/reviews.ts` | `listReviewsByProduct(productId, params)`, `deleteReview(id)` |
| `lib/api/orders.ts` | `listMyOrders(params)`, `getOrderByNumber(orderNumber)` |
| `lib/api/addresses.ts` | `listAddresses()`, `createAddress()`, `updateAddress()`, `deleteAddress()` |
| `lib/api/cart.ts` | Documented stub — no cart endpoint in API yet |

### Pages wired to real API

**`app/layout.tsx`** — made async; calls `listCategories({ limit: 100 })` with `[]` fallback; passes `categories` prop to `<Navbar>`.

**`components/layout/Navbar.tsx`** — removed `MOCK_CATEGORIES` import; accepts `categories: Category[]` prop (default `[]`); both desktop nav and mobile drawer use prop.

**`app/products/page.tsx`** — converted from `"use client"` to async RSC; `searchParams` drives `categorySlug` and `search` params; filter strip uses `<Link>` elements (URL-driven); product count from `result.total`; skeleton shown when API unreachable; skeleton demo toggle removed.

**`app/products/[slug]/page.tsx`** — converted to async RSC wrapper; fetches product by slug → `notFound()` on `NotFoundError`; fetches reviews by `product.id` (UUID); renders `<ProductDetailClient>`.

**`app/products/[slug]/ProductDetailClient.tsx`** *(new file)* — client island extracted from old `page.tsx`; accepts `product: Product` and `reviews: Review[]` props; contains all variant state, image selection, ATC button.

**`app/account/page.tsx`** — made async; auth guard via `getMe()` → `redirect('/login')` on `AuthError`; `Promise.all` for orders + addresses; order detail links use `order.orderNumber`; skeleton demo toggle removed.

**`app/account/orders/[id]/page.tsx`** — converted from `"use client"` to async RSC; `params.id` is the `orderNumber` display string (e.g. `ORD-20240101-0001`); `getOrderByNumber(id)` → `notFound()` on 404; all `useState` and skeleton toggle removed.

### Auth design
Backend sets `access_token` + `refresh_token` as HttpOnly cookies on login, OAuth redirect, and token refresh. Frontend never reads or stores token values. Server instance attaches the cookie value as a Bearer header for RSC requests; client instance relies on browser's automatic cookie sending.

### Key gotchas recorded
- `GET /orders/{orderNumber}` takes display string, not UUID — order detail `href` must be `order.orderNumber`
- `GET /products/{productId}/reviews` requires product UUID, not slug — two-step fetch on product detail page
- `cookies()` from `next/headers` is async in Next.js 15 — must be awaited

### Next priorities
- Wire `/login` and `/register` pages to `auth.ts` (Server Actions or Client Component form submissions)
- Build `CartDrawer` (blocked on backend cart endpoint)
- Add Suspense / `loading.tsx` files for streaming skeletons on product and account routes
- Implement live search results in `SearchPopup` using `listProducts({ search: q })`

---

## Session 11 — Product Route Testing + API Shape Fixes

**Date:** 2026-05-26
**Files changed:** `lib/types.ts`, `lib/mock-data.ts`, `components/products/ProductCard.tsx`, `app/products/[slug]/ProductDetailClient.tsx`, `specs/FRONTEND_TRACKING.md`

### Bugs found and fixed

**`lib/types.ts` — three API shape mismatches**
1. `ProductDescriptionBlock` "points" variant used `content: string[]` — API uses `items: string[]`
2. `Product.description` typed as `ProductDescriptionBlock[]` (flat array) — API returns `{ blocks: ProductDescriptionBlock[] }` (object wrapper); calling `.find()` on the object would throw at runtime
3. `Product.tags` typed as required `string[]` — absent from `ProductListItemResponseDto`; `product.tags.includes()` in `ProductCard` crashed on list-endpoint data
4. `ProductVariant.quantityRule` typed as `number` — API returns `QuantityRuleResponseDto` (`{ min, max, increment }`)

**`lib/mock-data.ts`** — updated all 8 products to match corrected types: `description: { blocks: [...] }`, points blocks use `items`, `quantityRule: { min: 1, max: null, increment: 1 }`.

**`ProductCard.tsx`** — `product.tags.includes("new")` → `product.tags?.includes("new")`.

**`ProductDetailClient.tsx`**
- `product.description.find(...)` → `(product.description?.blocks ?? []).find(...)`
- `pointsBlock.content` → `pointsBlock.items`
- Badge usage `<Badge variant={badge} />` → `<Badge variant={badge} className="self-start" />` — badge was stretching full-width as a flex-col item

### Routes verified against live API

| Route | Products shown | Console errors |
|---|---|---|
| `/products` | 3 real products (Oversized Hoodie, Classic White Tee, Black Wool Cap) with SALE badges + correct prices | 0 |
| `/products/oversized_hoodie` | Full detail — title, price, color/size pickers, description text, 3 reviews | 0 |

Only warning present: pre-existing Next.js logo SVG aspect-ratio notice in Navbar.

---

## Session 12 — Product Page Reviews: Remove Avatar + Reposition

**Date:** 2026-05-26
**Files changed:** `components/products/ReviewItem.tsx`, `app/products/[slug]/ProductDetailClient.tsx`, `specs/FRONTEND_TRACKING.md`

### Changes

**`ReviewItem.tsx` — avatar removed**
- Deleted `getInitials()` helper and the 40×40px initials circle `<div>` (background `var(--color-foreground-mid)`)
- Removed the outer `flex items-start gap-4` wrapper and the `flex-1 min-w-0` inner wrapper
- Content (author name, date, StarRating, body text) now renders flat inside the border-b row container

**`ProductDetailClient.tsx` — reviews repositioned**
- Removed the full-width `Reviews` section that sat below the main 2-column layout (had its own `paddingLeft`/`paddingRight`/`border-t`/`py-10`)
- Added reviews block as the last child of the right column (`md:w-[40%]`), directly after the description `<details>` accordion, with `mt-6 border-t pt-6` spacing

### Build verified (session 12)
- `npm run lint` — clean (0 errors, 0 warnings)

---

## Session 13 — Product Page: Reviews & Rating Block Redesign

**Date:** 2026-05-27
**Files created:** `app/products/[slug]/ReviewsBlock.tsx`
**Files modified:** `components/products/ReviewItem.tsx`, `app/products/[slug]/ProductDetailClient.tsx`, `app/products/[slug]/page.tsx`, `specs/FRONTEND_TRACKING.md`

### Changes

**New `ReviewsBlock` component (`app/products/[slug]/ReviewsBlock.tsx`)**

Client Component owning all review-related state. Replaces the inline reviews block that was embedded in `ProductDetailClient`. Features:

- **Rating histogram** — 5 rows (5★ → 1★), each with a progress bar and count. Computed client-side via `Math.round(rating / 2)` bucketing from loaded reviews. Fill: `var(--color-primary)`; track: `var(--color-border)`.
- **"Write a review" inline form** — toggle button in the header row (label switches to "Cancel" when open). Form fields: interactive 5-star SVG picker, content textarea, display name input, email input. Submit calls `createReview(productId, { rating: stars * 2, ... })` from `lib/api/reviews-client.ts`. On success: form closes and a "pending approval" message is shown (reviews enter moderation server-side; not prepended to list).
- **Load More** — "Load More" button appears when `displayedReviews.length < total`. Calls `listReviewsByProductClient(productId, { page: n+1, limit: 20 })` and appends results. Button hides when all reviews are loaded.
- **Open to all** — no auth gate; anyone can submit a review (matches API: `POST /products/{productId}/reviews` requires no auth).

**`ReviewItem.tsx` — layout reorder + Verified badge**
- New row order: Row 1 = `StarRating` + date (right-aligned). Row 2 = author name + "Verified" badge. Row 3 = review body.
- Verified badge: Montserrat 11px, `border: 1px solid var(--color-border)`, `color: var(--color-foreground-subtle)`.
- Verified shown unconditionally on all reviews (no `verified` field on `Review` type from API).
- Date format changed to MM/DD/YYYY (`month: "2-digit", day: "2-digit"`) to match reference.

**`ProductDetailClient.tsx`**
- Removed inline reviews block (avgRating calc, `ReviewItem` map, "Write a Review" ghost button).
- Added `totalReviews: number` to props interface.
- Removed unused `Button` and `ReviewItem` imports.
- Renders `<ReviewsBlock productId={product.id} initialReviews={reviews} totalReviews={totalReviews} />`.

**`page.tsx`**
- Now passes `totalReviews={reviewsResult.total}` in addition to `reviews={reviewsResult.data}`.

### Known limitation
The histogram is computed from the currently loaded reviews (first 20 from server + any Load More pages fetched). For products with > 20 reviews, the histogram is approximate until all pages are loaded. The API does not return pre-aggregated star distributions.

### Build verified (session 13)
- `npm run lint` — clean (0 errors, 0 warnings)
- `npm run dev` (port 3000) — `/products/oversized_hoodie` renders with 0 console errors
- Histogram bars, rating summary, and "Write a review" button all visible on page load
- "Write a review" button toggles inline form open/closed; star picker interactive on hover and click

---

## Session 14 — Reviews Block: Visual Alignment with Reference

**Date:** 2026-05-27
**Files modified:** `components/ui/StarRating.tsx`, `components/products/ReviewItem.tsx`, `app/products/[slug]/ReviewsBlock.tsx`, `specs/FRONTEND_TRACKING.md`

### Context

Compared `review-block-check.png` (session-13 output) against `review-block-reference.png` and identified three mismatches:

1. Star color — current: red/accent (`var(--color-accent)` = #e55151); reference: dark/gray stars
2. Summary row — current: row of 5 small colored stars + inline text; reference: single large gray star icon + bold score + sub-line count
3. Load More button — current: `variant="secondary"` which maps to `bg-accent` (red) in Button.tsx; reference: solid dark/black

### Changes

**`StarRating.tsx` — `color` prop + token fix**
- Added `color?: string` prop (default `"var(--color-accent)"`) — backward compatible; all existing call sites unchanged
- Replaced hardcoded `#e0e0e0` with `var(--color-border-light)` for empty star fill (token constraint fix)
- Replaced hardcoded `"var(--color-accent)"` in gradient `stopColor` with the `color` prop

**`ReviewItem.tsx`**
- Pass `color="var(--color-foreground-dark)"` to `StarRating` — review card stars are now dark, matching the reference

**`ReviewsBlock.tsx`**
- Summary section: replaced `<StarRating rating={avgRating} size={15} />` row with a custom single SVG star (28×28px, fill `var(--color-foreground-subtle)`) + bold score ("4.0 / 5") + sub-line count ("Based on N reviews"). Matches the reference's single large gray star + score layout.
- Load More button: `variant="secondary"` → `variant="primary"` — now renders as solid black matching reference
- Removed unused `StarRating` import (no longer used in this file)

### Regression check
Stars in the product price row (uses `<StarRating>` without `color` prop) remain red/accent — default unchanged.

### Build verified (session 14)
- `npm run lint` — clean (0 errors, 0 warnings)
- `npm run dev` (port 3000) — `/products/oversized_hoodie` renders with 0 console errors
- Review card stars are dark gray; summary shows single large gray star + bold score; price-row stars remain red

---

## Session 15 — Reviews Block Visual Alignment (continued)

### Goal
Bring reviews block closer to reference: inline summary row, rounded star shape, semantic star color token, heading update.

### Changes

**`app/globals.css`**
- Added `--color-star: var(--color-foreground-subtle)` to `:root` and `@theme inline` — semantic token for star color (grey by default, overridable per theme)

**`components/ui/StarRating.tsx`**
- Changed star shape from polygon to path (`d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"`, Feather-style, rounder look); updated viewBox to `0 0 24 24`
- Changed default `color` prop from `var(--color-accent)` to `var(--color-star)` — stars now grey by default everywhere

**`components/products/ReviewItem.tsx`**
- Removed explicit `color="var(--color-foreground-dark)"` — review item stars now use the global `var(--color-star)` default

**`app/products/[slug]/ReviewsBlock.tsx`**
- Section heading: "Customer Reviews" → "Reviews" (smaller, `text-[13px]`, matches reference section label style)
- Summary row: all content now inline — single star SVG + bold score + "Based on N reviews" (smaller grey) all on one row
- "Write a review" / "Cancel" button moved from the heading row to the right side of the summary row
- No-reviews empty state shows "No reviews yet" inline with the star
- Star SVG in summary updated to rounder path, fill uses `var(--color-star)`

### Build verified (session 15)
- `npm run lint` — clean (0 errors, 0 warnings)

---

## Session 16 — Reviews Block Reference Match

### Goal
Bring `ReviewsBlock` and `ReviewItem` as close as possible to the reference screenshot (`review-block-reference.png`) from the Cool Shirtz Shopify store.

### Changes

**`app/products/[slug]/ReviewsBlock.tsx`**
- Header row: added 5 small filled black stars + chevron SVG on the right of the "REVIEWS" heading — matches reference aggregate stars row
- Added `sortOrder` state (`most-recent` | `highest` | `lowest`) and `sortedReviews` via `useMemo` — client-side sort of displayed reviews
- Sort dropdown ("Most Recent ∨") rendered below the summary row, styled with border-bottom only and custom chevron arrow
- Render `sortedReviews` (not `displayedReviews`) in the review list
- Load More: removed `fullWidth`, wrapped in `flex justify-center` — matches reference auto-width centered button

**`components/products/ReviewItem.tsx`**
- Divider changed from `border-b` to `border-t` — matches reference `jdgm-divider-top` pattern (separator above each review, not below)

### Known gap
- Reference shows a bold review title (e.g. "The Reaper Ring") above each review body. This cannot be added: the O2Shop `Review` type (`lib/types.ts`) has no `title` field and the API does not return one.

### Build verified (session 16)
- `npm run lint` — clean (0 errors, 0 warnings)
- Dev server confirmed rendering at `/products/oversized_hoodie` — header stars, sort dropdown, top-border dividers, centered Load More all present with no console errors

---

## Session 17 — Reviews Deep Style Alignment + Gallery Thumbnail Reposition

### Goal
1. Deep-match review block styles to live reference (https://shirtz.cool/products/the-reaper-ring) using harvested computed styles
2. Move product photo thumbnails from horizontal-below to vertical-right strip (matching reference gallery layout)

### Research
Harvested computed styles directly from live reference using Playwright `evaluate()`. Key measurements:
- Summary avg: Fjalla One 32px weight-600 `rgb(35,31,32)` margin-left 8px
- Summary text: Fjalla One 12px `rgb(156,156,156)`
- Write-review button: Fjalla One 14px bold, `padding: 8px 32px`, `2px solid`
- Sort dropdown: Fjalla One 14px, `borderBottom: 0.667px solid rgba(0,0,0,0.1)`, `padding: 4px 16px 4px 0`
- Review card: `borderTop: 0.667px solid rgba(0,0,0,0.1)`, `padding: 16px 0`
- Author name: Montserrat 16px weight-600 non-uppercase `rgb(36,36,36)`
- Verified badge: Montserrat 9px weight-600, white text, `bg: rgb(156,156,156)`, `padding: 3px 6px`
- Review body: Montserrat 14px weight-500 `rgb(115,115,115)`
- Gallery thumbnails: vertical 116px strip to the LEFT of main image on reference

### Changes

**`components/products/ReviewItem.tsx`**
- Card: `borderTop: "0.667px solid rgba(0,0,0,0.1)"` inline + `py-4` (16px) instead of `border-t border-light py-5`
- Author: Montserrat 16px weight-600 no-uppercase `var(--color-foreground-strong)` (was Fjalla One 13px uppercase dark)
- Verified badge: gray-filled (`rgb(156,156,156)`) white text 9px weight-600 `padding: 3px 6px` no border (was bordered empty box)
- Body: weight-500 `rgb(115,115,115)` lineHeight 19.6px (was weight-400 `var(--color-foreground)` = #333333)
- Date: `rgb(123,123,123)` letterSpacing 0.3px (was `var(--color-foreground-subtle)`)

**`app/products/[slug]/ReviewsBlock.tsx`**
- Summary avg: Fjalla One 32px weight-600 `var(--color-foreground-strong)` marginLeft 8px (was Montserrat 16px bold)
- Summary text: Fjalla One 12px `rgb(156,156,156)` (was Montserrat)
- Write-review button: Fjalla One 14px bold `padding: 8px 32px` `border: 2px solid` (was Montserrat 12px uppercase `px-3 py-2`)
- Sort dropdown: Fjalla One 14px, borderBottom `0.667px solid rgba(0,0,0,0.1)`, padding `4px 20px 4px 0` (was Montserrat 13px)

**`app/products/[slug]/ProductDetailClient.tsx`**
- Gallery section: changed from `flex-col` (main image above, thumbnails below horizontal) to `flex-row` (main image `flex-1`, thumbnails `flex-col gap-2` 80×100px vertical strip on the RIGHT)

### Build verified (session 17)
- `npm run lint` — clean (0 errors, 0 warnings)
- Dev server confirmed at `/products/oversized_hoodie` — vertical thumbnail strip on right, all review typography matches reference measurements

---

## Session 18 — Product Images & Hover Zones

Replaced all color-tinted div placeholders with real `next/image` elements on both the products list and the product detail page.

### Goals

- Wire `product.photos` (already typed as `ProductPhoto[]` with `sortOrder`) into the UI
- Implement the dual hover-zone image-swap mechanic on `ProductCard` (design spec §9)
- Build the thumbnail strip + main image swap on the detail page
- Surface the `sortOrder:-1` accent photo in the detail page header

### sortOrder convention

| sortOrder | Role |
|---|---|
| `0` | Main image — always present |
| `1` | Left hover zone on list cards (optional; no overlay rendered if absent) |
| `2` | Right hover zone on list cards (optional; no overlay rendered if absent) |
| `-1` | 64×80px accent photo beside product title in detail header (hidden if absent) |

### Changes

**`next.config.ts`**
- Added `images.remotePatterns` derived at build time from `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001`). Parses protocol + hostname + port so no port is hardcoded.

**`components/products/ProductCard.tsx`**
- Derive `mainPhoto` (sortOrder:0), `hoverPhoto1` (sortOrder:1), `hoverPhoto2` (sortOrder:2) from `product.photos`
- `mainPhoto` present → `<Image fill object-cover>` as base layer; `hoverPhoto1/2` present → independent `<Image fill>` overlays with `opacity: 0 / 1` keyed to `activeZone === "left" / "right"` and `transition: var(--transition-nav)`
- `mainPhoto` absent → retain existing color-tinted div fallback (zero regression for products without photos)
- Props interface unchanged: `product: Product`
- Status updated from `🔒 stable` → `✅ done`

**`app/products/[slug]/ProductDetailClient.tsx`**
- `thumbnailPhotos` = `product.photos.filter(p => p.sortOrder !== -1).sort((a,b) => a.sortOrder - b.sortOrder)`
- Thumbnail strip: iterates `thumbnailPhotos` → `<Image fill object-cover sizes="80px">` in existing `aspect-[4/5]` buttons; fallback to 5 color-div buttons when array is empty
- Main image: `displayedPhoto = thumbnailPhotos[selectedImage]` → `<Image fill object-cover priority>`; removed `opacity: 0.45` from container (was leaking onto real images); fallback text placeholder retained
- `accentPhoto` (sortOrder:-1): rendered as `<div 64×80px relative><Image fill object-cover></div>` next to the title block; renders nothing when absent (flex item collapses)
- Fixed pre-existing `react/jsx-key` lint errors in `descBlocks.map()`

### Build verified (session 18)
- `npm run lint` — clean (0 errors, 0 warnings)
