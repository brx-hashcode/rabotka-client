import { RabotkaBaseController } from "./base-controller";

export type JobOfferStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED";

export type EmployerJobOfferItem = {
  id: string;
  title: string;
  status: JobOfferStatus;
  scheduledAt: string;
  amount: number;
  paymentFlow: string;
  address: string;
  quantity: number;
  acceptedCount: number;
  pendingApplicationsCount: number;
  createdAt: string;
};

export type EmployerJobOffersResponse = {
  data: EmployerJobOfferItem[];
  total: number;
  nextCursor: string | null;
};

export type EmployerApplicationItem = {
  id: string;
  status: string;
  createdAt: string;
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl: string | null;
    reliabilityScore: number | null;
  };
  jobOffer: {
    id: string;
    title: string;
    scheduledAt: string;
  };
};

export type EmployerApplicationsResponse = {
  data: EmployerApplicationItem[];
  total: number;
  page: number;
  limit: number;
};

export type CreateJobOfferPayload = {
  title: string;
  description: string;
  scheduled_at: string; // ISO date-time
  address: string;
  quantity: number;
  amount?: number;
  payment_flow?: "HOURLY" | "DAILY" | "MONTHLY";
  note?: string;
  category_id?: string;
};

// The create endpoint returns the full offer; we only rely on id + reference
// (both single-word, so casing-agnostic), the recap is shown from form data.
export type CreatedJobOffer = {
  id: string;
  reference: string;
};

class JobOfferController extends RabotkaBaseController {
  async getEmployerJobOffers(params?: {
    limit?: number;
    cursor?: string;
  }): Promise<EmployerJobOffersResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.cursor) query.set("cursor", params.cursor);
    const qs = query.toString();
    try {
      return await this.get<EmployerJobOffersResponse>(
        `/job-offers/employer${qs ? `?${qs}` : ""}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getEmployerApplications(params?: {
    page?: number;
    limit?: number;
  }): Promise<EmployerApplicationsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    try {
      return await this.get<EmployerApplicationsResponse>(
        `/applications/employer${qs ? `?${qs}` : ""}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(payload: CreateJobOfferPayload): Promise<CreatedJobOffer> {
    try {
      return await this.post<CreatedJobOffer>(
        "/job-offers",
        payload as unknown as Record<string, unknown>,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { getEmployerJobOffers, getEmployerApplications, create: createJobOffer } =
  new JobOfferController();
