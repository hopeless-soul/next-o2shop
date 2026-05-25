# Frontend Progress — o2shop

> Last updated: 2026-05-25

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

## What's Next

- Connect pages to the O2Shop API (`C:\Users\hk\Documents\Development\nest\nest-o2shop\specs\openapi.json`)
- Replace mock data with real `fetch` calls (Server Components where possible)
- Implement actual auth flow (login/register → session/token handling)
- Cart drawer component (458px wide, per design spec §8o)
- Hero section on home page with real imagery
- Search overlay / command palette
- Sticky ATC bar on mobile product page (§10 open question #3)
- Confirm header scroll-state background color (§10 open question #9)
