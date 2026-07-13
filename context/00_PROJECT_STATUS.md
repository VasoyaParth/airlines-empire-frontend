# Airlines Empire — Project Status

**Read this file first, every session.** It's the single source of truth for
"what stage are we at, what works, what's next." Update it every time a
phase completes or the plan changes — a future AI (or human) picking this up
cold should be able to read this one file and know exactly where to resume.

## Repos

- Backend: https://github.com/VasoyaParth/airlines-empire-backend (public)
- Frontend: https://github.com/VasoyaParth/airlines-empire-frontend (public)
- Both repos carry their own copy of this `context/` folder — keep them in
  sync when you update one.

## What this project is

A persistent, server-authoritative, online airline management simulation for
mobile — the "Airlines" sibling to an existing Truck Manager game the same
developer built. Full vision is in `01_GAME_DESIGN_DOCUMENT.md` (the user's
original, verbatim spec). This is a multi-month build; **do not attempt the
full GDD in one pass** — work phase by phase, per `03_ROADMAP.md`.

## Current stage: **Phase 2 in progress — Backend MVP done, Frontend scaffold done**

### Backend — done and verified

- Node.js + Express, Postgres (Aiven), deployable locally (`npm start`) or
  Vercel serverless (`api/index.js`).
- Schema: users, refresh_tokens, continents, countries, cities, airports,
  aircraft_models, plans, airlines, headquarters, **aircraft (now used)**,
  transactions.
- Seed: 52 countries, 95 airports (India full at 41, every other seeded
  country 1-2 real airports), 33 fictional aircraft models, 4 starter plans.
- Auth: signup/login/refresh (rotating)/logout/me. JWT + bcrypt.
- **Onboarding is now a 5-step wizard** (added a step since the last
  update): `profile -> country -> headquarters -> plan -> aircraft ->
  complete`. Step 5 grants ONE FREE starter aircraft (player picks from 4
  curated small regional/narrowbody models) — starts in `building` status
  with a 20-minute completion timer, per the GDD ("one free starter
  aircraft from multiple choices").
- **Fleet endpoints** (new): `GET /api/airlines/me/aircraft` (list, lazily
  flips `building` -> `parked` once the timer passes — no cron needed yet),
  `POST /api/airlines/me/aircraft` (purchase — validates HQ capacity +
  cash, deducts price, logs a transaction).
- Everything verified end-to-end against the live Aiven DB: full 5-step
  onboarding, starter aircraft grant, purchase success + insufficient-funds
  + HQ-capacity rejection paths.
- GitHub Actions CI (`backend/.github/workflows/ci.yml`) sanity-checks every
  module loads on push/PR. **Vercel's own GitHub integration is what
  actually deploys on push to main** — that needs a one-time manual link in
  the Vercel dashboard (Project Settings -> Git), which no agent can do
  without your Vercel login. Do that once, then every push to `main`
  auto-deploys.

### Frontend — scaffolded and working (not yet feature-complete)

`mobile/` is a real bare React Native 0.76.5 project (matching the Truck
Manager sibling app's RN version), UI language deliberately reused from
that app for visual consistency: `src/ui/theme.js`, `src/ui/components.js`
(Card/Btn/Pill/Sheet/Progress/etc — same premium dark-card, pill-button,
glass-panel aesthetic) copied and trimmed of truck-specific bits (no
`useEasterEggTap`, no game-store dependency). `src/engine/economy.js` kept
only its currency-formatting helpers (`inr`/`inrShort`) — the truck-specific
diesel/toll/fuel formulas were removed, since Airlines Empire computes all
money server-side, never client-side.

Built and Metro-bundle-verified:
- `src/services/api.js` — **the one file** every network call goes through
  (token storage/refresh included). Change `BASE_URL` here after deploying
  to Vercel — no other file needs to change.
- `src/store/session.js` — Zustand session store (auth state + cached
  airline row), NOT a local game-state store like the Truck Manager app has
  (this app is server-authoritative — every screen refetches from the API).
- `App.js` — bootstraps the session, routes to Auth -> Onboarding -> Home
  based on server state (resumes onboarding at the exact step the server
  says, every relaunch).
- `src/screens/AuthScreen.js` — login/signup.
- `src/screens/OnboardingScreen.js` — all 5 steps (profile, country, HQ,
  plan, starter aircraft), one component per step, driven entirely by
  `airline.onboarding_step`.
- `src/screens/HomeScreen.js` — full (non-abbreviated) cash header, pill
  profile capsule, bottom pill nav (Fleet/Routes/Economy/Staff/Rewards).
  Only **Fleet** is real; the other 4 tabs are labeled placeholders (see
  "what's not built" below) — this was a deliberate scope decision to ship
  one genuinely working tab rather than four half-built ones.
- `src/screens/FleetScreen.js` — **real**, two sub-tabs: "My Fleet" (owned
  aircraft, tap for a detail sheet showing status/build-progress/condition/
  specs) and "Buy Aircraft" (full catalog, search + type filter, real
  purchase against the backend, refreshes cash balance after buying).
- `src/ui/HQMap.js` — OpenStreetMap via Leaflet in a WebView, starts at a
  world view (per the GDD — "load the world map", not a zoomed HQ close-up)
  with proper OSM attribution, HQ marker with a popup, and a floating
  "recenter to HQ" button.

### What is explicitly NOT built yet (not oversights — deferred on purpose)

- **Settings/Notifications screens** — the header's gear icon currently
  just logs out as a placeholder. Build these next alongside whichever
  phase needs them first.
- **Aircraft flight timeline** (the 40+ phase realistic flight sim) and the
  **visual 3D-theater-style seat/cabin editor** — these are real, sizeable
  features (Phase 5 cabin editor, Phase 6 full flight sim per the roadmap),
  not something to bolt on halfway. The aircraft detail sheet today shows
  status/condition/specs only, with an honest note in the UI that the
  timeline/seat editor come later.
- Routes, Economy, Staff, Rewards tabs — mockup labels only.
- No WebSockets, no background job scheduler, no image upload (logo_key is
  a built-in icon reference; logo_url column reserved for Cloudinary).
- No automated test suite — verification so far is live manual curl runs
  (backend) and a Metro bundle build (frontend), both re-run after every
  meaningful change this session.

## Immediate next step

Two independent threads, pick whichever the user prioritizes next:

1. **Deploy**: link both repos in Vercel (backend) / decide on a mobile
   distribution path (the Truck Manager app ships APKs via GitHub Releases
   — decide if Airlines Empire follows the same pattern), verify the
   deployed backend URL, update `mobile/src/services/api.js`'s `BASE_URL`.
2. **Phase 3 depth**: aircraft customization (livery/registration/nickname
   — table already has the columns, no UI yet), HQ capacity upgrade flow,
   or start Phase 4 (routes + a first simplified flight state machine).

See `03_ROADMAP.md` for the full phase breakdown and `04_API_REFERENCE.md`
for exact request/response shapes (needs a small update for the new
`/onboarding/aircraft`, `/onboarding/starter-aircraft-choices`,
`/airlines/me/aircraft` GET+POST routes — do that before building against
them from scratch in a new session).
