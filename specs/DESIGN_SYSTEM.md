# Design System Spec — o2shop

> **Extraction status:** ✅ All 7 pages complete.
> - Playwright MCP (live): `home`, `products-list`, `product-page`, `faq`
> - Static CSS file parsing: `my-account`, `order`, `checkout`
> - Screenshots: `specs/screenshots/<slug>/{desktop,tablet,mobile}.png`
> - oklch values marked ⚠️ INFERRED are formula conversions — verify with DevTools color picker.

---

## 1. Source References

| Page | Live URL | Local File | Route |
|---|---|---|---|
| Home | https://shirtz.cool/ | _(none)_ | `/` |
| Products List | https://shirtz.cool/collections/hats | _(none)_ | `/{collectionSlug}` |
| Product Page | https://shirtz.cool/products/the-play-cool-beanie | _(none)_ | `/products/{slug}` |
| My Account | https://shirtz.cool/account | `specs/Account– Cool Shirtz-My Account.html` | `/account` |
| Order Detail | https://shirtz.cool/account/orders/… | `specs/Order COOL727871– Cool Shirtz-Order Page.html` | `/orders/{id}` |
| FAQ | https://shirtz.cool/pages/faq-information | _(none)_ | `/faq` |
| Checkout | _(session URL)_ | `specs/Checkout - Cool Shirtz-Checkout Page.html` | `/checkout` |

---

## 2. Color Tokens

### 2a. Storefront Color Tokens

> Theme has **no CSS custom properties** (older Shopify theme — all hard-coded values).
> Tokens below are o2shop semantic names mapped to sampled/confirmed computed values.
> Values marked ✅ are confirmed via Playwright `getComputedStyle`. Values marked ⚠️ INFERRED are from static CSS or oklch formula.

| Semantic Name | oklch | Hex | Sampled From | Notes |
|---|---|---|---|---|
| `--color-background` | oklch(100% 0 0) | `#ffffff` | body bg | Main page background |
| `--color-foreground` | ⚠️ oklch(36.1% 0 0) | `#333333` | body text ✅ | Body / default text |
| `--color-foreground-strong` | ⚠️ oklch(22.5% 0.008 355) | `#231f20` | h1 product title ✅ | Strong heading text |
| `--color-foreground-dark` | ⚠️ oklch(20.7% 0.006 335) | `#1f1f1f` | h2 text ✅ | h2 / section heading |
| `--color-foreground-mid` | ⚠️ oklch(38.6% 0.005 13) | `#3a3a3a` | h3 (nav context) ✅ | Mid-grey text |
| `--color-foreground-subtle` | ⚠️ oklch(59.3% 0 0) | `#8c8c8c` | product card sub-label ✅ | Muted meta text |
| `--color-foreground-muted` | ⚠️ oklch(43.9% 0 0) | `#666666` | small/caption ✅ | Placeholder/caption |
| `--color-on-dark` | oklch(100% 0 0) | `#ffffff` | nav links ✅ | White text (on dark/transparent header) |
| `--color-primary` | ⚠️ oklch(19.4% 0 0) | `#1e1e1e` | ATC button bg ✅ | ATC / primary action bg |
| `--color-primary-alt` | ⚠️ oklch(13.8% 0.001 20) | `#212020` | `.btn` (CSS source) | Standard button bg |
| `--color-primary-foreground` | oklch(100% 0 0) | `#ffffff` | button text ✅ | Text on primary |
| `--color-accent` | ⚠️ oklch(59.5% 0.191 22) | `#e55151` | `.btn--secondary` bg | BRAND ACCENT — secondary CTA |
| `--color-accent-foreground` | oklch(100% 0 0) | `#ffffff` | secondary btn text | Text on accent |
| `--color-destructive` | ⚠️ oklch(50% 0.23 25) | `#e1000d` | sold-out/error red | Error / sold-out accent |
| `--color-card` | oklch(100% 0 0) | `#ffffff` | product card bg | Card surface |
| `--color-muted` | ⚠️ oklch(96.7% 0 0) | `#f5f5f5` | footer bg | Muted surface |
| `--color-muted-2` | ⚠️ oklch(95.6% 0 0) | `#f1f1f1` | cart drawer footer | Slightly darker muted |
| `--color-sidebar` | ⚠️ oklch(96.1% 0.006 247) | `#f1f3f6` | cart sidebar bg | Panel / sidebar bg |
| `--color-border` | ⚠️ oklch(88.5% 0 0) | `#dddddd` | table/card borders | Standard border |
| `--color-border-input` | ⚠️ oklch(12.8% 0.015 232) | `#0e1113` | input border ✅ | Input border (very dark navy) |
| `--color-border-light` | ⚠️ oklch(94.3% 0 0) | `#eeeeee` | FAQ body divider | Subtle divider |
| `--color-input` | oklch(100% 0 0) | `#ffffff` | input bg ✅ | Input background |
| `--color-footer-bg` | ⚠️ oklch(96.7% 0 0) | `#f5f5f5` | footer bg | Footer background |
| `--color-footer-text` | ⚠️ oklch(58.6% 0 0) | `#8b8b8b` | footer links | Footer link text |
| `--color-badge-cart` | ⚠️ oklch(56.9% 0.22 346) | `#e64984` | cart badge ✅ | Third-party cart badge — NOT brand |

