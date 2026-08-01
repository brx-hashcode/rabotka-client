import { RabotkaBaseController } from "./base-controller";
import type { JobOfferStatus } from "./job-offer-controller";

export type ApplicationStatus =
  | "PENDING"
  | "VIEWED"
  | "WAITING_PAYMENT"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "STARTED"
  | "END";

export type ContactUnlockStatus =
  | "PENDING_BOTH"
  | "PENDING_EMPLOYER"
  | "PENDING_WORKER"
  | "UNLOCKED"
  | "EXPIRED"
  | "CONVERTED_TO_CREDIT";

export type ApplicationDetailApplication = {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  cancelledAt: string | null;
  /** Free-text motive the worker gave when withdrawing. Often absent. */
  cancellationReason: string | null;
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    reliabilityScore: number | null;
    description: string | null;
  };
  jobOffer: {
    id: string;
    title: string;
    scheduledAt: string;
    amount: number;
    address: string;
    status: JobOfferStatus;
  };
};

export type ApplicationUnlock = {
  attemptId: string;
  status: ContactUnlockStatus;
  employerFee: number;
  walletBalance: number;
  expiresAt: string;
  employerPaid: boolean;
  workerPaid: boolean;
};

export type ApplicationDetail = {
  application: ApplicationDetailApplication;
  unlock: ApplicationUnlock | null;
  workerSlug: string | null;
};

// Raw backend shapes (ApplicationWithOffer + unlock/contact) — snake_case.
type BackendApplication = {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  worker?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
    reliability_score?: number | null;
    description?: string | null;
  };
  job_offer?: {
    id: string;
    title: string;
    scheduled_at: string;
    amount: number | null;
    address: string;
    status: JobOfferStatus;
  };
};

type BackendDetail = {
  application: BackendApplication;
  unlock: {
    attemptId: string;
    status: ContactUnlockStatus;
    employerFee: number;
    walletBalance: number;
    expiresAt: string;
    employerPaid: boolean;
    workerPaid: boolean;
  } | null;
  workerSlug?: string | null;
};

function mapApplication(a: BackendApplication): ApplicationDetailApplication {
  return {
    id: a.id,
    status: a.status,
    createdAt: a.created_at,
    cancelledAt: a.cancelled_at ?? null,
    cancellationReason: a.cancellation_reason ?? null,
    worker: {
      id: a.worker?.id ?? "",
      firstName: a.worker?.first_name ?? "",
      lastName: a.worker?.last_name ?? "",
      avatarUrl: a.worker?.avatar_url ?? null,
      reliabilityScore: a.worker?.reliability_score ?? null,
      description: a.worker?.description ?? null,
    },
    jobOffer: {
      id: a.job_offer?.id ?? "",
      title: a.job_offer?.title ?? "",
      scheduledAt: a.job_offer?.scheduled_at ?? "",
      amount: a.job_offer?.amount ?? 0,
      address: a.job_offer?.address ?? "",
      status: (a.job_offer?.status ?? "ACTIVE") as JobOfferStatus,
    },
  };
}

function mapDetail(d: BackendDetail): ApplicationDetail {
  return {
    application: mapApplication(d.application),
    unlock: d.unlock,
    workerSlug: d.workerSlug ?? null,
  };
}

class ApplicationController extends RabotkaBaseController {
  async getApplication(id: string): Promise<ApplicationDetail> {
    try {
      const res = await this.get<BackendDetail>(`/profile/applications/${id}`);
      return mapDetail(res);
    } catch (error) {
      this.handleError(error);
    }
  }

  async acceptApplication(id: string): Promise<ApplicationDetail> {
    try {
      const res = await this.post<BackendDetail>(
        `/profile/applications/${id}/accept`,
      );
      return mapDetail(res);
    } catch (error) {
      this.handleError(error);
    }
  }

  async rejectApplication(
    id: string,
    reason?: string,
  ): Promise<{ application: ApplicationDetailApplication }> {
    try {
      const res = await this.post<{ application: BackendApplication }>(
        `/profile/applications/${id}/reject`,
        reason ? { reason } : {},
      );
      return { application: mapApplication(res.application) };
    } catch (error) {
      this.handleError(error);
    }
  }

  async payUnlockWallet(id: string): Promise<ApplicationDetail> {
    try {
      const res = await this.post<BackendDetail>(
        `/profile/applications/${id}/unlock/pay-wallet`,
      );
      return mapDetail(res);
    } catch (error) {
      this.handleError(error);
    }
  }

  async payUnlockMobile(id: string): Promise<{ token: string }> {
    try {
      return await this.post<{ token: string }>(
        `/profile/applications/${id}/unlock/pay-mobile`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  // Employer marks the mission completed and rates the worker (1–5, optional note).
  async completeMission(
    id: string,
    payload: { score: number; note?: string },
  ): Promise<void> {
    try {
      await this.post<{ success: boolean }>(
        `/profile/applications/${id}/complete`,
        payload,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const {
  getApplication,
  acceptApplication,
  rejectApplication,
  payUnlockWallet,
  payUnlockMobile,
  completeMission,
} = new ApplicationController();
