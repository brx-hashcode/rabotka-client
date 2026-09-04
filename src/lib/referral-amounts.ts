import { formatAmount } from "@/lib/utils";
import type { ReferralSummary } from "@/lib/api/referral-controller";

export type ReferralAmounts = {
  referrerAmount: string;
  refereeAmount: string;
  minQualifyingAmount: string | null;
  isPercentage: boolean;
};

/**
 * Turn the summary's bare numbers into the strings the parrainage copy
 * interpolates.
 *
 * The API sends `60` for both «60 FCFA» and «60 %» — the storage keys carry the
 * `Fcfa` suffix in either mode, so the field names cannot say which — and
 * `commissionType` is the only thing that can. Formatting as currency
 * regardless is how a percentage configuration reads on screen as a derisory
 * franc amount, which is the failure this exists to prevent.
 *
 * A missing type means FIXED: that is what an older backend sends during a
 * rolling deploy, and it is the behaviour that existed before the field did.
 *
 * Lives here rather than in the sheet component so it can be tested without a
 * DOM — jsdom does not load in this install.
 */
export function referralAmounts(data: ReferralSummary): ReferralAmounts {
  const isPercentage = data.commissionType === "PERCENTAGE";
  const format = (n: number) => (isPercentage ? `${n} %` : formatAmount(n));

  // Null both when the backend states no threshold — percentage mode has none,
  // because a share always fits inside the payment — and when it sent none at
  // all. A bare interpolation would print "undefined" into the sentence.
  const min = data.minQualifyingAmountFcfa;

  return {
    referrerAmount: format(data.referrerCreditFcfa),
    refereeAmount: format(data.refereeCreditFcfa),
    minQualifyingAmount:
      typeof min === "number" && Number.isFinite(min) ? formatAmount(min) : null,
    isPercentage,
  };
}
