# Airlines Empire — Database Schema (Phase 1, as actually migrated)

Real schema, not the 200-300 table GDD aspiration — that grows one phase at
a time. Migrations live in `backend/src/db/migrations/*.sql`, applied in
filename order, tracked in `schema_migrations`. **Never edit a migration
file that has already run anywhere (including just your local Aiven DB) —
add a new numbered migration instead.**

| Table | Purpose | Key columns |
|---|---|---|
| `users` | Login identity | email (unique), password_hash (bcrypt) |
| `refresh_tokens` | Rotating session tokens | token_hash (SHA-256 of opaque token, never the raw token), revoked_at, replaced_by |
| `continents` | 6 rows, seeded | code, name |
| `countries` | 52 seeded | code (ISO2), continent_id, unlocked_by_default (only India=true), unlock_cost |
| `cities` | 95 seeded | country_id, lat/lng, population, is_capital |
| `airports` | 95 seeded (41 India + 54 across 51 other countries) | city_id, country_id, iata_code (unique), icao_code (unique), size_tier (1=mega hub..5=tiny) |
| `aircraft_models` | 33 seeded, fictional manufacturers | category ('passenger'\|'cargo'), aircraft_type ('regional'\|'narrowbody'\|'widebody'\|'cargo'), full performance spec columns |
| `plans` | 4 seeded starter plans | code, cost (deducted from the flat 50Cr starter grant), starting_reputation, starting_premium_currency |
| `airlines` | One row per user (1:1, created at signup) | user_id (unique FK), onboarding_step, cash_balance, reputation, plan_id, hq_airport_id |
| `headquarters` | One row per airline (1:1, created at onboarding step 3) | airline_id (unique FK), airport_id, level (1-5), max_aircraft_capacity, max_employee_capacity |
| `aircraft` | Empty — no purchase flow yet (Phase 3) | airline_id, model_id, registration, condition_* columns, status |
| `transactions` | Append-only money ledger | airline_id, type, amount (signed), balance_after, description |
| `schema_migrations` | Migration bookkeeping | filename (PK), applied_at |

## Conventions to keep as the schema grows

- **UUIDs** (`gen_random_uuid()`, via `pgcrypto`) for anything player-facing
  and potentially exposed in URLs (users, airlines, aircraft, transactions).
  **SERIAL ints** for seeded reference/lookup data (countries, cities,
  airports, aircraft_models, plans) — they're never player-created, and int
  FKs keep join queries cheap once flights/routes reference airports a lot.
- **Money as BIGINT**, always integer rupees, never floating point. Same
  convention as the sibling Truck Manager project.
- **Every multi-step write goes through `withTransaction()`** (`db/pool.js`)
  — see `onboarding.routes.js`'s `/headquarters` and `/plan` handlers for
  the pattern. A partial write (e.g. cash deducted but airline row not
  updated) must never be possible.
- **Seed data files are the source of truth**, not manual SQL inserts — add
  a new country/airport by editing the relevant file in
  `backend/src/db/seed/data/` and re-running `npm run seed` (idempotent,
  upserts by natural key — country `code`, airport `iata_code`, aircraft
  `(manufacturer, model)`, plan `code`).
- **New tables → new numbered migration file**, never retrofit an old one.
