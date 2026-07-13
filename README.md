# People Who Inspire

Global leadership and impact platform — weekly conversations, programs, and a fellowship for purpose-driven leaders.

- **client/** — React 19 + Vite 8 + TypeScript + Tailwind CSS v4 + framer-motion (deploys to **Vercel**)
- **server/** — Express 5 + Mongoose 9 API (deploys to **Render** via `render.yaml`)

## Quick start

```bash
npm run install:all   # install client + server deps
npm run dev           # client on :5190, API on :8000 (Vite proxies /api)
npm test              # all tests (Vitest)
npm run build         # typecheck + production build, both packages
```

Server needs `server/.env` (see `server/.env.example`): MongoDB URI, JWT secret, Cloudinary keys. Seed an admin with `npm run seed`.

## Deploy the client to Vercel (zero config)

The root `vercel.json` builds `client/` automatically — just import the repo at [vercel.com/new](https://vercel.com/new) with no settings changes.

1. Import the GitHub repo → Vercel detects **Vite** and uses the root `vercel.json` (install `npm --prefix client ci`, build `npm --prefix client run build`, output `client/dist`).
2. Add one environment variable:
   - `VITE_API_URL` = `https://peoplewhoinspire-api.onrender.com/api` (your Render API URL + `/api`)
3. Deploy. SPA rewrites, asset caching, and security headers are preconfigured.
4. Add your Vercel domain to the API's `CORS_ORIGINS` env var on Render.

> Alternative: set the Vercel project **Root Directory** to `client` — `client/vercel.json` covers that layout instead.

## Deploy the API to Render

1. In the Render dashboard: **New → Blueprint** → select the repo — it reads `render.yaml` automatically.
2. Set the secrets marked `sync: false` (`MONGODB_URI`, Cloudinary keys). `JWT_SECRET` auto-generates.
3. Health check: `GET /api/health`.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, and builds on every push to `main`.
