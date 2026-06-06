import { RabotkaBaseController } from "./base-controller";
import { useCsrfStore } from "@/stores/csrf-store";
import { config } from "@/config";

export type CreateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  profileType: "WORKER" | "EMPLOYER" | "";
  categoryIds?: string[];
  documentType:
    | "IDENTITY_CARD"
    | "PASSPORT"
    | "DRIVER_LICENSE"
    | "BIRTH_CERTIFICATE"
    | "STUDENT_CARD"
    | "NIU_CARD"
    | "OTHER"
    | "";
  kycDocumentUrl: string;
  kycSelfieUrl: string;
  readAndApprovedPolicies: boolean;
};

export type CreateProfileResponse = {
  message: string;
  creditedBalance: number;
};

export type ProfileMeResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
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
  categoryIds?: string[];
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

export type ProfileApplicationItem = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  contractId: string | null;
  jobOffer: {
    id: string;
    title: string;
    scheduledAt: string;
    amount: number;
    address: string;
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

export class ProfileController extends RabotkaBaseController {
  /**
   * Pre-uploads a single KYC file (document or selfie) and returns its public
   * URL. Called per-file during onboarding step 3 so the final createProfile
   * request carries only URLs, not file bytes.
   */
  async uploadKycFile(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      return await this.post<{ url: string }>(
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

  async getPenalties(): Promise<ProfilePenaltyItem[]> {
    try {
      return await this.get<ProfilePenaltyItem[]>("/profile/penalties");
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

  async downloadAgreement(): Promise<Blob> {
    const token = useCsrfStore.getState().getToken();
    const headers: Record<string, string> = token ? { "x-csrf-token": token } : {};
    const response = await fetch(`${config.apiUrl}/profile/agreement/download`, {
      credentials: "include",
      headers,
    });
    if (!response.ok) throw new Error("Download failed");
    return response.blob();
  }

  async downloadContract(contractId: string): Promise<Blob> {
    const token = useCsrfStore.getState().getToken();
    const headers: Record<string, string> = token ? { "x-csrf-token": token } : {};
    const response = await fetch(`${config.apiUrl}/contracts/${contractId}/download`, {
      credentials: "include",
      headers,
    });
    if (!response.ok) throw new Error("Download failed");
    return response.blob();
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

  async downloadInvoice(invoiceId: string): Promise<Blob> {
    const token = useCsrfStore.getState().getToken();
    const headers: Record<string, string> = token ? { "x-csrf-token": token } : {};
    const response = await fetch(`${config.apiUrl}/invoices/${invoiceId}/download`, {
      credentials: "include",
      headers,
    });
    if (!response.ok) throw new Error("Download failed");
    return response.blob();
  }
}

export const {
  getMe,
  getPenalties,
  updateAvatar,
  updateProfile,
  createProfile,
  uploadKycFile,
  getApplications,
  downloadAgreement,
  downloadContract,
  getInvoices,
  downloadInvoice,
  markFirstLoginDone,
} = new ProfileController();
