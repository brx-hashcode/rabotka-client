import { RabotkaBaseController } from "./base-controller";
import type { EmploymentTypeValue } from "@/lib/employment-type";

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
  scheduledAt: string | null;
  employmentType: EmploymentTypeValue;
  /** Null when the employer named no price — rendered as «À négocier». */
  amount: number | null;
  paymentFlow: string;
  /** Null for a remote job — render `isRemote` instead. */
  address: string | null;
  isRemote: boolean;
  countryName?: string | null;
  city?: string | null;
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

export type JobOfferEmployer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  reliabilityScore: number | null;
};

export type JobOfferDetail = {
  id: string;
  reference: string;
  title: string;
  description: string;
  status: JobOfferStatus;
  scheduledAt: string | null;
  employmentType: EmploymentTypeValue;
  /** Null when the employer named no price — rendered as «À négocier». */
  amount: number | null;
  paymentFlow: string;
  /** Null for a remote job — render `isRemote` instead. */
  address: string | null;
  isRemote: boolean;
  countryName?: string | null;
  city?: string | null;
  note: string | null;
  quantity: number;
  acceptedCount: number;
  createdAt: string;
  employer?: JobOfferEmployer;
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
    scheduledAt: string | null;
    /** Drives the capacity gate — a FILLED offer can take no more candidates. */
    status: JobOfferStatus;
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
//
// Every field here must match the server's key exactly. employment_type,
// is_remote, city and country_name were declared in camelCase, so they read
// undefined on every response and the `??` defaults below quietly supplied
// "MISSION", false and null — a CDI showed as a mission, and a remote job as
// on-site. They are non-optional now so a rename on either side is a type
// error rather than a plausible-looking wrong value.
type BackendEmployerOffer = {
  id: string;
  title: string;
  status: JobOfferStatus;
  scheduled_at: string | null;
  employment_type: EmploymentTypeValue;
  amount: number | null;
  payment_flow: string | null;
  /** Null for a remote job — render `is_remote` instead. */
  address: string | null;
  is_remote: boolean;
  country_name: string | null;
  city: string | null;
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
    scheduled_at: string | null;
    status?: JobOfferStatus;
  };
};

type BackendJobOfferDetail = {
  id: string;
  reference: string;
  title: string;
  description: string;
  status: JobOfferStatus;
  scheduled_at: string | null;
  employment_type: EmploymentTypeValue;
  amount: number | null;
  payment_flow: string | null;
  /** Null for a remote job — render `is_remote` instead. */
  address: string | null;
  is_remote: boolean;
  country_name: string | null;
  city: string | null;
  note: string | null;
  quantity: number;
  acceptedCount: number;
  employer_id: string;
  created_at: string;
  employer?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    reliability_score: number | null;
  };
};

export type JobOfferWorkerItem = {
  applicationId: string;
  status: string;
  createdAt: string;
  contractId: string | null;
  /** The employer has already rated this worker — hides the rating action. */
  ratedByEmployer: boolean;
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl: string | null;
    reliabilityScore: number | null;
  };
};

type BackendOfferApplication = {
  id: string;
  status: string;
  created_at: string;
  contractId?: string | null;
  ratedByEmployer?: boolean;
  worker?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    avatar_url?: string | null;
    reliability_score?: number | null;
  };
};

