const KEY = "cir_token";

export const tokenStorage = {
  get(): string | null {
    try { return localStorage.getItem(KEY); } catch { return null; }
  },
  set(v: string | null) {
    try {
      if (!v) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, v);
    } catch {}
  }
};