### 2b. Dark Mode
Not observed on any page. Theme does not implement dark mode.

### 2c. Checkout-Scoped Colors (do NOT merge into global tokens)

| Name | Value | Notes |
|---|---|---|
| Checkout bg | `#FFF4F4` ⚠️ INFERRED | Pale pink — store theme override |
| Checkout text | `#410000` ⚠️ INFERRED | Dark maroon |
| Checkout border | `#FFDADA` ⚠️ INFERRED | Pink border |
| Pay Now button | `#005BD1` | Shopify blue |
| Subdued panel bg | `#F5F5F5` | Order summary sidebar |

---

## 3. Typography

### 3a. Storefront Typefaces

**Primary typeface (headings + body):** `"Fjalla One", Arial, Tahoma, Verdana, sans-serif`  
**Secondary typeface (UI labels, sub-labels, rich text body):** `Montserrat, Helvetica, Arial, sans-serif`

| Role | Font | Size | Line-height | Weight | Letter-spacing | Transform | Source |
|---|---|---|---|---|---|---|---|
| Body / base | Fjalla One | 15px | 21px (1.4×) | 400 | 0.3px | none | body ✅ |
| h1 (page / section) | Fjalla One | 32px | 32px | 700 | 0.64px | none | home + faq ✅ |
| h1 (product title) | Fjalla One | 42px | — | 400 | 0.84px | capitalize | product-page ✅ |
| h2 | Fjalla One | 18px | normal | 700 | 0.36px | none | home + faq ✅ |
| h3 (nav / UI context) | Fjalla One | 15px | 15px | 400 | 0.3px | **uppercase** | home ✅ |
| h3 (content / rte context) | Fjalla One | 18px | — | 700 | 0.36px | none | faq ✅ |
| h4 | Fjalla One | 15px | 15px | 700 | 0.3px | none | home ✅ |
| Small / caption | Fjalla One | 15px | normal | 400 | 0.3px | none | home ✅ (`color: #666666`) |
| Nav link | Fjalla One | 14px | 40px | 600 | 0.3px | **uppercase** | home ✅ (`color: #ffffff`) |
| Button label | Fjalla One | 13px | 13px | 400 | normal | uppercase | home + product ✅ |
| Product card title | Fjalla One | 16px | — | 500 | 0.32px | uppercase | products-list ✅ |
| Product card price | Fjalla One | 16px | — | 500 | 0.3px | uppercase | products-list ✅ |
| Product card sub-label | Montserrat | 12px | — | 400 | 0.3px | none | products-list ✅ |
| Input label | Montserrat | 12px | normal | 700 | normal | none | home ✅ |
| Footer title | Montserrat | 16px | 20px | 700 | — | — | footer-487.css |
| Footer link | Montserrat | 14px | 18px | 500 | — | — | footer-487.css |
| Footer copyright | Montserrat | 12px | 14px | 600 | — | — | footer-487.css |

