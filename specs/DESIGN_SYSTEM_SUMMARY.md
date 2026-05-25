# Design System Summary — o2shop

> A plain-English overview of the design research: what we studied, why, how we did it, and what we found.

---

## What Is This?

Before writing a single line of UI code for **o2shop**, we reverse-engineered the visual design of **shirtz.cool** (Cool Shirtz) — a live Shopify store that serves as the reference/target design for this project.

The goal was to extract every design decision that matters for building a pixel-faithful frontend:
colors, fonts, spacing, border radii, motion, and component behavior.

The full technical spec lives in [`specs/DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).  
This document is the plain-English companion to that spec.

---

## Why We Did It

Building a UI from screenshots alone leads to guesswork — wrong font weights, slightly-off colors, inconsistent spacing. Instead of eyeballing, we extracted the **actual computed values** the browser renders: the real hex codes, the real pixel sizes, the real transition timings.

This gives us:
- A single source of truth to reference when writing Tailwind classes or CSS tokens
- Confidence that our implementation matches the reference, not just resembles it
- A record of every design decision so future contributors don't have to re-investigate

---

## How We Did It

### Pages Studied

We extracted design data from **7 pages** of shirtz.cool:

| Page | How accessed |
|---|---|
| Home (`/`) | Live URL via browser automation |
| Collections / Hats (`/collections/hats`) | Live URL via browser automation |
| Product page (`/products/the-play-cool-beanie`) | Live URL via browser automation |
| FAQ (`/pages/faq-information`) | Live URL via browser automation |
| My Account (`/account`) | Locally saved HTML snapshot |
| Order Detail (`/orders/…`) | Locally saved HTML snapshot |
| Checkout (`/checkouts/…`) | Locally saved HTML snapshot |

### Method

For the four live pages we used **Playwright browser automation** (Claude Code's Playwright MCP):
1. Navigate to the page in a real browser
2. Set viewport to 1440px (desktop), 768px (tablet), and 390px (mobile)
3. Take a full-page screenshot at each breakpoint
4. Run JavaScript (`getComputedStyle`) to extract the *rendered* values — not CSS source, but what the browser actually computed after all stylesheets and overrides were applied
5. Capture hover states by programmatically hovering over product cards and reading the changed styles

For the three locally saved pages we parsed the raw CSS files directly (the theme's `theme.css` and `footer-487.css`), since they load without a network connection.

### Raw Research Files

Every page's raw extracted data was saved to `specs/research/<page>.raw.md` before being synthesized into the final spec.

---

## What We Found

### The Brand In a Nutshell

Cool Shirtz is a **bold, sharp-edged streetwear brand**. The design language reflects that:
- Fonts are angular and condensed (Fjalla One — a strong sans-serif)
- Buttons are sharp-cornered (no border radius)
- Colors are near-black on white, with a red/coral accent
- Transitions are quick and confident (300ms, no bounce)

---

### Typography

Two fonts do all the work:

**Fjalla One** — headings, navigation, buttons, product titles, body text  
Used almost everywhere in the UI. It's a condensed, bold-feeling font even at normal weight.

**Montserrat** — secondary UI labels, product sub-labels, rich text body copy, footer  
Used wherever smaller, more readable text is needed (captions, descriptions, labels).

Key sizes confirmed:
- Body: **15px / 21px line-height** (Fjalla One)
- Page headings (h1): **32px, weight 700**
- Product page title (h1): **42px, weight 400, "capitalize"** — larger and lighter than page headings
- Product card title: **16px, weight 500, UPPERCASE** (Fjalla One)
- Navigation links: **14px, weight 600, UPPERCASE, white** — rendered white because the header background is transparent and overlays the hero image
- Input labels: **Montserrat 12px, weight 700** — uses the secondary font, not Fjalla One

---

### Colors

The palette is minimal — black, white, red, and grey tones.

| Role | Color | Notes |
|---|---|---|
| Page background | `#ffffff` white | |
| Body text | `#333333` dark grey | Default text throughout |
| Heading text | `#1f1f1f` near-black | h2 headings |
| Navigation links | `#ffffff` white | White text on transparent header |
| Primary button / ATC | `#1e1e1e` near-black | "Add to Cart" background |
| Brand accent | `#e55151` red-coral | Secondary CTAs, accent buttons |
| Product sub-label | `#8c8c8c` medium grey | Type/currency labels on cards |
| Muted surfaces | `#f5f5f5` light grey | Footer, subdued panels |
| Input border | `#0e1113` very dark navy | Surprisingly dark — almost black |
| Cart badge | `#e64984` pink | Third-party app badge, NOT the brand accent |

**One important note:** the Shopify theme has **no CSS custom properties** (CSS variables). Every color is hard-coded throughout the stylesheet. This means there's no quick way to change the brand color — every token we defined is inferred from scattered hard-coded values.

**Checkout uses a completely different color palette** — a red-tinted Shopify checkout theme (`#FFF4F4` pale pink background, `#410000` dark maroon text). Do not mix checkout colors into the global palette.

---

### Spacing

No spacing scale exists in the theme — values are scattered throughout the CSS. We clustered the observed values into a rough scale:

- **2px** — grid column gap (product cards)
- **16px** — card details padding
- **15px** — page container gutter, nav item side padding
- **25px** — nav item margin
- **60px** — header horizontal padding at desktop
- **48px** — footer padding

---

### Border Radii

The brand skews sharp, but a few notable exceptions:

| Element | Radius | Why notable |
|---|---|---|
| Standard `.btn` buttons | **0px** — square | The brand's core style |
| Add-to-Cart button | **6px** | Overrides the standard `.btn` — product form specific |
| Form inputs | **6px** | Consistent with ATC button |
| Hero section CTAs | **32px** — pill | Large slide buttons are dramatically round |
| Color swatches (product page) | **2px** — barely rounded | Wide rectangular chips |
| Cart drawer UI | **4px** | Third-party app style |

---

### Product Card — The Key Interaction

The product grid uses a **third-party Shopify app** (not the native theme), so the card structure is custom:

**Layout:**
- 4 columns on desktop (354px wide), 2 columns on tablet and mobile
- Image area: ~4:5 portrait ratio (354 × 443px)
- Details strip below: 67px tall with product name, price, type, currency

**Hover mechanic — image swap with split zones:**  
The image is divided into left and right invisible zones (each exactly half the card width). Hovering the left half fades in a second product image; hovering the right half fades in a third product image. Transition: 300ms ease-in-out.

There are **no swatches or quick-add buttons on the collection card**. Color variants are represented as separate cards in the grid — one card per color.

**Color swatches appear only on the product page**, as wide rectangular chips (149px × 30px on desktop, 80px × 30px on mobile). A sold-out swatch shows at 65% opacity with `cursor: no-drop`.

---

### Motion

The store feels snappy — transitions are short and decisive:
- Standard links and interactive elements: **300ms ease-in-out**
- Add-to-Cart button: **150ms ease-out** (faster for primary action)
- Card hover images: **300ms ease-in-out**
- Card title/price on hover: **200ms ease-in**

No bounce, no spring, no long fades.

---

### FAQ — Not an Accordion

The FAQ page (`/pages/faq-information`) is **plain rich text** — a single scrollable page with h3 section headings and paragraph body text. There is no accordion or collapsible component.

This means o2shop's FAQ page, if it needs an accordion, will be a **net-new component** not directly derived from the reference store.

---

## What Remains Unknown

Eleven items couldn't be confirmed from the extraction and are documented in Section 10 of `DESIGN_SYSTEM.md`. The most important ones:

1. **Selected swatch state** — what visual change indicates a chosen color? The CSS uses a `:checked + label` sibling rule that JavaScript can't easily read in computed styles. Needs DevTools inspection.
2. **Sticky header** — does the transparent header get a solid background color when the user scrolls? Which color?
3. **Sticky ATC bar** — does a "Add to Cart" bar appear fixed at the bottom on mobile when scrolling past the buy button?
4. **Status badges** — order status ("Unfulfilled", "Paid", etc.) — are these styled chips? What colors?
5. **oklch color values** — all the oklch entries in the color token table are formula-converted approximations; the DevTools eyedropper gives the true values.

---

## Files Produced

| File | Description |
|---|---|
| `specs/DESIGN_SYSTEM.md` | Full technical spec — all tokens, components, and open questions |
| `specs/DESIGN_SYSTEM_SUMMARY.md` | This document |
| `specs/research/home.raw.md` | Raw extracted values — home page |
| `specs/research/products-list.raw.md` | Raw extracted values — collection page |
| `specs/research/product-page.raw.md` | Raw extracted values — product detail page |
| `specs/research/faq.raw.md` | Raw extracted values — FAQ page |
| `specs/research/my-account.raw.md` | Raw extracted values — account page |
| `specs/research/order.raw.md` | Raw extracted values — order detail page |
| `specs/research/checkout.raw.md` | Raw extracted values — checkout page |
| `specs/screenshots/*/desktop.png` | Desktop screenshot (1440px) per page |
| `specs/screenshots/*/tablet.png` | Tablet screenshot (768px) per page |
| `specs/screenshots/*/mobile.png` | Mobile screenshot (390px) per page |
| `specs/screenshots/products-list/card-hover-right.png` | Product card hover state captured |

---

## Next Step

Implement the design tokens in `app/globals.css` using the confirmed values from `DESIGN_SYSTEM.md`, then build the first UI components (site header, product card, buttons) against those tokens.
