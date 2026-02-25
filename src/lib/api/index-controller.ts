import { config } from "@/config";
import { BaseController } from "mvc-front-sdk";

type GenerateCsrfTokenResponse = {
  csrfToken: string;
};

export class IndexController extends BaseController {
  constructor() {
    super(config.apiUrl);
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
