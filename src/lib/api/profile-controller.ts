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
  createdAt: string;
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
}

export const { createProfile, getMe } = new ProfileController();
