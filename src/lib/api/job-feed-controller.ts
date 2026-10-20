import { RabotkaBaseController } from "./base-controller";
import type { EmploymentTypeValue } from "@/lib/employment-type";
import type { JobOfferStatus } from "./job-offer-controller";

export type JobFeedEmployer = {
  id: string;
  firstName: string;
  lastName: string;
  reliabilityScore: number | null;
  avatarUrl: string | null;
  ratingAvg: number | null;
  ratingCount: number;
};

export type ApplicationState =
  | "NONE"
  | "LIVE"
  | "REJECTED"
  | "ENDED"
  | "SELF_CANCELLED"
  | "CAN_REAPPLY";

export type JobFeedItem = {
  id: string;
  reference: string;
  title: string;
  description: string;
  status: JobOfferStatus;
  /** Null for CDI/CDD/STAGE, which have no closing date. */
  scheduledAt: string | null;
  employmentType: EmploymentTypeValue;
  amount: number | null;
  paymentFlow: string;
  /** Null for a remote job — render `isRemote` instead. */
  address: string | null;
  isRemote: boolean;
  city?: string | null;
  countryName?: string | null;
  /**
   * The employer's free-text extra instructions. Sent by the API all along but
   * dropped here, so the worker never saw what they were being told about the
   * job — meeting point, what to bring, who to ask for.
   */
  note: string | null;
  quantity: number;
  acceptedCount: number;
  createdAt: string;
  matchScore: number;
  saved: boolean;
  applied: boolean;
  /**
   * The worker's LIVE application on this offer, when there is one.
   *
   * Not the same question as `applied`, which stays true for a cancelled or
   * rejected row because those still bar a re-application. A conversation on a
   * dead application is closed, so this is null there and the chat button is
   * not offered — a control the API would refuse is worse than no control.
   */
  applicationId: string | null;
  /**
   * What is actually true about this worker's application to the offer,
   * derived server-side from the SAME rule the apply endpoint enforces.
   *
   * `applied` alone lied: it was true for a cancelled application the worker
   * was allowed to re-apply to, and the card showed "Déjà postulé", disabled,
   * on something the server would accept.
   */
  applicationState: ApplicationState;
  // Only the search endpoint supplies the category; the feed endpoints don't.
  categoryId?: string | null;
  categoryName?: string | null;
  employer?: JobFeedEmployer;
};

export type JobSearchSort = "recent" | "soon" | "amount_desc";
export type JobPaymentFlow = "TASK" | "HOURLY" | "DAILY" | "MONTHLY";

export type JobSearchParams = {
  q?: string;
  categoryId?: string;
  city?: string;
  paymentFlow?: JobPaymentFlow;
  minAmount?: number;
  maxAmount?: number;
  /** ISO date strings, filtering on the offer's scheduled date. */
  from?: string;
  to?: string;
  hideApplied?: boolean;
  sort?: JobSearchSort;
  page?: number;
  pageSize?: number;
};

export type JobSearchResponse = { items: JobFeedItem[]; total: number };

// The daily cap is the only limit on applying. A concurrent open-application
// cap used to sit alongside it and was the binding one, but nothing cleared it
// on a clock — it freed only when an employer responded — so `resetsAt` was a
// lie whenever it was the reason a worker could not apply. Removed backend-side.
export type DailyQuota = {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string;
};

type BackendJobFeedItem = {
  id: string;
  reference: string;
  title: string;
  description: string;
  status: JobOfferStatus;
  scheduled_at: string | null;
  /**
   * camelCase on purpose — the server renames exactly these three, and every
   * other key here stays snake_case. Non-optional so a server-side rename
   * surfaces as a type error at the mapping below rather than as a silent
   * `undefined` absorbed by a default.
   */
  employmentType: EmploymentTypeValue;
  amount: number | null;
  payment_flow: string | null;
  /** Null for a remote job — render `isRemote` instead. */
  address: string | null;
  isRemote: boolean;
  city: string | null;
  countryName: string | null;
  note: string | null;
  quantity: number;
  acceptedCount: number;
  created_at: string;
  matchScore: number;
  saved: boolean;
  /**
   * The worker's LIVE application, or null. Non-optional like `employmentType`
   * above and for the same reason: all four endpoints that produce this shape
   * send it, so a server-side rename should surface here rather than as a
   * button that quietly stops appearing.
   */
  applicationId: string | null;
  applicationState: ApplicationState;
  applied: boolean;
  categoryId?: string | null;
  categoryName?: string | null;
  employer?: {
    id: string;
    first_name: string;
    last_name: string;
    reliability_score: number | null;
    avatar_url: string | null;
    rating_avg: number | null;
    rating_count: number;
  };
};

