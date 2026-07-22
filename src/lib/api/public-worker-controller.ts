import { RabotkaBaseController } from "./base-controller";

export type PublicPortfolioImage = {
  id: string;
  imageUrl: string;
  position: number;
};

export type PublicPortfolioItem = {
  id: string;
  title: string;
  description: string;
  position: number;
  createdAt: string;
  images: PublicPortfolioImage[];
};

export type PublicWorkerResponse = {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  reliabilityScore: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  description: string;
  address: string;
  completedMissionsCount: number;
  portfolio: PublicPortfolioItem[];
};

class PublicWorkerController extends RabotkaBaseController {
  getPublicWorker(slug: string): Promise<PublicWorkerResponse> {
    return this.get<PublicWorkerResponse>(
      `/public/workers/${encodeURIComponent(slug)}`,
    );
  }
}

const controller = new PublicWorkerController();
export const getPublicWorker = controller.getPublicWorker.bind(controller);
