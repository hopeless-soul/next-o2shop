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

**Fonts:** Geist Sans and Geist Mono loaded via `next/font/google`, exposed as CSS variables (`--font-geist-sans`, `--font-geist-mono`) on `<html>`.

**Styling:** Tailwind CSS via `globals.css`. No CSS Modules — use Tailwind utility classes directly in JSX.

**ESLint:** Configured with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. The `specs/` directory is not ignored — avoid placing lintable JS/TS files there unless intentional.

**`specs/`:** Contains scraped HTML/asset files from a reference Shopify store (Cool Shirtz). These are design/spec references only, not part of the app.

## Backend Integration & API Specifications

- **Backend Role:** This frontend application connects directly to the **O2Shop e-commerce API** backend project.
- **OpenAPI Specification:** The dynamic backend API schema is located locally at:
  `C:\Users\hk\Documents\Development\nest\nest-o2shop\specs\openapi.json`
- **Agent Instruction:** Because the backend is actively being developed, this `openapi.json` file is highly dynamic. **You must re-scan/re-read this file every time you need to rely on, update, or integrate with the backend API endpoints.** Do not rely on cached structures of this file across different tasks.