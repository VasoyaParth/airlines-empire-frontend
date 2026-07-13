// Session store — who's logged in and what their airline looks like. This
// is NOT a local game-state store like the Truck Manager sibling app has;
// Airlines Empire is server-authoritative, so this just caches the last
// server response for fast UI renders and refetches after every mutation.
import { create } from 'zustand';
import * as api from '../services/api';

export const useSession = create((set, get) => ({
  bootstrapped: false,   // has the initial "do we have a token?" check run yet
  isAuthenticated: false,
  user: null,
  airline: null,         // full onboarding/airline row from the server

  async bootstrap() {
    const has = await api.hasSession();
    if (!has) { set({ bootstrapped: true, isAuthenticated: false }); return; }
    try {
      const [user, airline] = await Promise.all([api.getMe(), api.getOnboardingStatus()]);
      set({ bootstrapped: true, isAuthenticated: true, user, airline });
    } catch (e) {
      set({ bootstrapped: true, isAuthenticated: false, user: null, airline: null });
    }
  },

  async signup(payload) {
    const user = await api.signup(payload);
    const airline = await api.getOnboardingStatus();
    set({ isAuthenticated: true, user, airline });
    return airline;
  },

  async login(payload) {
    const user = await api.login(payload);
    const airline = await api.getOnboardingStatus();
    set({ isAuthenticated: true, user, airline });
    return airline;
  },

  async logout() {
    await api.logout();
    set({ isAuthenticated: false, user: null, airline: null });
  },

  async refreshAirlineStatus() {
    const airline = await api.getOnboardingStatus();
    set({ airline });
    return airline;
  },

  // Called once onboarding_step === 'complete' — swaps to the fully joined
  // /airlines/me shape (country/HQ/plan names, not just ids) for the home screen.
  async loadFullAirline() {
    const airline = await api.getMyAirline();
    set({ airline });
    return airline;
  },
}));
