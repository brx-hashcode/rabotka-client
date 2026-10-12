import type { SignupVerification } from "@/lib/signup-verification";
import { create } from "zustand";
import {
  saveKycFile,
  loadKycFiles,
  clearKycFile,
  clearKycFiles,
} from "@/lib/kyc-file-storage";
import type { DocumentType } from "@/lib/kyc-document-types";
import {
  clearReferralAttribution,
  readReferralAttribution,
  type ReferralSource,
} from "@/lib/referral-attribution";

export type { DocumentType };

export type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Optional second number. Empty string when the person gave only one. */
  directPhone: string;
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
  // The storage key that goes with the url above. KYC files sit in a private
  // bucket now and are read back through signed urls; signing needs the key,
  // so it has to survive all the way to profile creation.
  kycDocumentKey: string | null;
  // Back of the document. Stays null for a PASSPORT, which has no back to
  // photograph — see requiresBackSide in @/lib/kyc-document-types.
  kycDocumentBack: File | null;
  kycDocumentBackPreview: string | null;
  kycDocumentBackUrl: string | null;
  kycDocumentBackKey: string | null;
  kycSelfie: File | null;
  kycSelfiePreview: string | null;
  kycSelfieUrl: string | null;
  kycSelfieKey: string | null;
};

type OnboardingStore = {
  personalInfo: PersonalInfo;
  kycData: KycData;
  /**
   * Parrainage code, entered on the confirmation screen or carried in from a
   * `?ref=` link. Top-level rather than inside `personalInfo`, because it is not
   * information about this person — it names a different profile, and the step-1
   * form and its zod schema have no business validating it.
   */
  referralCode: string;
  referralSource: ReferralSource;
  /**
   * The WhatsApp code check of the phone number (step 1). Required by the API
   * for the KYC uploads and the account creation; null until done, and again
   * once the number changes or the token expires.
   */
  signupVerification: SignupVerification | null;
  isSubmitting: boolean;
  error: string | null;

  setPersonalInfo: (data: Partial<PersonalInfo>) => void;
  setKycData: (data: Partial<KycData>) => void;
  setReferral: (code: string, source: ReferralSource) => void;
  setSignupVerification: (verification: SignupVerification | null) => void;
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
    directPhone: "",
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
    kycDocumentKey: null,
    kycDocumentBack: null,
    kycDocumentBackPreview: null,
    kycDocumentBackUrl: null,
    kycDocumentBackKey: null,
    kycSelfie: null,
    kycSelfiePreview: null,
    kycSelfieUrl: null,
    kycSelfieKey: null,
  },
  referralCode: "",
  referralSource: "MANUAL_CODE" as ReferralSource,
  signupVerification: null as SignupVerification | null,
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

    for (const key of ["kycDocument", "kycDocumentBack", "kycSelfie"] as const) {
      const file = data[key];
      if (file === undefined) continue;
      if (file) {
        saveKycFile(key, file).catch(console.error);
      } else {
        clearKycFile(key).catch(console.error);
      }
    }
  },

  setReferral: (code, source) => {
    set({ referralCode: code, referralSource: source });
    get().saveToStorage();
  },

  setSignupVerification: (verification) => {
    set({ signupVerification: verification });
    get().saveToStorage();
  },

  setIsSubmitting: (value) => set({ isSubmitting: value }),

  setError: (error) => set({ error }),

  resetStore: () => {
    set(initialState);
    if (typeof globalThis !== "undefined") {
      clearKycFiles().catch(console.error);
      sessionStorage.removeItem(STORAGE_KEY);
      // Also drop the captured `?ref=` attribution. Signup is the one moment we
      // know it has been used, and phones get shared here — leaving it would
      // credit the next person's parrainage to the previous person's parrain.
      clearReferralAttribution();
    }
  },

  hydrateFromStorage: async () => {
    if (typeof globalThis === "undefined") return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          referralCode: data.referralCode || "",
          referralSource: data.referralSource || "MANUAL_CODE",
          signupVerification: data.signupVerification ?? null,
          personalInfo: data.personalInfo || initialState.personalInfo,
          kycData: {
            ...initialState.kycData,
            profileType: data.kycData?.profileType || "",
            categoryIds: data.kycData?.categoryIds || [],
            categoryNames: data.kycData?.categoryNames || [],
            documentType: data.kycData?.documentType || "",
            kycDocumentUrl: data.kycData?.kycDocumentUrl || null,
            kycDocumentKey: data.kycData?.kycDocumentKey || null,
            kycDocumentBackUrl: data.kycData?.kycDocumentBackUrl || null,
            kycDocumentBackKey: data.kycData?.kycDocumentBackKey || null,
            kycSelfieUrl: data.kycData?.kycSelfieUrl || null,
            kycSelfieKey: data.kycData?.kycSelfieKey || null,
          },
        });
      }

      // A `?ref=` code captured on the landing page has not been typed into the
      // store yet, so seed it here. Only when the store has none: a code the
      // user typed by hand on the confirmation screen is their correction of
      // the link's, and must win over it.
      if (!get().referralCode) {
        const attribution = readReferralAttribution();
        if (attribution) {
          set({
            referralCode: attribution.code,
            referralSource: attribution.source,
          });
        }
      }

      const files = await loadKycFiles();
      if (files.kycDocument || files.kycDocumentBack || files.kycSelfie) {
        set((state) => ({
          kycData: {
            ...state.kycData,
            kycDocument: files.kycDocument ?? state.kycData.kycDocument,
            kycDocumentPreview: files.kycDocument
              ? URL.createObjectURL(files.kycDocument)
              : state.kycData.kycDocumentPreview,
            kycDocumentBack:
              files.kycDocumentBack ?? state.kycData.kycDocumentBack,
            kycDocumentBackPreview: files.kycDocumentBack
              ? URL.createObjectURL(files.kycDocumentBack)
              : state.kycData.kycDocumentBackPreview,
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
      const {
        personalInfo,
        kycData,
        referralCode,
        referralSource,
        signupVerification,
      } = get();
      const dataToStore = {
        personalInfo,
        referralCode,
        referralSource,
        // sessionStorage: this tab only, gone when it closes — and the token
        // dies within the hour anyway.
        signupVerification,
        kycData: {
          profileType: kycData.profileType,
          categoryIds: kycData.categoryIds,
          categoryNames: kycData.categoryNames,
          documentType: kycData.documentType,
          // Persisted so the uploaded files survive a reload without being
          // re-uploaded. The KEYS are the durable half: KYC urls are signed and
          // expire within the hour, so a reload after that leaves a url that no
          // longer resolves — the key is what still identifies the object.
          kycDocumentUrl: kycData.kycDocumentUrl,
          kycDocumentKey: kycData.kycDocumentKey,
          kycDocumentBackUrl: kycData.kycDocumentBackUrl,
          kycDocumentBackKey: kycData.kycDocumentBackKey,
          kycSelfieUrl: kycData.kycSelfieUrl,
          kycSelfieKey: kycData.kycSelfieKey,
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
