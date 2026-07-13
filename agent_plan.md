# PWI Website — Agent Implementation Plan

Source: **PWI Website Feedback FINAL.docx** (review of screenshots taken June 13, 2026)
Generated: 2026-06-13

This plan maps every item in the feedback document to a concrete action in this codebase. Each
item is tagged with one of:

- **✅ DONE** — fully implemented in code in this pass
- **🟗 SCAFFOLDED** — structure/UI built; needs the client to drop in real data (links, photos, copy)
- **⛔ BLOCKED** — cannot be done in code (DNS, third-party accounts, real assets) — instructions below
- **↪ DEFERRED** — intentionally left for the client/CMS (marketing copy, numbers to verify)

> Many feedback items depend on assets only Emmanuel/PWI can provide (real YouTube links, guest
> photos, founder headshot, custom domain DNS, real testimonials). Wherever that is the case, the
> UI is fully built and every unknown is centralized in **`client/src/config/site.ts`** and
> **`client/src/data/guests.ts`** with `TODO` markers — so going live is a fill-in-the-blanks job,
> not a re-build.

---

## Architecture (for context)

- **`client/`** — React 19 + Vite + TypeScript + Tailwind v4 + framer-motion + react-router. Public
  pages live in `client/src/pages`, homepage sections in `client/src/components/home`.
- **`server/`** — Express + Mongoose (MongoDB). An admin CMS (`/admin`) manages Events, Posts,
  Partners, Testimonials, etc. Public pages fetch from the API with hardcoded fallbacks.
- Pages that are **API-driven**: Events, Blog, Testimonials, Partners. Pages that are **hardcoded**:
  Conversations, About, Fellowship, Programs.

### Confirmed brand tokens (extracted from `client/src/index.css` — replaces the visual guesses in §1 of the feedback)

| Token | Hex | Tailwind class |
|---|---|---|
| Navy (hero/footer) | `#1a1a2e` | `navy-800` |
| Navy darkest | `#0f0f1a` | `navy-900` |
| Gold accent / CTA | `#d4a843` | `gold-400` |
| Gold link/hover | `#c49a35` | `gold-500` |
| Heading font | Playfair Display | `font-serif` |
| Body font | Inter | `font-sans` |

> Note: the feedback's `#5B4FCF` "primary purple" does **not** exist as a global token. The only
> purple on the site is the Fellowship `purple-600 → pink-600` gradient. §1 of the feedback
> explicitly confirms this gradient as a brand token for the **Fellowship cards and application box
> ONLY**, so it is intentionally kept there. §4.5 separately flags only the Fellowship *benefit
> icons* as off-brand — those were standardized to navy (see §4.5 below). So navy + gold are the
> site-wide brand; purple/pink is a scoped Fellowship accent. This table is the formal token
> reference §1 requested.

---

## 3. CRITICAL ISSUES

### 3.1 Events page empty / broken spinner — **🟗 SCAFFOLDED + ✅ code**
- ✅ Added optional `recordingLink` (YouTube) to the Event model and the Events page; past events now
  render a **"Watch Recording"** button when a link exists.
- ✅ Added a **"Watch Live on YouTube"** CTA on the Events hero (Saturday 7PM GMT messaging).
- ✅ Improved the empty/loader state copy so an empty DB no longer reads as "broken".
- 🟗 Seeded recurring **Saturday 7PM GMT** sessions (past + next upcoming) as placeholders in
  `server/src/seed.ts`. **Client action:** replace placeholder titles/speakers/recording links with
  the real session list, or enter them via the admin CMS at `/admin/events`.

### 3.2 / 4.4 Conversations page has no real speakers/YouTube — **🟗 SCAFFOLDED**
- ✅ Replaced the 3 "Coming Soon" placeholder cards with a real **Past Conversations** archive built
  from the 2025 guest list (Section 5 of the feedback), rendered from `client/src/data/guests.ts`.
- ✅ Added a prominent **"Watch Live on YouTube"** button above the fold.
- ✅ Added a dedicated **"Watch Live on YouTube"** band (CTA link to the channel). A true inline
  `<iframe>` embed is intentionally deferred until the real channel/video ID is confirmed —
  embedding the current placeholder URL would render a broken player. Swap the CTA for an iframe
  once `SOCIAL.youtube` in `config/site.ts` is set to the real channel.
