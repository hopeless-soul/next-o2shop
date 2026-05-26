# Frontend Progress — o2shop

> Last updated: 2026-05-26

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

### Build verified
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

### Build verified
- `npm run lint` — clean (0 errors, 0 warnings)