function mapItem(o: BackendJobFeedItem): JobFeedItem {
  return {
    id: o.id,
    reference: o.reference,
    title: o.title,
    description: o.description,
    status: o.status,
    scheduledAt: o.scheduled_at,
    employmentType: o.employmentType,
    amount: o.amount ?? null,
    paymentFlow: o.payment_flow ?? "",
    address: o.address,
    isRemote: o.isRemote,
    city: o.city,
    countryName: o.countryName,
    note: o.note ?? null,
    quantity: o.quantity,
    acceptedCount: o.acceptedCount ?? 0,
    createdAt: o.created_at,
    matchScore: o.matchScore ?? 0,
    saved: o.saved,
    applied: o.applied,
    // `?? null` although the type says it is always there: an older server
    // would send `undefined`, and undefined reaching StartChatButton renders
    // nothing anyway — but null is what the prop is typed as, and a shape that
    // lies about itself is how the next bug starts.
    applicationId: o.applicationId ?? null,
    // An older server sends nothing here; "NONE" there would offer "Postuler"
    // on offers already applied to, so fall back on the legacy boolean.
    applicationState: o.applicationState ?? (o.applied ? "LIVE" : "NONE"),
    categoryId: o.categoryId ?? null,
    categoryName: o.categoryName ?? null,
    employer: o.employer
      ? {
          id: o.employer.id,
          firstName: o.employer.first_name,
          lastName: o.employer.last_name,
          reliabilityScore: o.employer.reliability_score,
          avatarUrl: o.employer.avatar_url ?? null,
          ratingAvg: o.employer.rating_avg ?? null,
          ratingCount: o.employer.rating_count ?? 0,
        }
      : undefined,
  };
}

class JobFeedController extends RabotkaBaseController {
  // GET /profile/job-feed?limit&categoryId → matched (or category) jobs for the worker.
  async getJobFeed(params?: {
    limit?: number;
    categoryId?: string | null;
  }): Promise<JobFeedItem[]> {
    const limit = params?.limit ?? 10;
    const cat = params?.categoryId
      ? `&categoryId=${encodeURIComponent(params.categoryId)}`
      : "";
    try {
      const res = await this.get<BackendJobFeedItem[]>(
        `/profile/job-feed?limit=${limit}${cat}`,
      );
      return res.map(mapItem);
    } catch (error) {
      this.handleError(error);
    }
  }

  // GET /profile/jobs/:id → single job (worker view, with saved/applied flags).
  async getJobDetail(jobOfferId: string): Promise<JobFeedItem> {
    try {
      const res = await this.get<BackendJobFeedItem>(
        `/profile/jobs/${jobOfferId}`,
      );
      return mapItem(res);
    } catch (error) {
      this.handleError(error);
    }
  }

  // POST /profile/jobs/:id/apply → apply; returns the updated daily quota.
  async applyToJob(jobOfferId: string): Promise<{ dailyQuota: DailyQuota }> {
    try {
      return await this.post<{ success: boolean; dailyQuota: DailyQuota }>(
        `/profile/jobs/${jobOfferId}/apply`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDailyQuota(): Promise<DailyQuota> {
    try {
      return await this.get<DailyQuota>("/profile/daily-application-quota");
    } catch (error) {
      this.handleError(error);
    }
  }

  async saveJob(jobOfferId: string): Promise<void> {
    try {
      await this.post<{ success: boolean }>(
        `/profile/saved-jobs/${jobOfferId}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async unsaveJob(jobOfferId: string): Promise<void> {
    try {
      await this.delete<{ success: boolean }>(
        `/profile/saved-jobs/${jobOfferId}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSavedJobs(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<{ items: JobFeedItem[]; total: number }> {
    const pageSize = params?.pageSize ?? 10;
    const page = params?.page ?? 0;
    try {
      const res = await this.get<{ items: BackendJobFeedItem[]; total: number }>(
        `/profile/saved-jobs?page=${page}&pageSize=${pageSize}`,
      );
      return { items: res.items.map(mapItem), total: res.total };
    } catch (error) {
      this.handleError(error);
    }
  }

  // GET /profile/job-search — free-text over title/description/domaine/reference/
  // address plus filters. Paged 0-based as { items, total }.
  async searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
    const qs = new URLSearchParams();
    if (params.q?.trim()) qs.set("q", params.q.trim());
    if (params.categoryId) qs.set("categoryId", params.categoryId);
    if (params.city?.trim()) qs.set("city", params.city.trim());
    if (params.paymentFlow) qs.set("paymentFlow", params.paymentFlow);
    if (params.minAmount != null) qs.set("minAmount", String(params.minAmount));
    if (params.maxAmount != null) qs.set("maxAmount", String(params.maxAmount));
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.hideApplied) qs.set("hideApplied", "1");
    if (params.sort) qs.set("sort", params.sort);
    qs.set("page", String(params.page ?? 0));
    qs.set("pageSize", String(params.pageSize ?? 15));

    try {
      const res = await this.get<{ items: BackendJobFeedItem[]; total: number }>(
        `/profile/job-search?${qs.toString()}`,
      );
      return { items: res.items.map(mapItem), total: res.total };
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const {
  getJobFeed,
  getJobDetail,
  applyToJob,
  getDailyQuota,
  saveJob,
  unsaveJob,
  getSavedJobs,
  searchJobs,
} = new JobFeedController();
