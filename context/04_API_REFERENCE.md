# Airlines Empire — API Reference (Phase 1, as actually implemented)

Base URL: local `http://localhost:4000/api`, production = wherever Vercel
deploys it (update this line once deployed, and update
`mobile/src/services/api.ts`'s `BASE_URL` to match — that's the ONLY file
the frontend needs to touch when the backend URL changes).

All request/response bodies are JSON. Authenticated routes require header:
`Authorization: Bearer <accessToken>`.

## Auth — `/api/auth`

### POST `/signup`
Body: `{ email, password, displayName? }` (password min 8 chars)
201 → `{ user: {id,email,display_name,created_at}, accessToken, refreshToken }`
Also creates an empty airline row for this user (`onboarding_step: 'profile'`).
409 if email already registered.

### POST `/login`
Body: `{ email, password }`
200 → `{ user, accessToken, refreshToken }`
401 for wrong email/password (deliberately identical error for both cases).

### POST `/refresh`
Body: `{ refreshToken }`
200 → `{ accessToken, refreshToken }` — **the refresh token ROTATES on every
call**; the old one is immediately revoked, store the new one and discard
the old.
401 if invalid/expired/already-used.

### POST `/logout`
Body: `{ refreshToken }` → 204. Revokes that refresh token.

### GET `/me` (auth required)
200 → `{ user: {id,email,display_name,created_at,last_login_at} }`

## Onboarding — `/api/onboarding` (all require auth)

Driven by `airlines.onboarding_step`, one of: `profile -> country ->
headquarters -> plan -> complete`. Each PATCH below advances exactly one
step and 409s if called out of order or after completion. **On app
relaunch, call GET /status first and route the user to whichever step
`airline.onboarding_step` says — never restart the wizard from scratch.**

### GET `/status`
200 → `{ airline: <full airline row, see shape below> }`

