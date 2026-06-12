import { create } from "zustand";
import { generateCsrfToken } from "@/lib/api/index-controller";

type CsrfState = {
  token: string | null;
};

type CsrfActions = {
  setToken: (token: string | null) => void;
  getToken: () => string | null;
  fetchAndSetToken: () => Promise<void>;
  ensureFetch: () => Promise<void>;
};

type CsrfStore = CsrfState & CsrfActions;

export const useCsrfStore = create<CsrfStore>((set, get) => ({
  token: null,

  setToken: (token) => set({ token }),

  getToken: () => get().token,

  fetchAndSetToken: async () => {
    try {
      const response = await generateCsrfToken();
      set({ token: response.csrfToken });
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
      set({ token: null });
    }
  },

  ensureFetch: async () => {
    if (get().token !== null) return;
    await get().fetchAndSetToken();
  },
}));
