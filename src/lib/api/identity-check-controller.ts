import { RabotkaBaseController } from "./base-controller";

export type IdentityCheckDocumentType =
  | "IDENTITY_CARD"
  | "PASSPORT"
  | "DRIVER_LICENSE"
  | "NIU_CARD";

/** A partner's request to confirm who the signed-in person is. */
export type IdentityCheckRequest = {
  id: string;
  status: "pending" | "approved" | "declined" | "expired";
  expiresAt: string;
  app: { name: string; description: string; logoUrl: string | null };
  /**
   * What the partner says about the person. Null once the retention period
   * has passed and the claim has been erased.
   */
  claimed: {
    firstName: string;
    lastName: string;
    countryCode: string | null;
    city: string | null;
    documentType: IdentityCheckDocumentType | null;
  } | null;
};

export class IdentityCheckController extends RabotkaBaseController {
  async find(id: string): Promise<IdentityCheckRequest> {
    try {
      return await this.get<IdentityCheckRequest>(
        `/profile/identity-checks/${encodeURIComponent(id)}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async decide(id: string, approve: boolean): Promise<IdentityCheckRequest> {
    try {
      return await this.post<IdentityCheckRequest>(
        `/profile/identity-checks/${encodeURIComponent(id)}/${approve ? "approve" : "decline"}`,
        {},
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

const controller = new IdentityCheckController();

export const getIdentityCheck = controller.find.bind(controller);
export const decideIdentityCheck = controller.decide.bind(controller);
