# Frontend Progress — o2shop

> Last updated: 2026-05-27 (session-21)

---

## Current State

All public pages and account pages are built and wired to the live O2Shop API. Zero TypeScript errors, zero ESLint warnings.

### Routes

| Route | File | Status |
|---|---|---|
| `/` | `app/page.tsx` | Dark hero, transparent-to-solid navbar on scroll |
| `/products` | `app/products/page.tsx` | Async RSC; `categorySlug` + `search` from `searchParams`; URL-driven filters; shimmer skeleton on API failure |
| `/products/[slug]` | `app/products/[slug]/page.tsx` + `ProductDetailClient.tsx` | RSC wrapper fetches product + reviews; client island owns variant state |
| `/login` | `app/login/page.tsx` + `app/login/LoginForm.tsx` | Wired — client island, loading state, error display, redirect to `/account` |
| `/admin` | `app/admin/page.tsx` + `middleware.ts` | RBAC draft — Edge middleware guards route; minimal RSC shows email + role |
| `/register` | `app/register/page.tsx` | Static shell — not yet wired to `auth.ts` |
| `/account` | `app/account/page.tsx` | Async RSC; auth guard via `getMe()` → redirect; `Promise.all` orders + addresses |
| `/account/orders/[id]` | `app/account/orders/[id]/page.tsx` | Async RSC; `params.id` is `orderNumber` display string |

---

## Components

### Layout
- **`Navbar.tsx`** — Fixed header; transparent→solid at 8px scroll; category nav from `NAV_CATEGORIES` (`lib/nav-config.ts`); hover dropdowns (80ms delay); search popup trigger; cart badge; mobile slide-in drawer
- **`SearchPopup.tsx`** — Slides down from top; backdrop click / Esc to close; submits to `/products?q=...`; static shell (no live results yet)
- **`Footer.tsx`** — 3-col desktop / column-reverse mobile

### UI Primitives
- **`Skeleton.tsx`** — Shimmer shimmer primitive
- **`Badge.tsx`** — `sale` / `new` / `sold-out`; Fjalla One 12px; `WebkitTextStroke: 0.3px white`
- **`Button.tsx`** — `primary` / `secondary` / `ghost`; sizes `sm` / `base` / `lg`; `fullWidth` prop
- **`StarRating.tsx`** — Feather-path SVG stars; `color` prop (default `var(--color-star)`); linear-gradient partial fill; `var(--color-border-light)` empty fill
- **`BackButton.tsx`** — `router.back()` with `/products` fallback

### Products
- **`ProductCard.tsx`** — `next/image` with dual hover-zone swap (sortOrder 1/2); color-div fallback when no photos
- **`ProductCardSkeleton.tsx`** — Shimmer at exact 4:5 ratio
- **`VariantPicker.tsx`** — 149×30px swatches; size buttons; sold-out states
- **`ReviewItem.tsx`** — Row order: stars+date / author+Verified badge / body. Typography matches reference computed styles (Montserrat 16px/600 author; 14px/500 body `rgb(115,115,115)`; verified badge gray-filled white text 9px). `border-top: 0.667px solid rgba(0,0,0,0.1)`, `py-4`
- **`ReviewsBlock.tsx`** (in `app/products/[slug]/`) — Rating histogram (client-side, approximate for >20 reviews); inline form (5-star picker, textarea, name, email); sort dropdown (most-recent/highest/lowest); Load More; no auth gate

### Account
- **`OrderStatusBadge.tsx`** — `unfulfilled`→grey, `partially_fulfilled`→amber, `fulfilled`→green, `cancelled`→blue
- **`PaymentStatusBadge.tsx`** — `paid`→green, `pending`→grey, `failed`→warning, `refunded`→muted
- **`AddressCard.tsx`** — `editable?: boolean`; when true renders Edit + Delete buttons

---

## API Layer (`lib/api/`)

