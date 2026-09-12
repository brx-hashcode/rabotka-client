import type { EmploymentTypeValue } from "@/lib/employment-type";
import type { DocumentType } from "@/lib/kyc-document-types";
import { RabotkaBaseController } from "./base-controller";
import { config } from "@/config";

export type CreateProfilePayload = {
  firstName: string;
  lastName: string;
  /**
   * Optional: most of the informal sector signs up with a phone and no email.
   * `phone` is the identity signup proves, and every notification goes there.
   * Omitted rather than sent empty — see the note in `use-onboarding-mutation`.
   */
  email?: string;
  phone: string;
  /**
   * Optional second number to be reached on, when the WhatsApp number is not
   * one the person answers calls on. Omitted when they gave only one.
   */
  directPhone?: string;
  countryCode: string;
  countryName: string;
  city: string;
  address: string;
  description: string;
  profileType: "WORKER" | "EMPLOYER" | "";
  categoryIds?: string[];
  documentType: DocumentType | "";
  kycDocumentUrl: string;
  // Omitted for a PASSPORT, which has no back to photograph. The backend
  // discards it if sent alongside one.
  kycDocumentBackUrl?: string;
  kycSelfieUrl: string;
  // Storage keys returned alongside the urls above. Optional because the
  // backend still accepts profiles without them — a client that predates this
  // change keeps working, and its rows get picked up by the backfill.
  kycDocumentKey?: string;
  kycDocumentBackKey?: string;
  kycSelfieKey?: string;
  readAndApprovedPolicies: boolean;
  // Parrainage. Omitted entirely when the user answered "non" or left the field
  // empty — the backend treats an unknown code as no code, but sending a blank
  // one would still record a source we never actually observed.
  referralCode?: string;
  referralSource?: "LINK" | "MANUAL_CODE";
};

export type CreateProfileResponse = {
  message: string;
  creditedBalance: number;
};

export type ProfileMeResponse = {
  id: string;
  firstName: string;
  lastName: string;
  /** Null for the majority, who sign up with a phone and no email. */
  email: string | null;
  phone: string;
  /** Optional second number. Null for the majority who gave only one. */
  directPhone: string | null;
  address: string;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  description: string;
  profileType: "WORKER" | "EMPLOYER";
  status: "PENDING_ACTIVATION" | "ACTIVE" | "SUSPENDED" | "BANNED";
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  reliabilityScore: number | null;
  whatsappConnected: boolean;
  avatarUrl: string | null;
  firstLogin: boolean;
  createdAt: string;
  jobOffersCount: number;
  applicationsCount: number;
  penaltiesCount: number;
  unpaidPenaltiesCount: number;
  walletBalance: number;
  categoryIds: string[];
  categoryNames: string[];
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  description?: string;
  address?: string;
  countryCode?: string;
  countryName?: string;
  city?: string;
  categoryIds?: string[];
  /**
   * Optional second number. Send "" to clear it.
   *
   * Editable here, unlike the WhatsApp number: nothing authenticates against a
   * direct line, so it changes like an address does. Changing the WhatsApp
   * number goes through `requestPhoneChange` / `confirmPhoneChange` instead,
   * because it is the login identity.
   */
  directPhone?: string;
  /**
   * Optional, and editable here for the same reason `directPhone` is: nothing
   * authenticates against it. Email is optional at signup, so this is how
   * someone adds one later or drops one that has gone stale. Send "" to clear.
   */
  email?: string;
};

export type UpdateAvatarResponse = {
  avatarUrl: string;
};

export type ProfilePenaltyItem = {
  id: string;
  amount: number;
  reason: string | null;
  appliedAt: string;
  paidAt: string | null;
  applicationId: string;
  jobOfferTitle?: string;
};

export type PenaltiesDue = {
  count: number;
  totalAmount: number;
  walletBalance: number;
};

