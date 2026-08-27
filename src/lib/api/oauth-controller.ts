import { RabotkaBaseController } from "./base-controller";

export type ConsentContext = {
  app: { name: string; description: string; logoUrl: string | null };
  scopes: string[];
  /** Null until the visitor has authenticated inside this interaction. */
  profile: { firstName: string; lastName: string; phoneHint: string } | null;
  /** True when a prior consent already covers every requested scope. */
  alreadyGranted: boolean;
};

export type SendOtpResult =
  | { sent: true }
  /**
   * Not an error. "Login with Rabotka" federates existing Rabotka users only,
   * so an unknown number is a real answer the screen has to render — and the
   * endpoint deliberately returns 200 for it so it cannot be used to test
   * whether a given phone number has a Rabotka account.
   */
  | { sent: false; reason: "no_account" };

export type ConsentDecision = { redirectTo: string };

/**
 * The consent screen's half of the OIDC flow.
 *
 * Only these three verbs are here. `/authorize`, `/token` and `/userinfo` are
 * never called by this app: the first is a browser navigation the partner
 * initiates, and the other two are server-to-server calls made by the partner's
 * backend with their client secret.
 */
export class OAuthController extends RabotkaBaseController {
  async context(interactionId: string): Promise<ConsentContext> {
    try {
      return await this.get<ConsentContext>(
        `/oauth/interaction/${encodeURIComponent(interactionId)}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async sendOtp(interactionId: string, phone: string): Promise<SendOtpResult> {
    try {
      return await this.post<SendOtpResult>(
        `/oauth/interaction/${encodeURIComponent(interactionId)}/send-otp`,
        { phone },
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  /** Resolves to the refreshed context — the visitor is now authenticated. */
  async verifyOtp(
    interactionId: string,
    phone: string,
    otp: string,
  ): Promise<ConsentContext> {
    try {
      return await this.post<ConsentContext>(
        `/oauth/interaction/${encodeURIComponent(interactionId)}/verify-otp`,
        { phone, otp },
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async decide(
    interactionId: string,
    approve: boolean,
  ): Promise<ConsentDecision> {
    try {
      return await this.post<ConsentDecision>(
        `/oauth/interaction/${encodeURIComponent(interactionId)}/consent`,
        { approve },
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

const controller = new OAuthController();

export const getConsentContext = controller.context.bind(controller);
export const sendConsentOtp = controller.sendOtp.bind(controller);
export const verifyConsentOtp = controller.verifyOtp.bind(controller);
export const decideConsent = controller.decide.bind(controller);
