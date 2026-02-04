import { BaseController } from "mvc-front-sdk";

export type CreateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  profileType: "WORKER" | "EMPLOYER";
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
    super("https://api.example.com");
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
      formData.append("kycDocument", data.kycDocument);
      formData.append("kycSelfie", data.kycSelfie);

      const url = this.getApiUrl("/profiles");

      console.log(formData.get("firstName"));

      // return { success: true };
      return await this.apiService.post<OnboardingResponse>(url, formData);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { createProfile } = new IndexController();
