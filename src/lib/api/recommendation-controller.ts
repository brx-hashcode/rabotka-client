import { RabotkaBaseController } from "./base-controller";

export type RecommendedWorker = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  reliabilityScore: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  categoryName: string | null;
  description: string | null;
  completedMissions: number;
  portfolioSlug: string | null;
  score: number;
};

export type RecommendedWorkerDetail = {
  worker: RecommendedWorker;
  recommendationFee: number;
  walletBalance: number;
};

class RecommendationController extends RabotkaBaseController {
  async getWorkerFeed(limit = 20): Promise<RecommendedWorker[]> {
    try {
      return await this.get<RecommendedWorker[]>(
        `/profile/worker-feed?limit=${limit}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRecommendedWorker(id: string): Promise<RecommendedWorkerDetail> {
    try {
      return await this.get<RecommendedWorkerDetail>(
        `/profile/worker-feed/${id}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async payRecommendationWallet(id: string): Promise<{ ok: boolean }> {
    try {
      return await this.post<{ ok: boolean }>(
        `/profile/recommended-workers/${id}/contact/pay-wallet`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async payRecommendationMobile(id: string): Promise<{ token: string }> {
    try {
      return await this.post<{ token: string }>(
        `/profile/recommended-workers/${id}/contact/pay-mobile`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const {
  getWorkerFeed,
  getRecommendedWorker,
  payRecommendationWallet,
  payRecommendationMobile,
} = new RecommendationController();