### PATCH `/profile`
Body: `{ name, slogan?, primaryColor: "#RRGGBB", secondaryColor: "#RRGGBB", logoKey }`
(logoKey is a built-in icon identifier string, e.g. `"airplane-1"` — no
image upload yet, that's later with Cloudinary.)
200 → `{ airline }` with `onboarding_step: 'country'`

### PATCH `/country`
Body: `{ countryCode: "IN" }` (ISO alpha-2, any seeded country — home
country selection is NOT gated by `unlocked_by_default`, that flag is for
unlocking OTHER countries to fly to later, not your own HQ country)
200 → `{ airline }` with `onboarding_step: 'headquarters'`

### PATCH `/headquarters`
Body: `{ airportId: <number> }` — must belong to the country chosen in the
previous step (400 if not). Creates the `headquarters` row (Level 1, 10
aircraft cap, 25 employee cap) in the same transaction.
200 → `{ airline }` with `onboarding_step: 'plan'`

### PATCH `/plan`
Body: `{ planCode: "regional_starter" | "national_carrier" | "international_hub" | "flagship_launch" }`
(see GET `/api/meta/plans` for the live list — don't hard-code these in the
client beyond a fallback, fetch them.)
Server computes `cash_balance = STARTER_GRANT (₹50 Cr) − plan.cost`, sets
`reputation`/`premium_currency` from the plan, logs 2 transactions
(`starter_grant` +50Cr, `plan_cost` −cost), marks onboarding complete.
200 → `{ airline }` with `onboarding_step: 'complete'`, `onboarding_completed_at` set.

### Airline row shape (returned by all onboarding endpoints)
```json
{
  "id": "uuid", "user_id": "uuid",
  "name": "string|null", "slogan": "string|null",
  "primary_color": "#RRGGBB|null", "secondary_color": "#RRGGBB|null",
  "logo_key": "string|null", "logo_url": "string|null",
  "country_id": "number|null", "hq_airport_id": "number|null", "plan_id": "number|null",
  "cash_balance": "string (bigint)", "premium_currency": 0, "reputation": 50, "hq_level": 1,
  "onboarding_step": "profile|country|headquarters|plan|complete",
  "onboarding_completed_at": "ISO datetime|null",
  "created_at": "ISO datetime", "updated_at": "ISO datetime"
}
```
Note: `cash_balance` comes back as a JSON string (Postgres BIGINT → JS
string via `pg`, to avoid precision loss) — parse with `BigInt(...)` or a
big-number lib on the client, not plain `Number()` for anything near the
edges of safe integer range (unlikely at these amounts, but be consistent).

## Meta / lookup — `/api/meta` (public, no auth needed)

### GET `/countries`
200 → `{ countries: [{ id, code, name, continent_code, continent_name,
currency_code, unlocked_by_default, unlock_cost, airport_count }] }`
Sorted: unlocked-by-default first (currently only India), then alphabetical.

### GET `/countries/:code/airports`
200 → `{ airports: [{ id, iata_code, icao_code, name, lat, lng, size_tier,
runway_count, city_id, city_name, is_capital }] }`

### GET `/airports/search?q=<text>`
Matches airport name, city name, IATA code, or country name (ILIKE, min 2
chars). 200 → `{ airports: [{..., country_code, country_name}] }`, max 30.

### GET `/aircraft-models?category=passenger|cargo` (category optional)
200 → `{ aircraftModels: [<full aircraft_models row>] }`

### GET `/plans`
200 → `{ plans: [<full plans row>] }`, ordered by `sort_order`.

## Airline — `/api/airlines` (all require auth)

### GET `/me`
The one call the home screen needs — airline + country + HQ airport + HQ
building level/caps + plan, fully joined.
200 → see the exact joined shape in `src/routes/airline.routes.js` (field
names are self-descriptive: `hq_iata`, `hq_city_name`, `plan_code`, etc.)
404 if airline not found (shouldn't happen for any signed-up user).

### GET `/me/transactions?limit=<1-100, default 25>`
200 → `{ transactions: [{ id, type, amount, balance_after, description, created_at }] }`

## Error shape (all routes)

```json
{ "error": "human-readable message" }
```
Plus `"stack"` when `NODE_ENV !== 'production'`. HTTP status carries the
meaning (400 validation, 401 auth, 404 not found, 409 conflict, 429 rate
limited, 500 server error) — don't parse the message string for logic.

## Addendum — added after the initial API reference was written

### Onboarding now has a 5th step: `aircraft`

Order is now `profile -> country -> headquarters -> plan -> aircraft ->
complete`.

#### GET `/api/onboarding/starter-aircraft-choices` (auth required)
200 → `{ models: [<aircraft_models rows>] }` — always the same curated set
of 4 small regional/narrowbody models (HA-50, HA-70, MC-120, VR-40).

#### PATCH `/api/onboarding/aircraft`
Body: `{ modelId: <number> }` — must be one of the starter choices above.
Free (already covered by the plan). Creates the aircraft row (`status:
'building'`, `build_completes_at: now + 20 minutes`), marks onboarding
`complete`.
200 → `{ airline, buildMinutes: 20 }`

### Fleet — `/api/airlines/me/aircraft` (auth required)

#### GET
Lazily flips any `building` aircraft whose timer has passed to `parked`
before returning. 200 → `{ aircraft: [{ id, registration, nickname, status,
condition_engine, condition_airframe, condition_cabin, purchase_price,
current_value, build_completes_at, purchased_at, manufacturer, model,
category, aircraft_type, passenger_capacity, cargo_capacity_kg,
max_range_km }] }`

#### POST
Body: `{ modelId: <number> }`. Validates HQ's `max_aircraft_capacity`
isn't exceeded and the airline can afford `aircraft_models.purchase_price`;
deducts cash, logs an `aircraft_purchase` transaction, creates the aircraft
(`status: 'building'`, 20-min timer). 201 → `{ aircraft }`.
400 insufficient funds. 409 fleet at capacity / onboarding incomplete.
