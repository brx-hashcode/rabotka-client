import { RabotkaBaseController } from "./base-controller";
import type { JobOfferStatus } from "./job-offer-controller";
import type { EmploymentTypeValue } from "@/lib/employment-type";

export type AgentInviteStatus =
  | "SUGGESTED"
  | "CLAIMED"
  | "INVITED"
  | "CONFIRMED"
  | "DECLINED"
  | "UNREACHABLE";

/**
 * An invitation a Rabotka field agent sent this worker, read through the link
 * in their message. Only the worker it was issued to can open it — anyone
 * else gets "Invitation introuvable".
 */
export type AgentInvite = {
  status: AgentInviteStatus;
  expiresAt: string | null;
  /** True once the link has passed its validity, whatever the status. */
  expired: boolean;
  /** The agent's first name only — enough to recognise who called. */
  agent: { firstName: string } | null;
  job: {
    id: string;
    reference: string | null;
    title: string;
    description: string | null;
    city: string | null;
    countryName: string | null;
    address: string | null;
    isRemote: boolean;
    scheduledAt: string | null;
    amount: number | null;
    paymentFlow: string | null;
    employmentType: EmploymentTypeValue;
    note: string | null;
    status: JobOfferStatus;
    category: { id: string; name: string; slug: string } | null;
  };
  /** Set once the worker accepted: the application it created. */
  applicationId: string | null;
};

class AgentInviteController extends RabotkaBaseController {
  async getInvite(token: string): Promise<AgentInvite> {
    try {
      return await this.get<AgentInvite>(
        `/profile/agent-invites/${encodeURIComponent(token)}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async acceptInvite(
    token: string,
  ): Promise<{ success: true; applicationId: string }> {
    try {
      return await this.post<{ success: true; applicationId: string }>(
        `/profile/agent-invites/${encodeURIComponent(token)}/accept`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async declineInvite(token: string): Promise<{ success: true }> {
    try {
      return await this.post<{ success: true }>(
        `/profile/agent-invites/${encodeURIComponent(token)}/decline`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { getInvite, acceptInvite, declineInvite } =
  new AgentInviteController();
