const KEY = "cir_token";

export const tokenStorage = {
  get() { try { return localStorage.getItem(KEY); } catch { return null; } },
  set(token) { try { localStorage.setItem(KEY, token); } catch {} },
  clear() { try { localStorage.removeItem(KEY); } catch {} },
};