- 🟗 **Client action:** fill in each guest's real `youtubeUrl`, `photo`, episode title, and air date
  in `client/src/data/guests.ts` (every field is present with a `TODO`).

### 3.3 Fake testimonials on homepage — **✅ DONE**
- ✅ Removed the fake `Sarah Johnson` / `Michael Chen` testimonials from `server/src/seed.ts`.
- ✅ Removed the fake fallback array from `Testimonials.tsx`; the section now **hides itself entirely**
  when there are no real, active testimonials (per "even 2 real ones beat any number of fake ones").
- 🟗 **Client action:** add real testimonials via `/admin/testimonials` — the section reappears automatically.

### 3.4 Still on Vercel subdomain — **⛔ BLOCKED (DNS / hosting)**
- Cannot be done from the codebase. **Client action:**
  1. In Vercel → Project → Settings → Domains, add `peoplewhoinspire.global` and `www.peoplewhoinspire.global`.
  2. Add the DNS records Vercel shows at your domain registrar.
  3. `siteUrl` is already `https://www.peoplewhoinspire.global` in the seed settings; once DNS is live, no code change needed.
  4. Note: API currently points at `peoplewhoinspire-api.onrender.com` (`client/.env.production`) — keep or move to a `api.peoplewhoinspire.global` subdomain.

### 3.5 / 4.8 Contact page shows only 3 social icons — **✅ DONE**
- ✅ Contact "Follow Us" now renders Facebook, Twitter/X, Instagram, LinkedIn, YouTube **and** WhatsApp,
  matching the footer, all from `config/site.ts`, all `target="_blank"`.
- ✅ Added a **WhatsApp contact method** block with the PWI number `+233 26 441 7040` (`wa.me` link).

### 3.6 Partner logos are letter-avatar placeholders — **✅ DONE (Option B)**
- ✅ Reframed the section from "Trusted by Leading Organizations" / "Our Partners" to
  **"Networks & Communities That Inspire Us"** so the letter-avatar entries read as aspirational, not
  as confirmed partnerships. Card "Partner" label → "Network". (Real logos can still be added per-partner
  via `/admin/partners`; if a logo exists it renders instead of the letter avatar.)

---

## 4. PAGE-BY-PAGE

### 4.1 Home
- ✅ Testimonials fake names removed (see 3.3).
- ✅ Partners reframed (see 3.6).
- 🟗 Hero is a flat gradient with no imagery → **client action:** drop a hero image/looping video
  (documented; left as gradient to avoid shipping a random stock asset). Hook point: `components/home/Hero.tsx` background div.
- ↪ Impact stats (50+, 1000+, 100+, 25+) — **client to verify accuracy.** Left as-is (marketing copy).
- ✅ Footer email already a `mailto:` link; ✅ Instagram handle standardized to `@peoplewhoinspire_global`;
  ✅ "Global Platform" → "Accra, Ghana · Operating Globally"; ✅ WhatsApp icon added (see Footer section).
- 🟗 "Next Live Session" banner — see §⚪ Nice-to-haves below (deferred; needs a chosen mechanism).

### 4.2 About — **✅ DONE / 🟗**
- ✅ Milestones now carry real months (March 2025 — Founded, April 2025 — First Conversations, etc.)
  and expanded 2-3 sentence descriptions.
- ✅ Added a **"Meet the Founder"** link/photo block pointing to the new `/founder` page.
- 🟗 Founder photo placeholder in place — **client action:** supply Emmanuel's headshot.

### 4.3 Programs — **🟗 SCAFFOLDED / ↪**
- ↪ The 5 program panels are solid-color gradient placeholders. Replacing them needs real photography
  (client assets). Left as gradients; hook point is the gradient `div` per program in `pages/Programs.tsx`.
- ✅ Verified "Learn More" buttons point to real, populated routes (`/conversations`, `/fellowship`, `/programs`).
- 🟗 Featured guest quote on the Conversations program block — covered by the new guest data; can be surfaced here later.

### 4.4 Conversations — see **3.2** above.

### 4.5 Fellowship — **✅ DONE / 🟗**
- ✅ Standardized the benefit icons from the off-brand `purple→pink` gradient to the site-wide
  **navy-800** icon treatment (matches About/Conversations) — this is the specific element §4.5 flagged.
- ℹ️ The **Application Process panel** keeps its `purple→pink` gradient on purpose: feedback §1
  confirms that gradient as a brand token for the "Fellowship cards and application box ONLY".
  If PWI would rather it be fully navy/gold, recolor `from-purple-600 to-pink-600` in
  `pages/Fellowship.tsx` — a one-line change.
