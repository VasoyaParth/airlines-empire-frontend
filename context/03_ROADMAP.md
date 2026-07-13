# Airlines Empire — Feature Roadmap (MVP -> v2 -> v3 -> v4)

Per the GDD author's own advice: build this in phases, never attempt the
whole GDD in one prompt. Each phase should ship a genuinely working,
verified slice before starting the next.

## Phase 1 — Backend MVP ✅ DONE (see 00_PROJECT_STATUS.md for exact state)

Auth, resumable onboarding, world data (countries/cities/airports seeded,
India full + rest 1-2 airports), aircraft model catalog (fictional, 33
models), starter plans, Vercel-deployable.

## Phase 2 — Frontend MVP (NEXT)

- React Native (TypeScript) app scaffold: navigation, Zustand store, one
  `services/api.ts` file for every backend call.
- Auth screens: signup, login.
- Onboarding wizard: profile -> country -> HQ airport -> plan, one screen
  per backend step, matching the resumable step exactly on app relaunch.
- Home screen: bottom tab bar mockup (Fleet / Routes / Economy / Staff /
  Rewards — same shape as the Truck Manager sibling app), header with full
  (non-abbreviated) cash balance, pill-shaped profile capsule.
- OpenStreetMap integration showing the player's HQ airport, with proper
  attribution/credit.
- Apple Liquid Glass-inspired visual language established here as the base
  design system for every later screen (see a future `06_DESIGN_SYSTEM.md`
  once this phase starts — don't write it speculatively before the first
  real screen exists).

## Phase 3 — First Aircraft & Fleet

- Aircraft purchase/lease flow (real money movement against `aircraft_models`
  and the airline's `cash_balance`, respecting HQ's `max_aircraft_capacity`).
- Fleet list screen, aircraft detail screen (static data only — no flights yet).
- Aircraft customization (livery colors, registration, nickname) — no cabin
  editor yet, that's Phase 5.

## Phase 4 — Routes & Basic Flights

- Route creation (search/select origin+destination airports, distance/time/
  fuel/profit estimate).
- A FIRST, simplified flight simulation: scheduled -> in-flight -> landed,
  with a background job progressing flight state over real time. NOT the
  full 40+ stage timeline yet — that's Phase 6.
- Transactions ledger extended to ticket revenue / fuel cost / airport fees.

## Phase 5 — Cabin Editor & Passengers

- Visual seat map editor (Economy/Premium/Business/First, the 2:1 and 4:1
  conversion rules).
- Passenger demand simulation tied to reputation/route popularity/season/
  price/aircraft quality — occupancy is never a flat 100%.

## Phase 6 — Full Flight Simulation & ATC

- The complete 40+ phase flight timeline from the GDD, realistic timing,
  live aircraft timeline screen.
- Flight physics (gradual accel/climb, the 50+ variation factors).
- ATC (pushback/taxi/runway/landing slot queuing, airport congestion).

## Phase 7 — Weather & Incidents

- Dynamic weather system affecting delays/fuel/happiness/routing.
- Incident system with player-chosen responses affecting reputation recovery.

## Phase 8 — Staff, HQ & Airport Upgrades

- Employee hiring/training (Level 1-5 skill cap), HQ level 1-5 upgrades,
  airport ownership + upgrades (Level 1-5 each) for airports the player owns.

## Phase 9 — Economy Depth & Banking

- Full daily/weekly/monthly/yearly P&L, loans (up to 70% of asset value,
  scaled by reputation/existing debt), aircraft/airport financing.

## Phase 10 — Multiplayer & Social

- Airline profiles (visit/compare/follow), partnerships (codeshare, shared
  lounges/airports, revenue sharing), leaderboards.
- This is where WebSockets become necessary (live aircraft positions,
  presence, real-time notifications) — introduce the socket layer here,
  not before it's needed.

## Phase 11 — News, Achievements, Mini-Games

- Global news network tied to real events (accidents, milestones, rankings).
- Achievement system (hundreds of tracks, per the GDD).
- Cosmetic-only mini-games (parking, ATC sequencing, baggage sorting,
  check-in rush, trivia) — explicitly no pay-to-win.

## Phase 12+ — Polish, Scale, Balance Pass

- Game economy balancing document (once there's enough real player data to
  balance against — don't guess numbers in a vacuum).
- Performance/scale hardening for "millions of players" (this is when
  Redis caching, read replicas, and a real background-job queue like BullMQ
  earn their complexity — not before).

---

**Rule for every future session**: before starting a phase, re-read
`00_PROJECT_STATUS.md`. Before ending a session, update it.