| File | Covers |
|---|---|
| `errors.ts` | `ApiError` → `AuthError` / `ForbiddenError` / `NotFoundError` / `ValidationError` |
| `server.ts` | `import 'server-only'`; reads `access_token` cookie; attaches as Bearer |
| `client.ts` | `withCredentials: true`; 401→refresh→retry interceptor; redirect `/login` on refresh failure |
| `categories.ts` | `listCategories()`, `getCategoryById()` |
| `auth.ts` | `login()`, `register()`, `logout()`, `refreshTokens()`, `getMe()` |
| `products.ts` | `listProducts(params)`, `getProductBySlug(slug)` |
| `reviews.ts` | `listReviewsByProduct(productId, params)`, `deleteReview(id)` |
| `orders.ts` | `listMyOrders(params)`, `getOrderByNumber(orderNumber)` |
| `addresses.ts` | `listAddresses()`, `createAddress()`, `updateAddress()`, `deleteAddress()` |
| `cart.ts` | Stub — no cart endpoint in API yet |

---

## Key Decisions & Gotchas

- **Nav is static.** `lib/nav-config.ts` exports `NAV_CATEGORIES` — edit there to change nav. Not fetched from API.
- **`GET /orders/{orderNumber}`** takes the display string (e.g. `ORD-20240101-0001`), not a UUID. Order detail `href` must use `order.orderNumber`.
- **`GET /products/{productId}/reviews`** takes the product UUID, not the slug. Two-step fetch on detail page.
- **`cookies()`** from `next/headers` is async in Next.js 15 — always `await` it.
- **Photo sortOrder convention:** `0`=main, `1`=left hover, `2`=right hover, `-1`=accent (64×80 beside title). All absent → color-div fallback.
- **Review histogram** is computed from loaded reviews only; approximate for products with >20 reviews (API has no pre-aggregated distribution).
- **Review title field** does not exist on the O2Shop `Review` type — reference's bold title row cannot be replicated.
- **`product.description`** is `{ blocks: ProductDescriptionBlock[] }` (object wrapper), not a flat array. Points blocks use `items: string[]`, not `content`.
- **`product.tags`** is optional (`tags?`) — use `?.includes()`.

---

## Design System

Tokens live in `app/globals.css` as CSS custom properties, mapped to Tailwind via `@theme inline`. Full spec in `specs/DESIGN_SYSTEM.md`.

Notable tokens added beyond the original spec:
- `--color-status-success/warning/info-bg/fg` — badge colors
- `--color-star` — semantic star color (grey, `var(--color-foreground-subtle)`)

---

## Session 21 — 2026-05-27

**Login page wired + admin RBAC draft**

- `app/login/LoginForm.tsx` — NEW: client component island; `useState` for email, password, error, isPending; calls `login()` from `lib/api/auth`; button disabled + "Signing in…" while in-flight; error paragraph (Montserrat 13px `--color-destructive`) on API failure; `router.push('/account')` on success.
- `app/login/page.tsx` — Stripped to RSC wrapper; delegates full card to `<LoginForm />`.
- `middleware.ts` — NEW: Edge middleware on `/admin/:path*`; reads `access_token` cookie; base64-decodes JWT payload (no signature verification — draft); redirects non-authenticated to `/login`, non-admin to `/`; zero network latency (no API call).
- `app/admin/page.tsx` — NEW: minimal RSC; calls `getMe()` to display user email + role; middleware already guarantees admin access before the page runs.

Zero ESLint warnings. Backend JWT payload confirmed to contain `role` claim (`sub`, `email`, `role`, `tokenVersion`).

---

## What's Next

- Wire `/register` to `auth.ts`
- `CartDrawer` (blocked on backend cart endpoint)
- Suspense / `loading.tsx` streaming skeletons on product + account routes
- Live search results in `SearchPopup` (`listProducts({ search: q })`, debounced)
- Sticky ATC bar on mobile product page
- Hero section with real imagery