- ✅ Added a **"Next Cohort"** dates block (placeholder dates + deadline) to create urgency.
- 🟗 **Client action:** set the real cohort open date + application deadline in `pages/Fellowship.tsx`.
- 🟗 "Apply Now" still routes to `/contact`; swap to a real application form URL in `config/site.ts` (`applicationFormUrl`) when available.

### 4.6 Events — see **3.1** above.

### 4.7 Blog — **↪ DEFERRED (content)**
- Structure is solid and already supports featured posts, categories, pagination, cover images.
- ↪ **Client action:** publish episode-recap posts via `/admin/posts`. No code change required.

### 4.8 Contact — see **3.5** above (+ location/handle/WhatsApp all fixed).

---

## 5. NEW PAGE: 2025 Conversations Gallery — **🟗 SCAFFOLDED**
- ✅ Built at route **`/our-guests`** (`client/src/pages/Guests.tsx`): hero "Voices That Changed Us",
  stats bar (8+ conversations · 7+ countries · Saturday 7PM GMT · Live on YouTube), 3-col responsive
  guest grid (headshot, name, title/org, country flag, episode, date, standout quote, "Watch Episode ▶"),
  and the footer CTA ("Nominate a Speaker" + "Watch All Episodes on YouTube ▶").
- ✅ Linked in the navbar under **Conversations → 2025 Guests**.
- 🟗 **Client action:** complete `client/src/data/guests.ts` — confirm titles/countries marked `[Confirm]`,
  add headshots and real YouTube links. Guest data is shared with the Conversations page so you only edit it once.

