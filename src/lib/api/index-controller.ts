import { BaseController } from "mvc-front-sdk";

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

export type OnboardingResponse = {
  success: boolean;
  userId?: string;
  error?: string;
};

export class IndexController extends BaseController {
  constructor() {
    super(import.meta.env.VITE_API_URL);
  }

  async createProfile(data: CreateProfilePayload): Promise<OnboardingResponse> {
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

      await new Promise((resolve) => setTimeout(resolve, 5000));

      return { success: true, userId: "123" };

      return await this.apiService.post<OnboardingResponse>(
        "/profiles",
        formData,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { createProfile } = new IndexController();
