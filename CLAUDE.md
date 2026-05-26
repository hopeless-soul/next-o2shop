# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Architecture

This is a Next.js 15 App Router project with TypeScript and Tailwind CSS. No `src/` directory — all app code lives directly under `app/`.

**Routing:** File-system based via `app/` directory. `app/layout.tsx` is the root layout wrapping all pages. `app/page.tsx` is the home route (`/`).

**Styling:** Tailwind CSS via `globals.css`. No CSS Modules — use Tailwind utility classes directly in JSX.

**ESLint:** Configured with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. The `specs/` directory is not ignored — avoid placing lintable JS/TS files there unless intentional.

**`specs/`:** Contains scraped HTML/asset files from a reference Shopify store (Cool Shirtz). These are design/spec references only, not part of the app.

## Design System

**Spec file:** `specs/DESIGN_SYSTEM.md`

When building any frontend UI — components, pages, layouts — you **must** follow the design tokens and guidelines in `specs/DESIGN_SYSTEM.md`. Specifically:

- **Colors:** Use only the `--color-*` CSS custom properties defined in `app/globals.css` (sourced from the spec). Never hardcode hex values.
- **Typography:** Use `--font-primary` (Fjalla One) for headings and body, `--font-secondary` (Montserrat) for labels, sub-labels, footer text. Apply the type scale roles from the spec (size, weight, letter-spacing, text-transform) for each element type.
- **Spacing:** Use `--space-*` tokens for margins and padding. Do not use arbitrary spacing values.
- **Border radius:** Use `--radius-*` tokens exclusively.
- **Shadows:** Use `--shadow-0` through `--shadow-4` for elevation levels.
- **Motion:** Use `--transition-*` tokens for all CSS transitions.
- **Layout constants:** Use `--header-height-desktop/mobile`, `--header-px-desktop/mobile`, `--atc-height`, `--cart-drawer-width`, and `--checkout-max-width` for structural measurements.

All tokens are available as Tailwind utilities via `@theme inline` in `globals.css` (e.g., `bg-accent`, `text-primary`, `rounded-pill`, `shadow-3`). Prefer Tailwind classes over inline `var()` references in JSX unless a utility class does not exist for the token.

## Backend Integration & API Specifications

- **Backend Role:** This frontend application connects directly to the **O2Shop e-commerce API** backend project.
- **OpenAPI Specification:** The dynamic backend API schema is located locally at:
  `C:\Users\hk\Documents\Development\nest\nest-o2shop\specs\openapi.json`
- **Agent Instruction:** Because the backend is actively being developed, this `openapi.json` file is highly dynamic. **You must re-scan/re-read this file every time you need to rely on, update, or integrate with the backend API endpoints.** Do not rely on cached structures of this file across different tasks.

## API Layer

The HTTP layer lives in `lib/api/`. All data fetching goes through Axios — never use `fetch` directly.

**Two Axios instances:**

- `lib/api/server.ts` — Server-side only. Guarded with `import 'server-only'` (will cause a build error if imported in a Client Component). Reads `access_token` from HttpOnly cookies via `next/headers` and attaches it as `Authorization: Bearer`. Use this in RSC pages and Server Actions for read operations.
- `lib/api/client.ts` — Browser only. Uses `withCredentials: true` so the browser sends HttpOnly cookies automatically. Includes a 401 → refresh → retry interceptor. Use this in Client Components for mutations (cart, auth forms, address CRUD).

**Domain services** (`lib/api/*.ts`):

| File | Covers |
|---|---|
| `categories.ts` | `GET /categories`, `GET /categories/{id}` |
| `auth.ts` | login, register, logout, refresh, `GET /me` |
| `products.ts` | product list (paginated + filters), product by slug |
| `reviews.ts` | reviews by product, delete review |
| `orders.ts` | `GET /me/orders`, `GET /orders/{orderNumber}` |
| `addresses.ts` | list, create, update, delete saved addresses |
| `cart.ts` | stub — no cart endpoint in API yet |

**Error handling:** All errors are normalised by `lib/api/errors.ts` into typed subclasses (`AuthError`, `NotFoundError`, `ValidationError`, `ForbiddenError`, `ApiError`). In RSC pages, catch `NotFoundError` → `notFound()` and `AuthError` → `redirect('/login')`.

**Auth:** The backend sets `access_token` and `refresh_token` as HttpOnly cookies on login/refresh. The frontend never reads or stores tokens directly. The client instance silently refreshes on 401.

**Environment:** Set `NEXT_PUBLIC_API_URL` in `.env.local` (e.g. `http://localhost:3001`). Both instances share this variable.

**Key gotchas:**
- `GET /orders/{orderNumber}` takes the display-format string (e.g. `ORD-20240101-0001`), not a UUID. Order detail links must use `order.orderNumber`.
- `GET /products/{productId}/reviews` takes the product UUID, not the slug. Fetch the product first to get its `id`, then fetch reviews.
- `cookies()` from `next/headers` is async in Next.js 15 — always `await` it.