export type ProfileApplicationItem = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  contractId: string | null;
  jobOffer: {
    id: string;
    title: string;
    /** Null for a CDI, CDD or stage — only a mission has a closing date. */
    scheduledAt: string | null;
    employmentType: EmploymentTypeValue;
    /** Null when the employer named no price — rendered as «À négocier». */
    amount: number | null;
    /** Null for a remote job — read through jobLocationLabel, not directly. */
    address: string | null;
    isRemote: boolean;
    city: string | null;
    countryName: string | null;
    status: string;
  };
};

export type ProfileApplicationsResponse = {
  data: ProfileApplicationItem[];
  total: number;
  page: number;
  limit: number;
};

export type InvoiceItem = {
  id: string;
  amount: string;
  reason: "CONTACT_UNLOCK" | "PENALTY" | "OTHER";
  status: "PENDING_DOWNLOAD" | "DOWNLOADED";
  createdAt: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
};

export type ContactedProfile = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  description: string;
  address: string;
  categories: string[];
  reliabilityScore: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  portfolioSlug: string | null;
  phone: string;
  /**
   * Null when the worker has no email — the phone is what the payment really
   * bought, and it is never null.
   */
  email: string | null;
  origin: "RECOMMENDATION" | "MISSION";
  unlockedAt: string;
  jobTitle: string | null;
};

