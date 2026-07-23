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

// Raw backend shapes (snake_case) returned by /profile/job-offers and
// /profile/received-applications — mapped to the camelCase types above.
type BackendEmployerOffer = {
  id: string;
  title: string;
  status: JobOfferStatus;
  scheduled_at: string;
  amount: number | null;
  payment_flow: string | null;
  address: string;
  quantity: number;
  acceptedCount?: number;
  created_at: string;
};

type BackendEmployerApplication = {
  id: string;
  status: string;
  created_at: string;
  worker?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    avatar_url?: string | null;
    reliability_score?: number | null;
  };
  job_offer?: {
    id: string;
    title: string;
    scheduled_at: string;
  };
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
  // The backend serves the employer's offers at GET /profile/job-offers
  // (page 0-indexed, pageSize) returning { items, total } with snake_case
  // fields — mapped here to the camelCase shape the dashboard renders.
  async getEmployerJobOffers(params?: {
    limit?: number;
  }): Promise<EmployerJobOffersResponse> {
    const pageSize = params?.limit ?? 20;
    try {
      const res = await this.get<{
        items: BackendEmployerOffer[];
        total: number;
      }>(`/profile/job-offers?page=0&pageSize=${pageSize}`);
      return {
        data: res.items.map((o) => ({
          id: o.id,
          title: o.title,
          status: o.status,
          scheduledAt: o.scheduled_at,
          amount: o.amount ?? 0,
          paymentFlow: o.payment_flow ?? "",
          address: o.address,
          quantity: o.quantity,
          acceptedCount: o.acceptedCount ?? 0,
          pendingApplicationsCount: 0,
          createdAt: o.created_at,
        })),
        total: res.total,
        nextCursor: null,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Backend: GET /profile/received-applications (page 0-indexed, pageSize) →
  // { items, total }. The client hook passes a 1-indexed page.
  async getEmployerApplications(params?: {
    page?: number;
    limit?: number;
  }): Promise<EmployerApplicationsResponse> {
    const pageSize = params?.limit ?? 20;
    const page = params?.page && params.page > 0 ? params.page - 1 : 0;
    try {
      const res = await this.get<{
        items: BackendEmployerApplication[];
        total: number;
      }>(`/profile/received-applications?page=${page}&pageSize=${pageSize}`);
      return {
        data: res.items.map((a) => ({
          id: a.id,
          status: a.status,
          createdAt: a.created_at,
          worker: {
            id: a.worker?.id ?? "",
            firstName: a.worker?.first_name ?? "",
            lastName: a.worker?.last_name ?? "",
            phone: a.worker?.phone ?? "",
            avatarUrl: a.worker?.avatar_url ?? null,
            reliabilityScore: a.worker?.reliability_score ?? null,
          },
          jobOffer: {
            id: a.job_offer?.id ?? "",
            title: a.job_offer?.title ?? "",
            scheduledAt: a.job_offer?.scheduled_at ?? "",
          },
        })),
        total: res.total,
        page: params?.page ?? 1,
        limit: pageSize,
      };
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
