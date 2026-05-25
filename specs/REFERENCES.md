# Reference URLs

## Pages

### Home Page
- **Context:** Landing page / entry point of the shop.
- **Live reference:** https://shirtz.cool/
- **Local saved page:** _(none)_
- **My route:** `http://o2shop/`
- **Extract:** Hero layout, navbar, featured sections, footer structure, typography scale, color tokens.

---

### Products List (Category View)
- **Context:** Products list of a specific category.
- **Live reference:** https://shirtz.cool/collections/hats
- **Local saved page:** _(none)_
- **My route:** `http://o2shop/{collectionName}/{categoryName}`
- **Extract:**
  - Product card default state (image, title, price layout).
  - On-hover interaction: card splits into **left** and **right** areas.
  - On-hover left area: color swatches appear; toggling unavailable colors is supported.
  - On-hover right area: size selectors appear; toggling unavailable sizes is supported.
  - Grid layout, gap, card radius, skeleton placeholder dimensions.

---

### Product Page (Single Product)
- **Context:** Specific product detail view.
- **Live reference:** https://shirtz.cool/products/the-play-cool-beanie
- **Local saved page:** _(none)_
- **My route:** `http://o2shop/products/{productName}`
- **Extract:**
  - Product image gallery layout and dimensions.
  - Title, price, variant selector (colors, sizes) styles.
  - Product description area — note that description content uses **collection-specific styles** constrained to that collection (custom typography, colors, or layout rules per collection).
  - Add-to-cart button, sticky behavior if any.

---

### My Account
- **Context:** Authenticated account view. Includes: Order History list and Account Details (saved addresses).
- **Live reference:** https://shirtz.cool/account?analytics_trace_id=efaed27a-354d-436d-b3da-dcd0a7289bc7
- **Local saved page (authorized):** `.\specs\Account– Cool Shirtz-My Account.html`
- **My route:** `http://o2shop/account`
- **Notes:** Prefer local saved page for extraction — the live URL requires authentication.
- **Extract:**
  - Account page layout (sidebar vs. tabbed navigation).
  - Order history list: order number, date, status, total, link to order detail.
  - Account details form: saved address(es), edit controls, field layout.
  - Empty states (no orders, no saved address).

---

### Specific Order View
- **Context:** Detail view of a single order for an authenticated user.
- **Live reference:** https://shirtz.cool/account/orders/a85da354c226399361fea4870bcbae91
- **Local saved page (authorized):** `.\specs\Order COOL727871– Cool Shirtz-Order Page.html`
- **My route:** `http://o2shop/orders/{orderId}`
- **Notes:** Prefer local saved page for extraction — the live URL requires authentication.
- **Extract:**
  - Order summary header (order number, date, status badge).
  - Line items list: product image, name, variant, quantity, price.
  - Shipping address block and delivery status.
  - Order totals (subtotal, shipping, tax, total) layout.
  - Skeleton placeholder geometry for each section.

---

### FAQ Page
- **Context:** Frequently asked questions / information page.
- **Live reference:** https://shirtz.cool/pages/faq-information
- **Local saved page:** _(none)_
- **My route:** `http://o2shop/faq-information`
- **Extract:**
  - Accordion / collapsible section pattern (open/closed states).
  - Typography for question headings and answer body text.
  - Spacing between FAQ items, section headers if grouped.

---

### Checkout Page
- **Context:** Multi-step or single-page checkout flow.
- **Live reference:** https://shirtz.cool/checkouts/cn/hWNCSAiZyANAGCuNLFxjThy5/en-cz?_r=AQABp6rgXvzhIKR7kOh_mj5_4e9yiln1zH0IFY38EUD1-Wg
- **Local saved page (authorized):** `.\specs\Checkout - Cool Shirtz-Checkout Page.html`
- **My route:** `http://o2shop/checkouts/{...}`
- **Notes:** Prefer local saved page for extraction — the live URL is a one-time session token.
- **Extract:**
  - Step layout (contact → shipping → payment) and progress indicator.
  - Form field styles (input, select, label, error state, focus ring).
  - Order summary sidebar: line items, totals, collapse behavior on mobile.
  - CTA button (Continue / Pay Now) size, placement, disabled state.
  - Skeleton placeholder geometry for the summary sidebar and form sections.

---

## Fidelity

| Category | Level |
|---|---|
| Design tokens (colors, type, spacing, radii, shadows) | Pixel-perfect |
| Component composition and layout rhythm | High fidelity |
| On-hover interaction behavior (product card) | High fidelity |
| Collection-specific description styles | Document only — do not hard-code per-collection rules |
| Real backend, auth flows, payments | Out of scope |
| Accessibility audits | Out of scope |

---

## Extraction Notes

- **Local saved pages (`.html` files in `.\specs\`)** must be used for authenticated routes
  (Account, Order, Checkout). Load them via `file://` in Playwright MCP rather than
  fetching the live URL, which requires a valid session.
- **Do NOT use `WebFetch`** for any of these pages — it does not render JavaScript and
  will miss computed styles, CSS custom properties, and interactive states.
- Use **Playwright MCP** (`browser_navigate` / `browser_evaluate` / `browser_snapshot`)
  for all live-URL extraction. Run `getComputedStyle()` on representative elements;
  never guess a value.
- Capture screenshots at **1440 px**, **768 px**, and **390 px** for every page.
  Save to `docs/design-references/shirtz-cool/<page-slug>/`.
- Product card hover state requires `browser_hover` on a card element before
  snapshotting — document both the default and hovered states separately.