**Fonts confirmed loaded (Playwright):**
- `Fjalla One w400` ✅ (primary)
- `Montserrat w300, 400, 500, 600, 700, 800` ✅ (secondary)
- `Adorn-Icons w400` — icon font (decorative)
- `Minecraft Ten` — loaded but decorative/game-style label only

### 3b. Checkout Typefaces (checkout route only)

| Role | Font | Weight |
|---|---|---|
| Form labels / inputs | `Lato, sans-serif` | 400 / 700 |
| Section headings | `Roboto, sans-serif` | 400 / 500 |

### 3c. Collection-Constrained Description Styles (Product Page)

> Applied within `.product-single__description.rte` — do NOT use as global tokens.

| Element | Font | Size | Weight | Color |
|---|---|---|---|---|
| Container | Montserrat | 15px | 400 | `#333333` |
| `ul` | Montserrat | 11px | 400 | `#333333` |
| `li` | Montserrat | 14px | 400 | `#333333` |
| `p` | Montserrat | 15px | 400 | `#333333` (lh 21px) |

Rich text blocks (`.rte`) render heading elements in Fjalla One but paragraph body copy in Montserrat.

---

## 4. Spacing Scale

> Derived from observed padding/gap/margin values across all 7 pages.
> ⚠️ INFERRED: theme has no explicit spacing tokens.

| Token | rem | px | Derived From |
|---|---|---|---|
| `--space-1` | 0.125rem | 2px | card grid gap (products-list) |
| `--space-2` | 0.25rem | 4px | swatch margin, minimal gap |
| `--space-3` | 0.5rem | 8px | link gap, icon spacing |
| `--space-4` | 0.75rem | 12px | footer link groups |
| `--space-5` | 1rem | 16px | card details padding ✅, footer signup |
| `--space-6` | 1.25rem | 20px | section padding-bottom, column margin |
| `--space-8` | 1.5rem | 24px | btn-lg pad-x, default btn padding |
| `--space-10` | 2rem | 32px | section padding, cookie banner |
| `--space-12` | 3rem | 48px | footer desktop padding |
| `--space-15` | 3.75rem | 60px | header padding desktop ✅ |

Confirmed observed spacings:
- Header padding desktop: **60px** left/right ✅
- Header padding mobile: **15px** left/right ✅
- Card details area padding: **16px** all sides ✅
- Card details gap (title row vs sub row): **2px** ✅
- Grid column gap desktop: **2px** ✅; tablet/mobile: **1px** ✅
- Nav item padding: **0 15px** ✅; margin-bottom: **25px** ✅
- Swatch container margin-bottom: **15px** ✅
- Page width container gutter: **15px** horizontal

---

## 5. Border Radius Scale

| Token | Value | Used On |
|---|---|---|
| `--radius-none` | 0px | `.btn` standard buttons ✅, product cards ✅ |
| `--radius-swatch` | 2px | Color swatch labels (product page) ✅ |
| `--radius-sm` | 4px | Cart drawer base (`--sc-base-radius`) ✅ |
| `--radius-base` | 6px | `input[type=text/email]` ✅, ATC button ✅, Klaviyo inputs ✅ |
| `--radius-md` | 8px | Cart UI (qsc2-border-radius-md) |
| `--radius-lg` | 12px | Cart btn radius (qsc2-btn-radius) |
| `--radius-pill` | 32px | `.hero-button` (hero section CTAs) ✅ |
| `--radius-full` | 50% | Circle swatches |

Key correction from static analysis: The ATC button (`.btn.product-form__cart-submit`) uses **6px** border-radius, not 0. Only the base `.btn` class uses 0.

---

## 6. Elevation / Shadows

> No box-shadows found on standard storefront elements (header, nav, hero, product grid, cards) via Playwright. ✅ Confirms flat design at rest.

