import { RabotkaBaseController } from "./base-controller";

export type ReferralSummary = {
  code: string;
  /**
   * What unit the two amounts below are in.
   *
   * `FIXED` — francs, paid whatever the filleul's first mise en relation cost.
   * `PERCENTAGE` — shares of that payment. The field names keep their `Fcfa`
   * suffix because the storage keys do; this is what says which they are, and
   * rendering 60 as «60 FCFA» when it means «60 %» is the failure it prevents.
   *
   * Optional: an older backend during a rolling deploy sends no type, and
   * absent means FIXED — the behaviour that existed before the field did.
   */
  commissionType?: "FIXED" | "PERCENTAGE";
  referrerCreditFcfa: number;
  refereeCreditFcfa: number;
  /**
   * What the filleul's first payment must reach for anything to be paid.
   * Equals the two credits combined — the payout can never exceed the payment
   * that triggered it. Server-computed, from the same function the settle logic
   * uses, so the screen cannot promise a credit the backend would decline.
   *
   * Null in PERCENTAGE mode, where there is no minimum at all: a share fits
   * inside any payment, so nothing can be too small to qualify.
   */
  minQualifyingAmountFcfa: number | null;
  /** null means the parrain has no cap. */
  maxRewardedPerReferrer: number | null;
  joinedCount: number;
  rewardedCount: number;
  pendingCount: number;
  totalEarnedFcfa: number;
};

export type ReferralResolution =
  | { found: true; firstName: string; lastInitial: string }
  | { found: false };

class ReferralController extends RabotkaBaseController {
  // Backend: GET /referral/me. Mints the code on first call, so this is also
  // what gives a long-standing account its first parrainage code.
  async getSummary(): Promise<ReferralSummary> {
    try {
      return await this.get<ReferralSummary>("/referral/me");
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Backend: GET /referral/resolve/:code. Public and throttled.
   *
   * Answers 200 with `found: false` for an unknown code rather than a 404, so
   * the signup screen renders it inline without an error path. Never let a
   * failure here block a signup — the code is optional and the backend ignores
   * one it cannot resolve.
   */
  async resolve(code: string): Promise<ReferralResolution> {
    try {
      return await this.get<ReferralResolution>(
        `/referral/resolve/${encodeURIComponent(code)}`,
      );
    } catch {
      return { found: false };
    }
  }
}

export const { getSummary: getReferralSummary, resolve: resolveReferralCode } =
  new ReferralController();
