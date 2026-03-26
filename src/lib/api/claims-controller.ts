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
  content: string;
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
  content: string;
};

export type FileUploadResponse = {
  files: { file_url: string }[];
};

export class ClaimsController extends RabotkaBaseController {
  async uploadFiles(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const response = await this.post<FileUploadResponse>(
        "/file/upload?is_multipl=true",
        formData as unknown as Record<string, unknown>,
      );

      return response.files.map((f) => f.file_url);
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

export const { listClaims, getClaim, createClaim, listComments, addComment, deleteComment, uploadFiles } =
  new ClaimsController();
