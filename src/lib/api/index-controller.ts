import { env } from "@/env";
import { BaseController } from "mvc-front-sdk";

type GenerateCsrfTokenResponse = {
  csrfToken: string;
};

export class IndexController extends BaseController {
  constructor() {
    super(env.VITE_API_URL);
  }

  async generateCsrfToken(): Promise<GenerateCsrfTokenResponse> {
    try {
      return await this.apiService.get<GenerateCsrfTokenResponse>("/csrf");
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { generateCsrfToken } = new IndexController();