class ProfileController extends RabotkaBaseController {
  /**
   * Pre-uploads a single KYC file (document or selfie) and returns its public
   * URL. Called per-file during onboarding step 3 so the final createProfile
   * request carries only URLs, not file bytes.
   */
  /**
   * The `key` is what makes the file readable later. KYC documents now live in
   * a private bucket and are served through signed urls that expire after an
   * hour, so the admin has to re-sign on every view — and signing needs the
   * object key. The endpoint used to return only `url`, which is why
   * `storage_key` was NULL on every KYC row ever written.
   */
  async uploadKycFile(file: File): Promise<{ url: string; key: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      return await this.post<{ url: string; key: string }>(
        "/profile/kyc-upload",
        formData as unknown as Record<string, unknown>,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async createProfile(
    data: CreateProfilePayload,
  ): Promise<CreateProfileResponse> {
    try {
      return await this.post<CreateProfileResponse>(
        "/profile",
        data as unknown as Record<string, unknown>,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMe(): Promise<ProfileMeResponse> {
    try {
      return await this.get<ProfileMeResponse>("/profile/me");
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * `getMe` with the failure left intact.
   *
   * This call doubles as the session check, and telling "signed out" apart from
   * "the network dropped" decides whether the app redirects to /login or simply
   * retries. `handleError` rethrows every ApiError as a bare `Error`, dropping
   * the status code, so skipping it is the only way to keep that distinction —
   * see `isUnauthorized` in ./errors. Success is byte-identical to `getMe`.
   */
  getMeRaw(): Promise<ProfileMeResponse> {
    return this.get<ProfileMeResponse>("/profile/me");
  }

  async getPenalties(): Promise<ProfilePenaltyItem[]> {
    try {
      return await this.get<ProfilePenaltyItem[]>("/profile/penalties");
    } catch (error) {
      this.handleError(error);
    }
  }

  // What the payment-method chooser needs: amount owed + wallet balance.
  async getPenaltiesDue(): Promise<PenaltiesDue> {
    try {
      return await this.get<PenaltiesDue>("/profile/penalties/due");
    } catch (error) {
      this.handleError(error);
    }
  }

  // Settles all unpaid penalties from the profile's wallet balance.
  async payPenaltiesWithWallet(): Promise<{
    paidCount: number;
    totalAmount: number;
    reference: string;
  }> {
    try {
      return await this.post<{
        paidCount: number;
        totalAmount: number;
        reference: string;
      }>("/profile/penalties/pay/wallet", {});
    } catch (error) {
      this.handleError(error);
    }
  }

  // Starts a Mobile Money payment for ALL unpaid penalties; returns the token
  // that drives the shared /pay/:token screen (same one used for top-ups).
  async payPenaltiesWithMobile(): Promise<{ token: string }> {
    try {
      return await this.post<{ token: string }>(
        "/profile/penalties/pay/link",
        {},
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getApplications(
    page: number = 1,
    limit: number = 10,
  ): Promise<ProfileApplicationsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    try {
      return await this.get<ProfileApplicationsResponse>(
        `/profile/applications?${params.toString()}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Step 1 of changing the WhatsApp number: send a code to the NEW handset.
   *
   * Writes nothing yet. The number is the login identity, so it only moves once
   * the code comes back — a typo committed straight away would send every
   * future login link to a number the user does not own.
   */
  async requestPhoneChange(newPhone: string): Promise<{ success: boolean }> {
    try {
      return await this.post<{ success: boolean }>("/profile/phone-change/request", {
        newPhone,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /** Step 2: hand back the code and commit the switch. */
  async confirmPhoneChange(
    code: string,
  ): Promise<{ success: boolean; phone: string }> {
    try {
      return await this.post<{ success: boolean; phone: string }>(
        "/profile/phone-change/confirm",
        { code },
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProfile(data: UpdateProfilePayload): Promise<ProfileMeResponse> {
    try {
      return await this.patch<ProfileMeResponse>(
        "/profile",
        data as Record<string, unknown>,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateAvatar(file: File): Promise<UpdateAvatarResponse> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      return await this.post<UpdateAvatarResponse>("/profile/avatar", formData);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Absolute URL of the platform agreement PDF.
   *
   * These download endpoints return a URL rather than a Blob on purpose.
   * Android WebView — which is what WhatsApp's in-app browser uses — cannot
   * resolve `blob:` URLs for download at all: its DownloadManager only gets
   * the placeholder URL, never the bytes, so the save silently fails. Handing
   * the browser a real HTTP URL (ideally via a genuine <a href> click) is the
   * only thing that can work there.
   *
   * No auth plumbing is needed: the endpoint is a GET, the CSRF guard ignores
   * GET/HEAD/OPTIONS, and the session cookie is SameSite=None in production —
   * so it rides along on a plain top-level navigation.
   */
  agreementDownloadUrl(): string {
    return `${config.apiUrl}/profile/agreement/download`;
  }

  /** Absolute URL of the profile's resume/CV PDF. See agreementDownloadUrl(). */
  resumeDownloadUrl(): string {
    return `${config.apiUrl}/profile/resume/download`;
  }

  /** Absolute URL of a signed work contract PDF. See agreementDownloadUrl(). */
  contractDownloadUrl(contractId: string): string {
    return `${config.apiUrl}/contracts/${encodeURIComponent(contractId)}/download`;
  }

  async markFirstLoginDone(): Promise<{ success: boolean }> {
    try {
      return await this.patch<{ success: boolean }>(
        "/profile/me/first-login-done",
        {},
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getInvoices(): Promise<InvoiceItem[]> {
    try {
      return await this.get<InvoiceItem[]>("/invoices");
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Everyone this recruiter has paid to reach — with the phone and email the
   * payment bought, which otherwise only ever existed in a WhatsApp message.
   */
  async getContactedProfiles(): Promise<ContactedProfile[]> {
    try {
      return await this.get<ContactedProfile[]>("/profile/contacts");
    } catch (error) {
      this.handleError(error);
    }
  }

  /** Absolute URL of an invoice PDF. See agreementDownloadUrl(). */
  invoiceDownloadUrl(invoiceId: string): string {
    return `${config.apiUrl}/invoices/${encodeURIComponent(invoiceId)}/download`;
  }
}

export const {
  getMe,
  getMeRaw,
  getPenalties,
  getPenaltiesDue,
  payPenaltiesWithWallet,
  payPenaltiesWithMobile,
  updateAvatar,
  updateProfile,
  requestPhoneChange,
  confirmPhoneChange,
  createProfile,
  uploadKycFile,
  getApplications,
  agreementDownloadUrl,
  resumeDownloadUrl,
  contractDownloadUrl,
  getInvoices,
  getContactedProfiles,
  invoiceDownloadUrl,
  markFirstLoginDone,
} = new ProfileController();