## 6. NEW PAGE: Emmanuel Mbansi — Founder — **🟗 SCAFFOLDED**
- ✅ Built at route **`/founder`** (`client/src/pages/Founder.tsx`): hero with gold label + serif name +
  descriptor, "His Story" copy (from the feedback's suggested draft), 4 credential cards, full-width pull
  quote, and a "Connect with Emmanuel" block.
- ✅ Linked in the navbar under **About → Meet the Founder**.
- 🟗 **Client action:** supply a high-res headshot (min 800×1000px) and confirm/personalize the story copy
  and the LinkedIn/Instagram/email links (centralized in `config/site.ts → founder`).

## 7. SOCIAL MEDIA & PLATFORM CHECKLIST — **✅ DONE / 🟗**
- ✅ Single source of truth created: **`client/src/config/site.ts`** holds every handle/URL/contact.
  Footer, Contact, Conversations, Guests, and Founder pages all read from it.
- ✅ Instagram handle standardized to **`@peoplewhoinspire_global`** everywhere.
- ✅ WhatsApp (`+233 26 441 7040` → `wa.me/233264417040`) added to footer + contact.
- ✅ Email is a clickable `mailto:` site-wide.
- ✅ All social icons open in a **new tab** (`target="_blank" rel="noopener noreferrer"`).
- ✅ Footer social icons animate to gold on hover (already present; verified).
- 🟗 **Client action:** the actual profile URLs (Facebook, Twitter/X, LinkedIn, YouTube) are `TODO`
  placeholders in `config/site.ts` — paste the real URLs. Until then those icons point to the channel
  homepage placeholders.

---

## 8. MASTER PRIORITY LIST — status

| Pri | Task | Status |
|---|---|---|
| 🔴 | Remove fake testimonials | ✅ DONE |
| 🔴 | Replace placeholder Conversations cards with real guests | 🟗 UI done, needs links/photos |
| 🔴 | Add YouTube link/embed on Conversations | ✅ DONE (URL is a TODO in config) |
| 🔴 | Populate Events with Saturday sessions | 🟗 placeholders seeded, client to finalize |
| 🔴 | Fix Events loader "broken" look | ✅ DONE |
| 🔴 | Connect custom domain | ⛔ BLOCKED (DNS — instructions in 3.4) |
| 🟡 | Build 2025 Guests Gallery | ✅ DONE (data TODO) |
| 🟡 | Build Founder page | ✅ DONE (photo/copy TODO) |
| 🟡 | Add WhatsApp (footer/contact) | ✅ DONE |
| 🟡 | Fix social footer links | 🟗 wired to config, URLs are TODO |
| 🟡 | Contact social icons (FB/YT/WhatsApp) | ✅ DONE |
| 🟡 | Replace program image gradients | ↪ needs photography |
| 🟡 | Partner logos section | ✅ DONE (reframed) |
| 🟡 | Emmanuel photo on About + milestone detail | ✅ milestones done; 🟗 photo TODO |
| 🟢 | Milestone months | ✅ DONE |
| 🟢 | Fellowship cohort dates + apply link | ✅ block added (dates TODO) |
| 🟢 | Real blog posts | ↪ content via CMS |
| 🟢 | Subscribe form → Mailchimp | ↪ form already captures to DB; Mailchimp optional |
| 🟢 | Standardize IG handle | ✅ DONE |
| 🟢 | Clickable mailto links | ✅ DONE |
| ⚪ | Hero photo/video | ↪ needs asset |
| ⚪ | Fellowship icon colors | ✅ DONE |
| ⚪ | Next Live Session countdown | ↪ deferred |
| ⚪ | Google Analytics 4 | ⛔ needs GA4 measurement ID (paste into `client/index.html`) |

---

## SEO (added on request — was not in the original feedback list)

Before this pass the SPA had only a single static `<title>` and a favicon. Added:
- ✅ **Per-route titles + meta** via a dependency-free `client/src/components/SEO.tsx` rendered once in
  `Layout` — sets `document.title`, `description`, Open Graph, Twitter, and `canonical` on every route
  change. Blog posts set their own title/description from the loaded post.
- ✅ **Rich static `<head>`** in `client/index.html` — description, full Open Graph + Twitter Card tags,
  canonical, `theme-color`, robots.
- ✅ **`client/public/robots.txt`** (allows all, disallows `/admin`, points at the sitemap).
- ✅ **`client/public/sitemap.xml`** (all public routes; both confirmed copied to `dist/` root).
- 🟗 **TODO:** add a real 1200×630 social share image at `client/public/og-image.png` (referenced by the
  OG/Twitter tags and `SITE.ogImage`). All URLs use the custom domain, so they go live with the DNS cutover (§3.4).
- ⛔ Note: this is a client-rendered SPA. Googlebot executes JS so per-route meta is indexed, but for
  guaranteed crawl coverage by all bots/social scrapers, prerendering/SSR would be the next step (larger change).
- ⚪ Google Analytics 4 still pending — paste a GA4 measurement ID snippet into `index.html`.

## Files changed/added in this pass

**Added**
- `client/src/config/site.ts` — brand/contact/social single source of truth (all client TODOs live here)
- `client/src/data/guests.ts` — 2025 guest list (shared by Conversations + Guests pages)
- `client/src/pages/Guests.tsx` — 2025 Conversations Gallery (§5)
- `client/src/pages/Founder.tsx` — Founder page (§6)

**Edited**
- `client/src/components/home/Testimonials.tsx` — remove fake fallback, hide when empty
- `client/src/components/home/Partners.tsx` — reframe as aspirational network
- `client/src/pages/Conversations.tsx` — real guests, YouTube live + embed
- `client/src/pages/Events.tsx` — recording links, live CTA, clearer empty state
- `client/src/pages/About.tsx` — milestone months + founder block
- `client/src/pages/Fellowship.tsx` — navy icons + cohort dates + apply link
- `client/src/pages/Contact.tsx` — full social set + WhatsApp + location/handle
- `client/src/components/layout/Footer.tsx` — WhatsApp + config-driven socials + location/handle
- `client/src/components/layout/Navbar.tsx` — dropdowns for new pages
- `client/src/App.tsx` — routes for `/our-guests` and `/founder`
- `client/src/pages/admin/ManageEvents.tsx` — admin form + list now expose `recordingLink`
- `client/src/types/index.ts` — `recordingLink` on the shared `Event` type
- `server/src/models/Event.ts` — `recordingLink` field
- `server/src/seed.ts` — remove fake testimonials, seed Saturday sessions, fix social handles

## Client follow-up checklist (the only things blocking go-live)
1. Connect `peoplewhoinspire.global` via DNS (§3.4).
2. Fill real values in `client/src/config/site.ts` (social URLs, YouTube channel, founder links).
3. Fill real values in `client/src/data/guests.ts` (YouTube links, photos, titles, dates).
4. Add real testimonials, blog posts, and finalized events via the `/admin` CMS.
5. Supply Emmanuel's headshot + program/hero photography.
6. (Optional) Add a GA4 measurement ID and a Mailchimp integration.
