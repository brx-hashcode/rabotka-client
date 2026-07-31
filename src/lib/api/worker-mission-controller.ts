import { RabotkaBaseController } from "./base-controller";
import type { JobOfferStatus } from "./job-offer-controller";

export type WorkerMissionApplicationStatus =
  | "ACCEPTED"
  | "STARTED"
  | "END"
  | (string & {});

export type WorkerMissionEmployer = {
  id: string;
  firstName: string;
  lastName: string;
  reliabilityScore: number | null;
  ratingAvg: number | null;
  ratingCount: number;
};

export type WorkerMission = {
  applicationId: string;
  applicationStatus: WorkerMissionApplicationStatus;
  assignmentStatus: string | null;
  ratedEmployer: boolean;
  contractId: string | null;
  jobOffer: {
    id: string;
    title: string;
    description: string;
    scheduledAt: string;
    amount: number | null;
    address: string;
    status: JobOfferStatus;
  };
  employer: WorkerMissionEmployer;
};

export type WorkerMissionsResponse = {
  items: WorkerMission[];
  total: number;
};

// Backend returns the mission shape in camelCase already (mapped server-side),
// so these are pass-through calls.
class WorkerMissionController extends RabotkaBaseController {
  async getWorkerMissions(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<WorkerMissionsResponse> {
    const pageSize = params?.pageSize ?? 20;
    const page = params?.page && params.page > 0 ? params.page : 0;
    try {
      return await this.get<WorkerMissionsResponse>(
        `/profile/worker/missions?page=${page}&pageSize=${pageSize}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getWorkerMission(id: string): Promise<WorkerMission> {
    try {
      return await this.get<WorkerMission>(`/profile/worker/missions/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Worker marks their side done and rates the employer (1–5).
  async completeWorkerMission(
    id: string,
    payload: { score: number },
  ): Promise<void> {
    try {
      await this.post<{ success: boolean }>(
        `/profile/worker/missions/${id}/complete`,
        payload,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Whether cancelling right now would cost the worker a penalty. Called before
   * showing the confirm dialog so the cost is never a surprise.
   */
  async getCancellationPreview(id: string): Promise<CancellationPreview> {
    try {
      return await this.get<CancellationPreview>(
        `/profile/worker/missions/${id}/cancellation-preview`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async getWorkerUnlock(id: string): Promise<{ unlock: WorkerUnlockState | null }> {
    try {
      return await this.get<{ unlock: WorkerUnlockState | null }>(
        `/profile/worker/missions/${id}/unlock`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async payWorkerUnlockWallet(
    id: string,
  ): Promise<{ unlock: WorkerUnlockState | null }> {
    try {
      return await this.post<{ unlock: WorkerUnlockState | null }>(
        `/profile/worker/missions/${id}/unlock/pay-wallet`,
        {},
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async payWorkerUnlockMobile(id: string): Promise<{ token: string }> {
    try {
      return await this.post<{ token: string }>(
        `/profile/worker/missions/${id}/unlock/pay-mobile`,
        {},
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  // Worker withdraws their own application / mission.
  async cancelWorkerMission(
    id: string,
    payload?: { reason?: string },
  ): Promise<CancelResult> {
    try {
      return await this.post<CancelResult>(
        `/profile/worker/missions/${id}/cancel`,
        payload ?? {},
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const {
  getWorkerMissions,
  getWorkerMission,
  completeWorkerMission,
  getCancellationPreview,
  cancelWorkerMission,
  getWorkerUnlock,
  payWorkerUnlockWallet,
  payWorkerUnlockMobile,
} = new WorkerMissionController();