| Level | box-shadow | Used On |
|---|---|---|
| 0 — flat | `none` | Default cards, buttons, header ✅ |
| 1 — dropdown | `0 0 2px #bbb` ⚠️ INFERRED | Dropdown menus (static CSS) |
| 2 — card-hover | `0 0 10px rgba(0,0,0,0.10)` ⚠️ INFERRED | Cards on hover (static CSS) |
| 3 — sticky | `0 4px 4px rgba(0,0,0,0.059)` ⚠️ INFERRED | Sticky header (static CSS) |
| 4 — drawer | `0 0 20px rgba(51,51,51,0.30)` ⚠️ INFERRED | Cart drawer (static CSS) |

---

## 7. Motion

All confirmed via Playwright `getComputedStyle` on live pages.

| Element | Property | Duration | Easing | Source |
|---|---|---|---|---|
| All `<a>` links | all | 300ms | ease-in-out | home ✅ |
| Mobile nav toggle | all | 300ms | ease-in-out | home ✅ |
| Logo link, search icon | all | 300ms | ease-in-out | home ✅ |
| ATC button | all | 150ms | ease-out | product-page ✅ |
| `.prod-title`, `.prod-price` (card) | all | 200ms | ease-in | products-list ✅ |
| `.hover-image` (card left zone) | all | 300ms | ease-in-out | products-list ✅ |
| `.hover-image-2` (card right zone) | all | 300ms | ease-in-out | products-list ✅ |
| Grid item / card (outer) | all | 300ms | ease-out ⚠️ | static CSS |
| Footer link underline | transform | 300ms | ease-in-out ⚠️ | static CSS |
| Checkout tooltip | all | 100ms | linear ⚠️ | checkout.raw.md |

---

## 8. Component Inventory

