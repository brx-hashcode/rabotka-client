import { create } from "zustand";
import {
  saveKycFile,
  loadKycFiles,
  clearKycFile,
  clearKycFiles,
} from "@/lib/kyc-file-storage";

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
  hydrateFromStorage: () => Promise<void>;
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

    if (typeof window === "undefined") return;

    if (data.kycDocument !== undefined) {
      if (data.kycDocument) {
        saveKycFile("kycDocument", data.kycDocument).catch(console.error);
      } else {
        clearKycFile("kycDocument").catch(console.error);
      }
    }
    if (data.kycSelfie !== undefined) {
      if (data.kycSelfie) {
        saveKycFile("kycSelfie", data.kycSelfie).catch(console.error);
      } else {
        clearKycFile("kycSelfie").catch(console.error);
      }
    }
  },

  setIsSubmitting: (value) => set({ isSubmitting: value }),

  setError: (error) => set({ error }),

  resetStore: () => {
    set(initialState);
    if (typeof window !== "undefined") {
      clearKycFiles().catch(console.error);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  },

  hydrateFromStorage: async () => {
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
          },
        });
      }

      const files = await loadKycFiles();
      if (files.kycDocument || files.kycSelfie) {
        set((state) => ({
          kycData: {
            ...state.kycData,
            kycDocument: files.kycDocument ?? state.kycData.kycDocument,
            kycDocumentPreview: files.kycDocument
              ? URL.createObjectURL(files.kycDocument)
              : state.kycData.kycDocumentPreview,
            kycSelfie: files.kycSelfie ?? state.kycData.kycSelfie,
            kycSelfiePreview: files.kycSelfie
              ? URL.createObjectURL(files.kycSelfie)
              : state.kycData.kycSelfiePreview,
          },
        }));
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
