import { RabotkaBaseController } from "./base-controller";
import type { RecommendedWorker } from "./recommendation-controller";

export type JobCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
};

export type WorkerSearchParams = {
  q?: string;
  categoryId?: string;
  minReliability?: number;
  minRating?: number;
  city?: string;
  page?: number;
  pageSize?: number;
};

export type WorkerSearchResponse = {
  items: RecommendedWorker[];
  total: number;
};

class WorkerSearchController extends RabotkaBaseController {
  async searchWorkers(
    params: WorkerSearchParams,
  ): Promise<WorkerSearchResponse> {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.categoryId) qs.set("categoryId", params.categoryId);
    if (params.minReliability != null)
      qs.set("minReliability", String(params.minReliability));
    if (params.minRating != null) qs.set("minRating", String(params.minRating));
    if (params.city) qs.set("city", params.city);
    qs.set("page", String(params.page ?? 0));
    qs.set("pageSize", String(params.pageSize ?? 15));
    try {
      return await this.get<WorkerSearchResponse>(
        `/profile/worker-search?${qs.toString()}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getJobCategories(): Promise<JobCategory[]> {
    try {
      return await this.get<JobCategory[]>("/job-categories");
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { searchWorkers, getJobCategories } = new WorkerSearchController();
