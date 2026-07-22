import { RabotkaBaseController } from "./base-controller";
import type { PortfolioItem } from "@/features/portfolio/types";

export type { PortfolioItem };

export type UpdatePortfolioItemPayload = {
  title?: string;
  description?: string;
};

class PortfolioController extends RabotkaBaseController {
  async list(): Promise<PortfolioItem[]> {
    try {
      return await this.get<PortfolioItem[]>("/profile/portfolio");
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(
    title: string,
    description: string,
    images: File[],
  ): Promise<PortfolioItem> {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      for (const image of images) {
        formData.append("images", image);
      }
      return await this.post<PortfolioItem>("/profile/portfolio", formData);
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    id: string,
    payload: UpdatePortfolioItemPayload,
  ): Promise<PortfolioItem> {
    try {
      return await this.patch<PortfolioItem>(
        `/profile/portfolio/${id}`,
        payload,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.delete<void>(`/profile/portfolio/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async addImages(id: string, images: File[]): Promise<PortfolioItem> {
    try {
      const formData = new FormData();
      for (const image of images) {
        formData.append("images", image);
      }
      return await this.post<PortfolioItem>(
        `/profile/portfolio/${id}/images`,
        formData,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async removeImage(id: string, imageId: string): Promise<void> {
    try {
      await this.delete<void>(`/profile/portfolio/${id}/images/${imageId}`);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const {
  list: listPortfolio,
  create: createPortfolioItem,
  update: updatePortfolioItem,
  remove: removePortfolioItem,
  addImages: addPortfolioImages,
  removeImage: removePortfolioImage,
} = new PortfolioController();
