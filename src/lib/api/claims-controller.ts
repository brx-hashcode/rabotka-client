import { RabotkaBaseController } from "./base-controller";

export type ClaimStatus = "CREATED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";

export type ClaimItem = {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  attachmentUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateClaimPayload = {
  title: string;
  description: string;
  attachment_urls?: string[];
};

export type ClaimCommentItem = {
  id: string;
  /** Empty for an image-only comment. */
  content: string;
  /**
   * Optional in the type because a bundle can outlive the backend it talks to:
   * a deploy where this ships first would send comments without the field, and
   * every read site would crash on `.map`. Read it as `?? []`.
   */
  attachmentUrls?: string[];
  userId: string | null;
  userName: string | null;
  profileId: string | null;
  profileName: string | null;
  createdByType: 'user' | 'profile';
  createdAt: string;
};

export type ClaimsListResponse = {
  data: ClaimItem[];
  total: number;
  page: number;
  limit: number;
};

export type CreateCommentPayload = {
  /** Omit for an image-only comment; the server requires one or the other. */
  content?: string;
  attachment_urls?: string[];
};

export type ClaimAttachmentUploadResponse = {
  files: { url: string; key: string; name: string }[];
};

export class ClaimsController extends RabotkaBaseController {
  /**
   * Upload claim images and get back urls to reference.
   *
   * Renamed from `uploadFiles`, and pointed away from the generic
   * `/file/upload?is_multipl=true`: that route accepts any mime type, so it
   * cannot be the thing that guarantees a claim carries only images. The
   * dedicated route runs an image-only filter, and the server will only accept
   * `attachment_urls` that resolve into the folder it writes to.
   *
   * The response field is `url`, not `file_url` — a different endpoint with a
   * different shape.
   */
  async uploadClaimAttachments(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const response = await this.post<ClaimAttachmentUploadResponse>(
        "/profile/claims/attachments",
        formData as unknown as Record<string, unknown>,
      );

      return response.files.map((f) => f.url);
    } catch (error) {
      this.handleError(error);
    }
  }
  async listClaims(
    page: number = 1,
    limit: number = 10,
  ): Promise<ClaimsListResponse> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      return await this.get<ClaimsListResponse>(
        `/profile/claims?${params.toString()}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getClaim(claimId: string): Promise<ClaimItem> {
    try {
      return await this.get<ClaimItem>(`/profile/claims/${claimId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createClaim(data: CreateClaimPayload): Promise<ClaimItem> {
    try {
      return await this.post<ClaimItem>("/profile/claims", data as Record<string, unknown>);
    } catch (error) {
      this.handleError(error);
    }
  }

  async listComments(claimId: string): Promise<ClaimCommentItem[]> {
    try {
      return await this.get<ClaimCommentItem[]>(
        `/profile/claims/${claimId}/comments`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async addComment(
    claimId: string,
    data: CreateCommentPayload,
  ): Promise<ClaimCommentItem> {
    try {
      return await this.post<ClaimCommentItem>(
        `/profile/claims/${claimId}/comments`,
        data as Record<string, unknown>,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteComment(claimId: string, commentId: string): Promise<void> {
    try {
      return await this.delete<void>(
        `/profile/claims/${claimId}/comments/${commentId}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const {
  listClaims,
  getClaim,
  createClaim,
  listComments,
  addComment,
  deleteComment,
  uploadClaimAttachments,
} = new ClaimsController();
