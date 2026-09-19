import { RabotkaBaseController } from "./base-controller";
import type { PortfolioItem } from "@/features/portfolio/types";

export type { PortfolioItem };

export type UpdatePortfolioItemPayload = {
  /** An empty string clears the text, leaving an images-only publication. */
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

  /**
   * Text, images, or both — the server rejects neither.
   *
   * An empty description is left out of the body rather than sent as "",
   * so an images-only publication stores null instead of a blank string.
   */
  async create(description: string, images: File[]): Promise<PortfolioItem> {
    try {
      const formData = new FormData();
      const text = description.trim();
      if (text) formData.append("description", text);
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
