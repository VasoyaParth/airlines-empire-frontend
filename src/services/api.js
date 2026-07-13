// ============================================================================
// THE ONE FILE that talks to the backend. Every network call in the app
// goes through here — when the backend URL changes (e.g. after the Vercel
// deploy), BASE_URL below is the only line that needs to change.
//
// Handles: token storage (AsyncStorage), attaching the access token to every
// authenticated call, and transparently refreshing an expired access token
// once before giving up and forcing a re-login.
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://airlines-empire-backend.vercel.app/api';

const KEYS = { access: 'ae_access_token', refresh: 'ae_refresh_token' };

async function getTokens() {
  const [access, refresh] = await Promise.all([
    AsyncStorage.getItem(KEYS.access),
    AsyncStorage.getItem(KEYS.refresh),
  ]);
  return { access, refresh };
}

async function setTokens({ accessToken, refreshToken }) {
  await Promise.all([
    accessToken ? AsyncStorage.setItem(KEYS.access, accessToken) : null,
    refreshToken ? AsyncStorage.setItem(KEYS.refresh, refreshToken) : null,
  ]);
}

async function clearTokens() {
  await Promise.all([AsyncStorage.removeItem(KEYS.access), AsyncStorage.removeItem(KEYS.refresh)]);
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let refreshInFlight = null;

async function refreshSession() {
  const { refresh } = await getTokens();
  if (!refresh) throw new ApiError(401, 'No refresh token');
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) { await clearTokens(); throw new ApiError(res.status, 'Refresh failed'); }
  const data = await res.json();
  await setTokens(data);
  return data.accessToken;
}

// Core request helper — auto-attaches the access token, retries exactly
// once through a token refresh on a 401, then gives up (caller should route
// to the login screen when this throws a 401 a second time).
async function request(path, { method = 'GET', body, auth = true, retried = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const { access } = await getTokens();
    if (access) headers.Authorization = `Bearer ${access}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !retried) {
    try {
      await refreshSession();
      return request(path, { method, body, auth, retried: true });
    } catch (e) {
      throw new ApiError(401, 'Session expired');
    }
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : null;
  if (!res.ok) throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
  return data;
}

// ---------- Auth ----------
export async function signup({ email, password, displayName }) {
  const data = await request('/auth/signup', { method: 'POST', body: { email, password, displayName }, auth: false });
  await setTokens(data);
  return data.user;
}

export async function login({ email, password }) {
  const data = await request('/auth/login', { method: 'POST', body: { email, password }, auth: false });
  await setTokens(data);
  return data.user;
}

export async function logout() {
  const { refresh } = await getTokens();
  try { if (refresh) await request('/auth/logout', { method: 'POST', body: { refreshToken: refresh }, auth: false }); } catch (e) { /* best effort */ }
  await clearTokens();
}

export async function hasSession() {
  const { access, refresh } = await getTokens();
  return !!(access || refresh);
}

export async function getMe() {
  const data = await request('/auth/me');
  return data.user;
}

// ---------- Onboarding ----------
export async function getOnboardingStatus() {
  const data = await request('/onboarding/status');
  return data.airline;
}
export async function saveProfile(payload) {
  const data = await request('/onboarding/profile', { method: 'PATCH', body: payload });
  return data.airline;
}
export async function saveCountry(countryCode) {
  const data = await request('/onboarding/country', { method: 'PATCH', body: { countryCode } });
  return data.airline;
}
export async function saveHeadquarters(airportId) {
  const data = await request('/onboarding/headquarters', { method: 'PATCH', body: { airportId } });
  return data.airline;
}
export async function savePlan(planCode) {
  const data = await request('/onboarding/plan', { method: 'PATCH', body: { planCode } });
  return data.airline;
}
export async function getStarterAircraftChoices() {
  const data = await request('/onboarding/starter-aircraft-choices');
  return data.models;
}
export async function saveStarterAircraft(modelId) {
  const data = await request('/onboarding/aircraft', { method: 'PATCH', body: { modelId } });
  return data.airline;
}

// ---------- Meta (public, no auth) ----------
export async function getCountries() {
  const data = await request('/meta/countries', { auth: false });
  return data.countries;
}
export async function getCountryAirports(code) {
  const data = await request(`/meta/countries/${code}/airports`, { auth: false });
  return data.airports;
}
export async function searchAirports(q) {
  const data = await request(`/meta/airports/search?q=${encodeURIComponent(q)}`, { auth: false });
  return data.airports;
}
export async function getAircraftModels(category) {
  const q = category ? `?category=${category}` : '';
  const data = await request(`/meta/aircraft-models${q}`, { auth: false });
  return data.aircraftModels;
}
export async function getPlans() {
  const data = await request('/meta/plans', { auth: false });
  return data.plans;
}

// ---------- Airline ----------
export async function getMyAirline() {
  const data = await request('/airlines/me');
  return data.airline;
}
export async function getMyTransactions(limit = 25) {
  const data = await request(`/airlines/me/transactions?limit=${limit}`);
  return data.transactions;
}
export async function getMyFleet() {
  const data = await request('/airlines/me/aircraft');
  return data.aircraft;
}
export async function buyAircraft(modelId) {
  const data = await request('/airlines/me/aircraft', { method: 'POST', body: { modelId } });
  return data.aircraft;
}

export { ApiError };