### 8a. Site Header / Navigation
- Routes: all pages
- Class: `.site-header.center.nav-below`
- Height desktop: **92px** ✅; mobile: **80px** ✅
- Padding desktop: **60px** left/right ✅; mobile: **15px** ✅
- Background: **`rgba(0,0,0,0)` = transparent** (overlays hero on home page) ✅
- Nav alignment: logo centered, nav links below logo
- Nav link style: Fjalla One, 14px, lh 40px, w600, uppercase, **white** (#fff) ✅
- Mobile hamburger: `.js-mobile-nav-toggle`, 36×30px ✅
- Scroll state (sticky): ⚠️ UNKNOWN — likely adds solid background + shadow

### 8b. Footer
- Routes: all pages
- Background: `#f5f5f5`; top border: `1px solid black`
- Desktop padding: 48px left/right
- Layout desktop: flex row — logo (30%) | links (40%) | email signup (26%)
- Layout mobile: flex column-reverse, centered, gap 12px
- Link font: Montserrat, 14px/18px, w500, color `#8b8b8b`
- Link title font: Montserrat, 16px/20px, w700
- Copyright: Montserrat, 12px/14px, w600, color `#a7a2a3`

### 8c. Breadcrumbs
- Routes: my-account, order (not found on product-page or faq) ✅
- Class: `.breadcrumbs` in `.bredcrumbWrap` (typo in source)
- Separator: `|` character
- Font: body (Fjalla One 15px), color: inherited

### 8d. Primary Button (`.btn`)
- Background: `#212020` (CSS source) / `#1e1e1e` (ATC computed ✅ — very close)
- Text: white, Fjalla One 13px, uppercase
- Padding: `10px 24px` default; `0 10px` small (lh 25px); `14px 32px` large
- Border: `2px solid transparent`
- Border-radius: **0px** ✅ (sharp)
- Transition: 300ms ease-in-out
- Hover state: ⚠️ UNKNOWN — needs manual check

### 8e. ATC Button (`.btn.product-form__cart-submit`)
- Background: `rgb(30,30,30)` = `#1e1e1e` ✅
- Text: white, Fjalla One 13px, uppercase ✅
- Padding: `16px 14px 14px 14px` ✅
- Border-radius: **6px** ✅ ← different from base `.btn`
- Width: 100% of right column
- Height: 56px ✅
- Transition: 150ms ease-out ✅

### 8f. Secondary / Accent Button (`.btn--secondary`)
- Background: `#e55151` (brand red/coral)
- Text: white; border-color: `#e34848`
- All other properties inherit from `.btn`

### 8g. Color Swatch — Product Page (`.swatchLbl.color.medium.rounded_rectangle`)

| Property | Desktop | Mobile |
|---|---|---|
| Width | 149.125px | 79.75px |
| Height | 30px | 30px |
| Border-radius | 2px | 2px |
| Shape | Wide rectangle | Wide rectangle |

States:
- Available (unselected): `opacity: 1`, `cursor: pointer`
- Available (selected): ⚠️ UNKNOWN — CSS `:checked + label` rule suspected; computed style shows same values as unselected
- Sold-out: `opacity: 0.65`, `cursor: no-drop` ✅

Swatch container margin-bottom: **15px** ✅

### 8h. Color Swatch — Collection Card (`.gridSwatches li`)
- **NOT shown on hover** on the products-list page ✅ (the card hover mechanism is image-swap only)
- Small swatches appear on **product page only** (see 8g above)
- From static CSS: 17×17px, margin 3px, border `2px solid #fff`, shadow `0 0 1px 1px #ddd`
- States: soldout → `opacity: 0.65; cursor: no-drop; text-decoration: line-through` ✅ (confirmed in static CSS and product-page computed)

### 8i. Size Selector (`.single-option-selector__radio + label`)
- No size selector found on the inspected beanie product (color-only variants) ✅
- From static CSS: `min-width: 22px; height: 22px`, margin 2px, padding `5px 0`
- Unavailable state: `opacity: 0.65; cursor: no-drop; text-decoration: line-through` ✅

### 8j. Product Card (`.prod-card-487` — third-party app)

| Property | Desktop | Tablet | Mobile |
|---|---|---|---|
| Grid cols | 4 | 2 | 2 |
| Card width | 354.75px | 383.5px | 194.5px |
| Card height | 510.4375px | — | — |
| Col gap | 2px | 1px | 1px |
| Row gap | 0px | 0px | 0px |

Card internal structure:
```
a.prod-card-487                    (354.75×510px, bg transparent, radius 0)
└── product-card-487               (custom element)
    ├── div.image-wrapper          (354.75×443.438px ≈ 4:5 ratio, flex, relative)
    │   ├── img.main-image         (354.75×443.438px, static)
    │   ├── img.hover-image        (same dims, absolute, opacity 0 at rest)
    │   ├── img.hover-image-2      (same dims, absolute, opacity 0 at rest)
    │   ├── div.hover-zone.left    (177.375×443.438px, absolute left 0)
    │   └── div.hover-zone.right   (177.375×443.438px, absolute left 177.375px)
    └── div.prod-details           (354.75×67px, flex col, padding 16px, gap 2px)
        ├── div.prod-title-block   (flex row)
        │   ├── h3.prod-title      (Fjalla One 16px w500 uppercase #222222)
        │   └── div.prod-price     (Fjalla One 16px w500 uppercase #222222)
        └── div.prod-desc-block    (flex row)
            ├── div.prod-type      (Montserrat 12px w400 #8c8c8c)
            └── div.prod-currency  (Montserrat 12px w400 #8c8c8c)
```

Multi-color products: one card entry per color variant (`data-color-variant` attr on `<a>`). No dot indicators within a single card.

### 8k. Order History Table (`.responsive-table`)
- Routes: `/account`, `/orders/{id}`
- Columns (account): Order | Date | Payment Status | Fulfillment Status | Total
- Columns (order): Product | SKU | Price | Quantity | Total
- Order link: `<a class="btn btn--secondary btn--small">` (red)
- Mobile: collapses via `data-label` attributes

### 8l. Account / Order Page Layout
- Grid: flex, wrap
- Left: two-thirds (`medium-up--two-thirds`); Right: one-third (`medium-up--one-third`)
- Order status badge: ⚠️ UNKNOWN — appears as inline text in snapshot; styled chip may exist for other statuses

### 8m. Checkout Page
- Route: `/checkouts/...`
- Layout: two-column desktop (`main` + `order-summary`), single-column mobile
- Main area: `58rem` wide
- Steps: Express Checkout → Contact → Shipping → Payment
- ATC / Pay Now: Shopify blue `#005BD1`
- Fonts: Lato (primary), Roboto (secondary)
- Border-radius: 5px base, 2px small, 10px large

### 8n. FAQ / Content Page
- Route: `/pages/faq-information`
- **Structure: static rich text — NOT an accordion** ✅
- No `<details>` or collapsible elements found
- Layout: single-column `.rte` block, 1090px wide at 1440px viewport
- Section headings: Fjalla One h3 (18px w700)
- Body paragraphs: Montserrat 15px w400 lh 21px
- Links in content: same color as body text (#333333), no underline ✅

### 8o. Cart Drawer (third-party app — `--sc-*` vars)
- Width: 458px
- Background: #fff; footer bg: #f1f1f1; sidebar bg: #f1f3f6
- Cart badge: `#e64984` (pink) — third-party, NOT brand accent ✅
- CTA button: #000 bg, #fff text, 64px height
- Product image: 100px wide; base radius: 4px

---

## 9. Product Card Hover Interaction

> All values confirmed via Playwright on https://shirtz.cool/collections/hats ✅

### Card Dimensions (desktop 1440px)
- Card: **354.75 × 510.4375px**
- Image area (`.image-wrapper`): **354.75 × 443.438px** — aspect ratio ≈ **4:5**
- Details area (`.prod-details`): **354.75 × 67px** — padding 16px all, gap 2px

### Hover Zones
The image area is split into two invisible absolute-positioned divs:

| Zone | Class | Width | Position | Triggered element | Opacity change | Transition |
|---|---|---|---|---|---|---|
| Left | `.hover-zone.left` | 177.375px | `left: 0` | `.hover-image` | 0 → 1 | 300ms ease-in-out |
| Right | `.hover-zone.right` | 177.375px | `left: 177.375px` | `.hover-image-2` | 0 → 1 | 300ms ease-in-out |

- Both `.hover-image` and `.hover-image-2` are `position: absolute; top: 0; left: 0` over the main image
- At rest: `opacity: 0`; On hover: `opacity: 1` (smooth fade)
- `.prod-title` and `.prod-price` transition: `200ms ease-in`

### No Swatches or Quick-Add on Hover
The collection card hover shows **image swap only** — no color swatch strip, no size selectors, no quick-add button appears. ✅ This is different from what was inferred from static CSS — those `.gridSwatches` elements are not present in the third-party product grid app.

### Color Variant Representation
Multi-color products appear as **separate card entries** in the grid, one per color. Each card has `data-color-variant="<color>"` on the `<a>` element (e.g., "black", "red", "white").

---

## 10. Open Questions

| # | Page | Item | Status |
|---|---|---|---|
| 1 | `product-page` | Selected swatch visual indicator — `:checked + label` CSS rule suspected but not captured in computed style | ⚠️ UNKNOWN |
| 2 | `product-page` | Thumbnail strip layout — scroll direction, active state, thumbnail dimensions | ⚠️ UNKNOWN |
| 3 | `product-page` | Sticky ATC bar on mobile scroll | ⚠️ UNKNOWN |
| 4 | `all` | Header scroll state — does it add solid background + shadow on scroll? | ⚠️ UNKNOWN |
| 5 | `account`, `order` | Order status badge/chip — styled chip for each status? Colors? | ⚠️ UNKNOWN |
| 6 | `account`, `order` | Empty states (no orders, no saved address) | ⚠️ UNKNOWN |
| 7 | `all` | Dark mode — not observed; confirm definitively absent | ⚠️ UNKNOWN |
| 8 | `all` | oklch values — all marked ⚠️ INFERRED; verify with DevTools color picker | ⚠️ INFERRED |
| 9 | `home` | Header background on scroll (solid color, which one?) | ⚠️ UNKNOWN |
| 10 | `checkout` | Input focus ring color | ⚠️ UNKNOWN |
| 11 | `product-page` | `.btn--secondary` hover state (shade, transition) | ⚠️ UNKNOWN |
