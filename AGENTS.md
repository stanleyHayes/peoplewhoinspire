# People Who Inspire — Agent Guide

## Stack

- **client/** — React 19 + Vite 6 + TypeScript (strict) + Tailwind CSS v4 (`@tailwindcss/vite`, theme via `@theme` in `src/index.css`) + framer-motion + react-router-dom v7 + axios.
- **server/** — Express 4 + Mongoose + TypeScript (CommonJS). JWT auth, Cloudinary uploads.
- Deploy: client → Vercel (`client/vercel.json`), server → Render (`render.yaml` at repo root). CI: `.github/workflows/ci.yml` calls the reusable quality gate `.github/workflows/reusable-verify.yml` (install → lint? → typecheck → test → build) once per package — add new packages with one `uses:` block.
- TypeScript is pinned to ~5.9 on purpose: `typescript-eslint` caps at TS <6.1 (TS 7 is the native rewrite and breaks the lint toolchain).

## Commands

From repo root: `npm run dev` (both), `npm run build`, `npm run typecheck`, `npm test`, `npm run lint`, `npm run seed`.
Per package: client has `dev/build/lint/typecheck/test/test:coverage`; server has `dev/build/start/seed/typecheck/test`.
Client tests: Vitest + Testing Library (jsdom), setup in `client/src/test/setup.ts`. Server tests: Vitest + supertest in `server/tests/` (`NODE_ENV=test` skips DB connect + listen).

## Design system (post-2026 redesign)

Palette: navy `#1a1a2e` scale, gold `#d4a843` scale, cream `#f7f5ef`. Fonts: Fraunces (headings, `font-serif`), Outfit (body, `font-sans`), Axiforma (admin UI, `font-admin`, self-hosted in `client/public/fonts`).

Key classes in `client/src/index.css`: `pwi-btn` + `pwi-btn-primary/dark/outline/ghost-light` (pill buttons with glow shadows), `pwi-glass` / `pwi-glass-light` (backdrop-blur panels), `pwi-ring-decor` (concentric gold rings), `pwi-section-dark` (gradient navy sections), `pwi-panel-dark` (gradient dark cards), `pwi-card` (1rem radius), `pwi-eyebrow`, `pwi-zoom-img`, `pwi-pulse-dot`. Watermark animations: `pwi-wm-spin` / `pwi-wm-float` (reduced-motion aware).

Shared components: `components/ui/PageHero` (full-bleed photo hero — all inner pages use it), `SectionHeader`, `GuestCard`, `Watermark` (+ `defaultWatermarkFor`), `AnimatedCounter`, `Constellation`, `Skeleton`, `Markdown`. Layout: `Navbar` (glass, utility bar, pill nav), `Footer` (gradient + glass CTA), `motion/ScrollProgress`, `motion/Reveal` (`Reveal`, `Reveal3D`), `motion/AnimatedOutlet`, `motion/Parallax`.

## Content & config

- `client/src/config/site.ts` — SITE/CONTACT/SOCIAL/LIVE_SESSION/FOUNDER/FORMS (single source of truth; TODO markers for unconfirmed URLs).
- `client/src/config/navigation.ts` — nav groups driving Navbar + Footer.
- `client/src/data/guests.ts`, `client/src/data/siteContent.ts` — guests, images, fallback events/posts.
- Patterns: `client/public/patterns/*.svg`. OG image: `client/public/og-image.png` (regenerate from `client/scripts/og-image.html` via headless Chrome, 1200×630).

## SEO

`components/SEO.tsx` (route meta + `setDocumentMeta`, supports `type`/`image`), `components/JsonLd.tsx` (Organization/WebSite/BreadcrumbList/Person/Event + `setPageJsonLd` for article pages), `client/public/sitemap.xml` + `robots.txt`. Admin sets `noindex` at runtime.

## Conventions

- Skeletons, not spinners. Keep content in config/data modules, not inline, where shared.
- Admin dark mode uses `.admin-dark` overrides in `index.css` — don't break those class combinations.
- Server: `app` is exported from `src/index.ts`; DB connect + listen are skipped when `NODE_ENV=test`.
