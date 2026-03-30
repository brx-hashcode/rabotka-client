import { RabotkaBaseController } from "./base-controller";

export type CreateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  profileType: "WORKER" | "EMPLOYER" | "";
  documentType:
    | "IDENTITY_CARD"
    | "PASSPORT"
    | "DRIVER_LICENSE"
    | "BIRTH_CERTIFICATE"
    | "STUDENT_CARD"
    | "NIU_CARD"
    | "OTHER"
    | "";
  kycDocument: File;
  kycSelfie: File;
};

export type CreateProfileResponse = {
  message: string;
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
  createdAt: string;
  jobOffersCount: number;
  applicationsCount: number;
  penaltiesCount: number;
  unpaidPenaltiesCount: number;
  walletBalance: number;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  description?: string;
  address?: string;
};

export type UpdateAvatarResponse = {
  avatarUrl: string;
};

export type ProfilePenaltyItem = {
  id: string;
  amount: number;
  reason: string | null;
  appliedAt: string;
  applicationId: string;
  jobOfferTitle?: string;
};

export type ProfileApplicationItem = {
  id: string;
  status: string;
  createdAt: string;
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

export class ProfileController extends RabotkaBaseController {
  async createProfile(
    data: CreateProfilePayload,
  ): Promise<CreateProfileResponse> {
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("address", data.address);
      formData.append("description", data.description);
      formData.append("profileType", data.profileType);
      formData.append("documentType", data.documentType);
      formData.append("kycDocument", data.kycDocument);
      formData.append("kycSelfie", data.kycSelfie);

      return await this.post<CreateProfileResponse>("/profile", formData);
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
}

export const {
  getMe,
  getPenalties,
  updateAvatar,
  updateProfile,
  createProfile,
  getApplications,
} = new ProfileController();
