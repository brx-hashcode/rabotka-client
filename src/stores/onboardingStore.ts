import { create } from "zustand";
import {
  saveKycFile,
  loadKycFiles,
  clearKycFile,
  clearKycFiles,
} from "@/lib/kyc-file-storage";

export type DocumentType = "IDENTITY_CARD" | "PASSPORT" | "DRIVER_LICENSE" | "BIRTH_CERTIFICATE" | "STUDENT_CARD" | "NIU_CARD" | "OTHER";

export type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  countryName: string;
  city: string;
  address: string;
  description: string;
};

export type KycData = {
  profileType: "WORKER" | "EMPLOYER" | "";
  categoryIds: string[];
  categoryNames: string[];
  documentType: DocumentType | "";
  kycDocument: File | null;
  kycDocumentPreview: string | null;
  kycDocumentUrl: string | null;
  kycSelfie: File | null;
  kycSelfiePreview: string | null;
  kycSelfieUrl: string | null;
};

type OnboardingStore = {
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
};

const STORAGE_KEY = "onboarding-storage";

const initialState = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "",
    countryName: "",
    city: "",
    address: "",
    description: "",
  },
  kycData: {
    profileType: "" as const,
    categoryIds: [] as string[],
    categoryNames: [] as string[],
    documentType: "" as const,
    kycDocument: null,
    kycDocumentPreview: null,
    kycDocumentUrl: null,
    kycSelfie: null,
    kycSelfiePreview: null,
    kycSelfieUrl: null,
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

    if (typeof globalThis === "undefined") return;

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
    if (typeof globalThis !== "undefined") {
      clearKycFiles().catch(console.error);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  },

  hydrateFromStorage: async () => {
    if (typeof globalThis === "undefined") return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          personalInfo: data.personalInfo || initialState.personalInfo,
          kycData: {
            ...initialState.kycData,
            profileType: data.kycData?.profileType || "",
            categoryIds: data.kycData?.categoryIds || [],
            categoryNames: data.kycData?.categoryNames || [],
            documentType: data.kycData?.documentType || "",
            kycDocumentUrl: data.kycData?.kycDocumentUrl || null,
            kycSelfieUrl: data.kycData?.kycSelfieUrl || null,
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
    if (typeof globalThis === "undefined") return;

    try {
      const { personalInfo, kycData } = get();
      const dataToStore = {
        personalInfo,
        kycData: {
          profileType: kycData.profileType,
          categoryIds: kycData.categoryIds,
          categoryNames: kycData.categoryNames,
          documentType: kycData.documentType,
          // Storage URLs are permanent — persist them so the uploaded files
          // survive a reload without re-uploading.
          kycDocumentUrl: kycData.kycDocumentUrl,
          kycSelfieUrl: kycData.kycSelfieUrl,
          // Blob previews are session-scoped and invalid after reload — omit them
          // so hydrateFromStorage regenerates fresh previews from IndexedDB.
        },
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  },
}));
