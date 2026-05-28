# Admin Design System — o2shop

> Pair files: `specs/ADMIN_FRONTEND_TRACKING.md` · `specs/DESIGN_SYSTEM.md` (storefront spec — do not mix)
> Scope: `/admin` route subtree only.

---

## 1. Aesthetic Direction

**Theme:** Clean SaaS / Clinical  
**Mode:** Light only — no dark mode  
**Shell:** Fixed left sidebar (240px) + full-width content area

The admin is a functional operator tool, not an extension of the storefront. The storefront's raw athletic energy (Fjalla One, flat sharp buttons, coral-red accent) is replaced with a neutral, data-focused aesthetic. The brand thread is maintained through the near-black primary (`#1e1e1e`) on action buttons and the accent red (`#e55151`) on destructive actions only.

---

## 2. UI Library

**shadcn/ui** (https://ui.shadcn.com) + **Radix UI** primitives + **TanStack Table** (bundled with shadcn table).

### One-time setup

```bash
npx shadcn@latest init
# Style: Default | Base color: Slate | CSS variables: yes | Tailwind: yes | Alias: @/components
```

### Required component installs

```bash
npx shadcn@latest add table button input select dialog badge card form label switch separator avatar dropdown-menu tabs textarea
```

Also install:

```bash
npm install lucide-react         # icons throughout admin
npm install @tanstack/react-table # data table (installed by shadcn table)
```

### Usage rules

- Import from `@/components/ui/...` (shadcn convention).
- All admin wrapper components live in `components/admin/` — never put domain logic in `components/ui/`.
- Extend shadcn variants in the component file; do not add `className` inline hacks to override.
- shadcn `init` will prepend variables to `app/globals.css`. The `--admin-*` tokens defined below must be added **after** the shadcn block to avoid shadcn overwriting them.

---

## 3. Color Tokens — Admin

> Admin-only tokens use `--admin-*` prefix. Add to `app/globals.css` inside `:root {}`, below the shadcn-generated block.
> Do NOT use `var(--color-*)` storefront tokens in admin components.

### Surface palette

| Token | Value | Usage |
|---|---|---|
| `--admin-bg` | `#f9fafb` | Page canvas background (content area) |
| `--admin-surface` | `#ffffff` | Cards, tables, dialogs |
| `--admin-sidebar-bg` | `#f3f4f6` | Sidebar background |
| `--admin-sidebar-border` | `#e5e7eb` | Sidebar right border |
| `--admin-border` | `#e5e7eb` | Table rows, card borders, dividers |
| `--admin-border-input` | `#d1d5db` | Input / select border at rest |
| `--admin-ring` | `#111827` | Focus ring color |

### Text palette

| Token | Value | Usage |
|---|---|---|
| `--admin-text-primary` | `#111827` | Body, table cells, headings |
| `--admin-text-secondary` | `#4b5563` | Labels, nav items, sub-text |
| `--admin-text-muted` | `#9ca3af` | Placeholder, disabled, captions |
| `--admin-text-on-dark` | `#ffffff` | Text on primary/destructive bg |

### Brand action palette (brand thread from storefront)

| Token | Value | Notes |
|---|---|---|
| `--admin-primary` | `#1e1e1e` | Primary buttons, active sidebar item bg |
| `--admin-primary-hover` | `#333333` | Primary button hover |
| `--admin-destructive` | `#e55151` | Delete/danger buttons |
| `--admin-destructive-hover` | `#d14343` | Destructive hover |

### Status palette

| Token | bg | fg | Used for |
|---|---|---|---|
| `--admin-status-success-bg/fg` | `#dcfce7` / `#16a34a` | fulfilled, paid, active, approved |
| `--admin-status-warning-bg/fg` | `#fef9c3` / `#ca8a04` | pending, partial, processing |
| `--admin-status-error-bg/fg` | `#fee2e2` / `#dc2626` | cancelled, rejected, failed, inactive |
| `--admin-status-neutral-bg/fg` | `#f3f4f6` / `#6b7280` | draft, regular role, unknown |
| `--admin-status-info-bg/fg` | `#dbeafe` / `#2563eb` | admin role, in-review |

---

## 4. Typography

Admin typography prioritizes legibility over personality.

**Typeface:** `"Plus Jakarta Sans", system-ui, sans-serif`  
Load via `next/font/google`: `Plus_Jakarta_Sans` weights 400, 500, 600, 700.

> Rationale: Plus Jakarta Sans is geometric and clean, reads well in dense tables at 12–14px, and has enough personality to distinguish the admin from a system-font default. It does not conflict with the storefront's Fjalla One.

Apply to the admin layout wrapper: `className={`${plusJakartaSans.variable} font-sans`}`.

| Role | Size | Weight | Letter-spacing | Transform | Notes |
|---|---|---|---|---|---|
| Page title (h1) | 22px | 600 | 0 | none | Top of each admin page |
| Section heading (h2) | 16px | 600 | 0 | none | FormCard title |
| Table header `<th>` | 12px | 600 | 0.04em | uppercase | Column headers |
| Table cell `<td>` | 14px | 400 | 0 | none | Row data |
| Form label | 12px | 500 | 0 | none | Above inputs |
| Input / select value | 14px | 400 | 0 | none | — |
| Button text | 14px | 500 | 0 | none | All button sizes |
| Badge / chip | 11px | 500 | 0.03em | uppercase | Status labels |
| Sidebar nav item | 14px | 500 | 0 | none | — |
| Sidebar section label | 11px | 600 | 0.08em | uppercase | Group separators |
| Caption / helper text | 12px | 400 | 0 | none | Below inputs |

---

## 5. Spacing

Inherit storefront `--space-*` tokens for internal spacing. No new tokens needed.

Admin layout constants — add to `:root {}` in `app/globals.css`:

| Token | Value | Usage |
|---|---|---|
| `--admin-sidebar-width` | 240px | Fixed sidebar width |
| `--admin-content-px` | 24px | Content area horizontal padding |
| `--admin-content-py` | 24px | Content area vertical padding |
| `--admin-table-row-h` | 48px | Minimum table row height |

---

## 6. Border Radius

Admin uses softer radii than the storefront (which uses `--radius-none` for most elements).

| Context | Value | Notes |
|---|---|---|
| Input, select, textarea | 4px (`--radius-sm`) | shadcn default |
| Button | 4px (`--radius-sm`) | All button sizes |
| Card / FormCard | 6px (`--radius-base`) | White surface cards |
| Badge / chip | 4px (`--radius-sm`) | Status chips |
| Dialog | 8px (`--radius-md`) | Modal dialogs |
| Sidebar nav item (active bg) | 4px (`--radius-sm`) | Active state pill |
| Dropdown menu | 6px (`--radius-base`) | Row action menus |

---

## 7. Elevation / Shadows

Admin is largely flat. Elevation used only to separate layers.

| Level | box-shadow | Used on |
|---|---|---|
| 0 — flat | `none` | Table, sidebar, filter bar |
| 1 — card | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` | FormCard, stat card |
| 2 — dropdown | `0 4px 12px rgba(0,0,0,0.10)` | Dropdowns, tooltips |
| 3 — dialog | `0 8px 32px rgba(0,0,0,0.14)` | Dialogs |

---

## 8. Motion

Admin animations are minimal and utilitarian.

| Element | Property | Duration | Easing |
|---|---|---|---|
| Sidebar nav item hover | background-color | 150ms | ease |
| Button hover / press | background-color, transform | 100ms | ease |
| Dialog open | opacity + scale(0.97→1) | 200ms | ease-out |
| Dropdown open | opacity + translateY(-4px→0) | 150ms | ease-out |
| Toast slide-in | translateX | 300ms | ease-out |
| Table row hover | background-color | 100ms | ease |
| Page transitions | none | — | — |

---

## 9. Shell Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Sidebar (240px, fixed, full height)  │ Content (flex-1)      │
│                                      │                        │
│ ┌──────────────────────────────────┐ │ bg: #f9fafb           │
│ │ [Logo 100px]              48px   │ │ padding: 24px          │
│ └──────────────────────────────────┘ │                        │
│                                      │ [AdminPageHeader]      │
│ ── MANAGE ──────────────────────── │ │ title + CTA button     │
│   Dashboard                          │ ─────────────────────  │
│   Products                           │                        │
│   Orders                             │ [FilterBar]            │
│   Users                              │                        │
│ ── CATALOG ─────────────────────── │ │ [DataTable]            │
│   Categories                         │                        │
│   Collections                        │ [AdminPagination]      │
│ ── CONTENT ─────────────────────── │ │                        │
│   Reviews                            │                        │
│   Shipping                           │                        │
│                                      │                        │
│ ──────────────────────────────────── │                        │
│ [Avatar] user@email.com [Logout]     │                        │
└──────────────────────────────────────────────────────────────┘
```

### Sidebar spec

- `position: fixed; top: 0; left: 0; height: 100vh; width: 240px`
- `background: var(--admin-sidebar-bg)` = `#f3f4f6`
- `border-right: 1px solid var(--admin-sidebar-border)` = `#e5e7eb`
- `overflow-y: auto` — scrollable if nav exceeds viewport

**Logo zone:** 48px height, `px-4`, logo SVG at 100px wide, centered vertically. Link to `/admin`.

**Section label:** 11px, uppercase, letter-spacing 0.08em, `color: var(--admin-text-muted)`, `px-4 pt-4 pb-1`.

**Nav item:**
- Height: 40px, `px-3`, `rounded-[4px]`, `mx-2`, icon (16px Lucide) + label gap-3
- Default: `hover:bg-[#e5e7eb]`, text `var(--admin-text-secondary)`
- Active (exact path match or prefix): `bg-[var(--admin-primary)] text-white`
- Transition: 150ms ease on background

**Bottom user strip:** `border-top: 1px solid var(--admin-border)`, `p-3`, flex row: `<Avatar size=32>` + email (truncated, max 140px) + logout icon button.

### Content area spec

- `margin-left: var(--admin-sidebar-width)` = 240px
- `background: var(--admin-bg)` = `#f9fafb`
- `min-height: 100vh`
- `padding: var(--admin-content-py) var(--admin-content-px)` = 24px

---

## 10. Component Inventory

### 10a. DataTable

Wrapper around shadcn `<Table>` + TanStack Table. Standard for all list pages.

```
┌───────────────────────────────────────────────────────────────┐
│ [FilterBar: Search ____  Status ▾  Category ▾  Clear filters] │
├───────────────────────────────────────────────────────────────┤
│  NAME ↑↓     PRICE ↑↓    STATUS      CREATED      ACTIONS    │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│  Blue Widget  $29.99    ● Published  Jan 5, 2025  Edit  [⋮]  │
│  Red Cap      $19.99    ○ Draft      Jan 3, 2025  Edit  [⋮]  │
├───────────────────────────────────────────────────────────────┤
│  Showing 1–20 of 143 results         20 per page  ← 1 2 3 →  │
└───────────────────────────────────────────────────────────────┘
```

- Header row: `background: #f9fafb`, 12px uppercase, 600 weight, `color: var(--admin-text-secondary)`
- Row height: min 48px; `hover:bg-[#f9fafb]` (slight tint from white)
- Cell padding: `px-4 py-3`
- Actions column: always last; `<Button variant="ghost" size="sm">Edit</Button>` + `<DropdownMenu>` for secondary (Delete, etc.)
- Loading state: 6 skeleton rows, each with shimmer bars matching column widths
- Empty state: centered Lucide icon + "No [entity] found." message in `--admin-text-muted`

### 10b. FilterBar

Above every DataTable. Composed per-page based on available API filter params.

- **Search input:** 280px wide, left-aligned, `<Input>` with `<Search className="h-4 w-4">` prefix icon, debounced 300ms
- **Filter selects:** `<Select>` inline to the right of search; label-less, placeholder "All Statuses" etc.
- **Clear filters link:** appears only when any filter or search is non-default; `color: --admin-text-secondary`, underline on hover
- All filter changes push to URL via `router.replace` (not `push`) to avoid polluting browser history

### 10c. AdminPagination

Below every DataTable.

- Left: "Showing X–Y of Z results" in `--admin-text-muted`, 14px
- Right: Page size select (20 / 50 / 100) + prev/next buttons + page numbers
- Page numbers: show at most 7, with ellipsis (…) for gaps
- URL-driven: `?page=2&limit=20`; parent reads `searchParams` and passes as props

### 10d. AdminBadge

Status chips for orders, reviews, users. Intentionally different from the storefront `Badge` component.

| Variant | bg | fg | Used for |
|---|---|---|---|
| `success` | `#dcfce7` | `#16a34a` | fulfilled, paid, active, approved |
| `warning` | `#fef9c3` | `#ca8a04` | pending, partial, processing |
| `error` | `#fee2e2` | `#dc2626` | cancelled, rejected, failed, inactive |
| `neutral` | `#f3f4f6` | `#6b7280` | draft, regular user, unknown |
| `info` | `#dbeafe` | `#2563eb` | admin role, in-review |

Font: Plus Jakarta Sans, 11px, weight 500, letter-spacing 0.03em, uppercase.  
Padding: `px-2 py-0.5`. Border-radius: 4px. No border.

### 10e. ConfirmDialog

Wraps shadcn `<Dialog>`. Required for all destructive actions.

- Trigger: rendered by the parent (pass `open` + `onOpenChange` as controlled props)
- Confirm button: shows spinner + disabled state while `onConfirm` in-flight
- `destructive?: boolean` (default `true`) — uses red `variant="destructive"` button
- On success: close dialog + fire toast "Deleted successfully"
- On error: show inline error message inside dialog, keep open

### 10f. FormCard

Consistent wrapper for edit/create form sections.

```
┌─ Section Title ──────────────────────────────────────────────┐
│  Optional description text in --admin-text-muted             │
│  ────────────────────────────────────────────────            │
│  Label                   [Input                          ]   │
│  Label                   [Select ▾                       ]   │
│  Helper text                                                  │
└──────────────────────────────────────────────────────────────┘
```

- Background: `var(--admin-surface)` = white
- Border: `1px solid var(--admin-border)`
- Border-radius: 6px
- Padding: 24px
- Shadow: elevation-1 (`0 1px 3px rgba(0,0,0,0.08)`)
- Title: 16px / 600 / `--admin-text-primary`
- Description: 14px / 400 / `--admin-text-muted`, margin-bottom 16px

### 10g. AdminPageHeader

Above page content. Not in the sidebar.

- Flex row, `pb-4 mb-6`, `border-bottom: 1px solid var(--admin-border)`
- Left: h1 (22px / 600), optional breadcrumb row above it (12px / `--admin-text-muted`, "Admin / Products / Edit")
- Right: primary CTA slot (e.g. `<Button>New Product</Button>`) — right-aligned

---

## 11. Product Edit — Variant Section

The most complex form in the admin. Lives in the **Variants** tab of the product edit page.

**Tab structure:** `<Tabs defaultValue="details">` with tabs: Details | Variants | Photos

**Variants tab layout:**

```
┌─ Variants ────────────────────────────────────────────────────┐
│  [+ Add Variant]                               (button, right) │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ████ Navy Blue   M   SKU: BLU-M   Stock: 50   $34.99  ●  │  │
│  │                              [Set default] [Edit] [Del]   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  (one card per variant)                                         │
└─────────────────────────────────────────────────────────────────┘
```

- Each variant: white `FormCard`-style row, not a table row (too many fields)
- Color preview: 16×16px circle with `background: colorValue`
- Default variant: shown with a small `<AdminBadge variant="info">Default</AdminBadge>`
- "Add Variant" / "Edit Variant": open a `<Dialog>` with full form fields

**Variant dialog form fields:**

| Field | Input type | Notes |
|---|---|---|
| colorName | text input | e.g. "Navy Blue" |
| colorValue | `<input type="color">` + text input | hex; show live preview |
| size | text input | e.g. "M", "XL", "One Size" |
| sku | text input | e.g. "BLU-M-001" |
| stock | number input | ≥ 0 |
| priceOverride | number input | optional; overrides basePrice |
| compareAtPrice | number input | optional; shows as crossed-out |
| available | toggle switch | |
| inventoryPolicy | select | `deny` / `continue` |

**API calls:**
- Create: `POST /admin/products/{id}/variants` (`CreateVariantDto`)
- Update: `PATCH /admin/products/{id}/variants/{variantId}` (`UpdateVariantDto`)
- Delete: `DELETE /admin/products/{id}/variants/{variantId}` → `<ConfirmDialog>`
- Set default: `POST /admin/products/{id}/variants/{variantId}/default`

---

## 12. Photo Upload Section (Product Edit — Photos Tab)

```
┌─ Photos ──────────────────────────────────────────────────────┐
│  [Drag & drop or click to upload — JPEG, PNG, WebP]           │
│  ────────────────────────────────────────────────────         │
│  [img sortOrder:0] [img sortOrder:1] [img sortOrder:2]        │
│   sortOrder input    sortOrder input    sortOrder input        │
│       [Delete]           [Delete]           [Delete]           │
└───────────────────────────────────────────────────────────────┘
```

- Upload: `POST /admin/products/{id}/photos` (multipart/form-data, `file` field + optional `altText` query param)
- Delete: `DELETE /admin/products/{id}/photos/{photoId}` → `<ConfirmDialog>`
- sortOrder is displayed and editable (inline number input, calls PATCH on blur)
- Drag-to-reorder: out of scope for v1

---

## 13. Open Questions

| # | Item | Status |
|---|---|---|
| 1 | `POST /admin/users` does not exist in the API — create-user page is blocked until endpoint added | ⚠️ BLOCKED |
| 2 | `GET /admin/orders` has no filter params in current spec (only page/limit) — search/status filters may need API update | ⚠️ CHECK |
| 3 | Dashboard stat cards require aggregation endpoints not yet in API | ⬜ FUTURE |
| 4 | Photo sortOrder editing — PATCH endpoint for updating sortOrder on a photo not confirmed in spec | ⬜ CHECK |
| 5 | shadcn `init` will modify `globals.css` — ensure `--admin-*` tokens are added after the shadcn block | ⚠️ NOTE |
| 6 | Plus Jakarta Sans loaded in admin layout only (`next/font/google`) — do not apply to root layout | ⚠️ NOTE |
