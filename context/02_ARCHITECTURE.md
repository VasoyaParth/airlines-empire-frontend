# Airlines Empire — Technical Architecture (as actually built, Phase 1)

This describes what's real today, not aspirational. Update it as later
phases add WebSockets, workers, caching, etc.

## Repo layout

```
AirlinesEmpire/
  context/            <- you are here. Read 00_PROJECT_STATUS.md first.
  backend/             <- Node.js/Express API (this is what's built)
    api/index.js        <- Vercel serverless entrypoint
    src/
      app.js             <- Express app assembly (middleware + route mounting)
      server.js           <- local/traditional-host entrypoint (npm start)
      db/
        pool.js            <- single shared pg Pool, TLS handling for Aiven
        migrate.js          <- runs migrations/*.sql in order, tracked in schema_migrations
        migrations/         <- numbered .sql files, never edit one after it has run anywhere
        seed/
          index.js           <- idempotent seed runner (safe every boot)
          data/               <- plain JS data files (continents, countries, india, other_countries, aircraft_models, plans)
      middleware/
        auth.js             <- requireAuth: verifies JWT, sets req.userId
        errorHandler.js     <- HttpError class + centralized JSON error responses
      utils/
        jwt.js               <- access token sign/verify, refresh token gen/hash
        password.js          <- bcrypt hash/verify
        asyncHandler.js      <- wraps async route handlers for error propagation
      routes/
        auth.routes.js       <- signup/login/refresh/logout/me
        onboarding.routes.js <- the 4-step resumable wizard
        meta.routes.js       <- public lookup data (countries/airports/aircraft/plans)
        airline.routes.js    <- /airlines/me (full joined profile), /airlines/me/transactions
    .env                  <- real secrets, gitignored, never commit
    .env.example          <- template, safe to commit
    vercel.json           <- routes everything to api/index.js
  mobile/               <- React Native app (not created yet as of this writing)
```

## Backend stack

- **Runtime**: Node.js, plain Express (no framework magic) — chosen over
  Fastify for simplicity; revisit only if profiling shows a real need.
- **Database**: Aiven-managed Postgres. Connection via `pg` (node-postgres),
  raw SQL (no ORM) — the schema is still small enough that hand-written SQL
  is more transparent than fighting an ORM's abstractions. Revisit if the
  schema grows past ~40-50 tables (v2+, once flights/routes/employees land).
- **Auth**: JWT access tokens (15 min, `JWT_ACCESS_SECRET`) + opaque hashed
  rotating refresh tokens stored in `refresh_tokens` (30 day,
  `JWT_REFRESH_SECRET`). Passwords hashed with bcrypt (12 rounds).
- **Validation**: `zod` schemas inline in each route file — no separate
  validators/ folder yet; split out once route files get unwieldy.
- **Deploy target**: Vercel serverless functions. `api/index.js` lazily runs
  migrate+seed once per warm container (module-scope singleton promise) —
  every migration/seed statement is idempotent (`IF NOT EXISTS` /
  `ON CONFLICT`), so even a race between two cold containers is harmless.
- **Rate limiting**: `express-rate-limit`, tighter on `/api/auth/*` (20 req /
  15 min) than the blanket `/api` limit (120 req/min).
- **Security headers**: `helmet`. CORS locked via `CORS_ORIGINS` env var
  (comma-separated, `*` allowed for dev).

## Why raw SQL + pg instead of Prisma/Drizzle/TypeORM

Speed of iteration during the earliest phase, and because the eventual
schema (200+ tables per the GDD) will likely need hand-tuned indexes and
non-trivial joins (route pathfinding, flight timelines) that an ORM tends
to fight rather than help with. If this becomes painful, Drizzle is the
most likely migration target (it's closest to "just SQL with types").

## Server-authoritative principle (non-negotiable, per the GDD)

Every route that changes money, reputation, or game state computes the
result SERVER-SIDE from data already in the database — the client sends an
*intent* (e.g. "I want plan X"), never a *result* (never "set my cash to
Y"). This is why `onboarding.routes.js` looks up the plan's cost from the
`plans` table rather than trusting anything the client sends about price.
Keep this pattern for every future feature (aircraft purchase, flights,
route creation, everything).

## Money & units

All currency amounts are stored as `BIGINT` integer rupees (no paise/cents
subunit) — same convention as the sibling Truck Manager project. The
starter grant is a flat 500,000,000 (₹50 Cr), defined once in
`src/db/seed/data/plans.js` as `STARTER_GRANT` and imported wherever it's
needed (never hard-coded a second time).

## What's deliberately deferred (not architectural gaps, just not built yet)

- WebSockets / real-time sync — needed once flights/live-aircraft-position
  exist (Phase 2+). No socket server exists yet.
- Redis / caching layer — premature at current scale; add when a specific
  slow query justifies it (mentioned as "optional" in the GDD too).
- Background job scheduler (for flight-phase progression, aircraft aging,
  etc.) — needed starting Phase 2 (flights). Likely `node-cron` or a proper
  queue (BullMQ + Redis) once flight simulation exists; decide when we get there.
- Image upload (Cloudinary) — `airlines.logo_url` column exists and is
  reserved; `logo_key` (a built-in icon reference) is what onboarding
  actually uses today, per the user's explicit instruction to defer custom
  image upload.
