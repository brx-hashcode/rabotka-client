import { RabotkaBaseController } from "./base-controller";

export type CreateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  profileType: "WORKER" | "EMPLOYER" | "";
  documentType: "IDENTITY_CARD" | "PASSPORT" | "DRIVER_LICENSE" | "";
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
  status: "PENDING_PAYMENT" | "ACTIVE" | "SUSPENDED" | "BANNED";
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  reliabilityScore: number | null;
  whatsappConnected: boolean;
  avatarUrl: string | null;
  createdAt: string;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  description?: string;
};

export type UpdateAvatarResponse = {
  avatarUrl: string;
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

  getMe(): Promise<ProfileMeResponse> {
    return this.get<ProfileMeResponse>("/profile/me");
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

export const { createProfile, getMe, updateProfile, updateAvatar } =
  new ProfileController();
