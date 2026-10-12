import { RabotkaBaseController } from "./base-controller";

export type PublicPortfolioImage = {
  id: string;
  imageUrl: string;
  position: number;
};

export type PublicPortfolioItem = {
  id: string;
  /** Null on an images-only publication. Mirrors `PortfolioItem`. */
  description: string | null;
  position: number;
  createdAt: string;
  images: PublicPortfolioImage[];
};

export type PublicWorkerResponse = {
  slug: string;
  firstName: string;
  /** The initial only (« N. ») — the page is public and indexed. */
  lastName: string;
  avatarUrl: string | null;
  reliabilityScore: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  description: string;
  /**
   * « City, Country », or null. Never the street address: the page is public,
   * and a worker's address is often their home.
   */
  location: string | null;
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