export type CreateJobOfferPayload = {
  title: string;
  description: string;
  /** ISO date-time. The offer's CLOSING date; required only for a MISSION. */
  scheduled_at?: string;
  employment_type?: EmploymentTypeValue;
  /** Omitted for a remote job — it has no site. */
  address?: string;
  isRemote?: boolean;
  countryCode?: string;
  countryName?: string;
  city?: string;
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
    page?: number;
    limit?: number;
    /** Narrowed server-side, before pagination — see useEmployerJobOffersInfinite. */
    statuses?: readonly JobOfferStatus[];
  }): Promise<EmployerJobOffersResponse> {
    const pageSize = params?.limit ?? 20;
    const page = params?.page && params.page > 0 ? params.page : 0;
    const qs = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (params?.statuses?.length) qs.set("status", params.statuses.join(","));
    try {
      const res = await this.get<{
        items: BackendEmployerOffer[];
        total: number;
      }>(`/profile/job-offers?${qs.toString()}`);
      return {
        data: res.items.map((o) => ({
          id: o.id,
          title: o.title,
          status: o.status,
          scheduledAt: o.scheduled_at,
          employmentType: o.employment_type,
          amount: o.amount,
          paymentFlow: o.payment_flow ?? "",
          address: o.address,
          isRemote: o.is_remote,
          city: o.city,
          countryName: o.country_name,
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
            status: (a.job_offer?.status ?? "ACTIVE") as JobOfferStatus,
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

  // Backend: GET /job-offers/:id → full offer detail with employer info.
  async getJobOffer(id: string): Promise<JobOfferDetail> {
    try {
      const o = await this.get<BackendJobOfferDetail>(`/job-offers/${id}`);
      return {
        id: o.id,
        reference: o.reference,
        title: o.title,
        description: o.description,
        status: o.status,
        scheduledAt: o.scheduled_at,
        employmentType: o.employment_type,
        amount: o.amount,
        paymentFlow: o.payment_flow ?? "",
        address: o.address,
        isRemote: o.is_remote,
        city: o.city,
        countryName: o.country_name,
        note: o.note,
        quantity: o.quantity,
        acceptedCount: o.acceptedCount,
        createdAt: o.created_at,
        employer: o.employer
          ? {
              id: o.employer.id,
              firstName: o.employer.first_name,
              lastName: o.employer.last_name,
              phone: o.employer.phone,
              reliabilityScore: o.employer.reliability_score,
            }
          : undefined,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Backend: GET /profile/job-offers/:id/applications → workers on the offer.
  async getJobOfferApplications(id: string): Promise<JobOfferWorkerItem[]> {
    try {
      const res = await this.get<BackendOfferApplication[]>(
        `/profile/job-offers/${id}/applications`,
      );
      return res.map((a) => ({
        applicationId: a.id,
        status: a.status,
        createdAt: a.created_at,
        contractId: a.contractId ?? null,
        ratedByEmployer: a.ratedByEmployer ?? false,
        worker: {
          id: a.worker?.id ?? "",
          firstName: a.worker?.first_name ?? "",
          lastName: a.worker?.last_name ?? "",
          phone: a.worker?.phone ?? "",
          avatarUrl: a.worker?.avatar_url ?? null,
          reliabilityScore: a.worker?.reliability_score ?? null,
        },
      }));
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

  // Backend: POST /job-offers/:id/republish → reopen an EXPIRED offer at a new
  // date. `scheduledAt` must be ISO 8601 and at least 4 hours in the future.
  async republish(id: string, scheduledAt: string): Promise<JobOfferDetail> {
    try {
      return await this.post<JobOfferDetail>(`/job-offers/${id}/republish`, {
        scheduledAt,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Backend: DELETE /profile/job-offers/:id → soft-delete one of the employer's
  // own offers (only allowed while ACTIVE with no candidates).
  async remove(id: string): Promise<void> {
    try {
      await this.delete<{ success: boolean }>(`/profile/job-offers/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Backend: POST /profile/job-offers/:id/confirm-hire → close a CDD/CDI/STAGE
   * offer whose positions are all taken, and open the mutual rating.
   *
   * Only for ongoing engagements: a MISSION is closed by its worker confirming
   * the work is done. Requires the offer to be FILLED, so one still taking
   * candidates cannot be closed early. Idempotent once closed — the server also
   * closes these on its own if nobody confirms within a week.
   */
  async confirmHire(id: string): Promise<void> {
    try {
      await this.post<{ success: boolean }>(
        `/profile/job-offers/${id}/confirm-hire`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const {
  republish,
  getEmployerJobOffers,
  getEmployerApplications,
  getJobOffer,
  getJobOfferApplications,
  create: createJobOffer,
  remove: deleteJobOffer,
  confirmHire,
} = new JobOfferController();
