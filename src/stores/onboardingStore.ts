import { create } from "zustand";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}

export interface KycData {
  profileType: "worker" | "employer" | "";
  kycDocument: File | null;
  kycDocumentPreview: string | null;
  kycSelfie: File | null;
  kycSelfiePreview: string | null;
}

interface OnboardingStore {
  personalInfo: PersonalInfo;
  kycData: KycData;
  isSubmitting: boolean;
  error: string | null;

  setPersonalInfo: (data: Partial<PersonalInfo>) => void;
  setKycData: (data: Partial<KycData>) => void;
  setIsSubmitting: (value: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
  hydrateFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = "onboarding-storage";

const initialState = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "+242",
    address: "",
    description: "",
  },
  kycData: {
    profileType: "" as const,
    kycDocument: null,
    kycDocumentPreview: null,
    kycSelfie: null,
    kycSelfiePreview: null,
  },
  isSubmitting: false,
  error: null,
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,

  setPersonalInfo: (data) => {
    set((state) => ({
      personalInfo: { ...state.personalInfo, ...data },
    }));
    get().saveToStorage();
  },

  setKycData: (data) => {
    set((state) => ({
      kycData: { ...state.kycData, ...data },
    }));
    get().saveToStorage();
  },

  setIsSubmitting: (value) => set({ isSubmitting: value }),

  setError: (error) => set({ error }),

  resetStore: () => {
    set(initialState);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  },

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          personalInfo: data.personalInfo || initialState.personalInfo,
          kycData: {
            ...initialState.kycData,
            profileType: data.kycData?.profileType || "",
            kycDocumentPreview: data.kycData?.kycDocumentPreview || null,
            kycSelfiePreview: data.kycData?.kycSelfiePreview || null,
            // Note: Files cannot be stored in sessionStorage
            // They need to be re-uploaded if user refreshes
          },
        });
      }
    } catch (error) {
      console.error("Failed to hydrate from storage:", error);
    }
  },

  saveToStorage: () => {
    if (typeof window === "undefined") return;

    try {
      const { personalInfo, kycData } = get();
      // Don't store File objects, only metadata
      const dataToStore = {
        personalInfo,
        kycData: {
          profileType: kycData.profileType,
          kycDocumentPreview: kycData.kycDocumentPreview,
          kycSelfiePreview: kycData.kycSelfiePreview,
          // File objects omitted
        },
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  },
}));
