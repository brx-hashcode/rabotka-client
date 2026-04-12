import { config } from "@/config";
import { BaseController } from "mvc-front-sdk";

export type JobCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

export class JobCategoryController extends BaseController {
  constructor() {
    super(config.apiUrl);
  }

  async getCategories(): Promise<JobCategory[]> {
    try {
      return await this.apiService.get<JobCategory[]>("/job-categories");
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { getCategories } = new JobCategoryController();
