// @vitest-environment node
//
// Node, like every other suite here — jsdom does not load in this install. The
// function under test is pure and touches no DOM, which is why it lives in
// `lib/` rather than inside the sheet component.
import { describe, it, expect } from "vitest";
import { referralAmounts } from "@/lib/referral-amounts";
import type { ReferralSummary } from "@/lib/api/referral-controller";

function summary(overrides: Partial<ReferralSummary> = {}): ReferralSummary {
  return {
    code: "AB23CD",
    referrerCreditFcfa: 300,
    refereeCreditFcfa: 200,
    minQualifyingAmountFcfa: 500,
    maxRewardedPerReferrer: 10,
    joinedCount: 0,
    rewardedCount: 0,
    pendingCount: 0,
    totalEarnedFcfa: 0,
    ...overrides,
  };
}

describe("referralAmounts", () => {
  describe("FIXED", () => {
    it("formats both amounts as currency", () => {
      const amounts = referralAmounts(summary({ commissionType: "FIXED" }));
      expect(amounts.isPercentage).toBe(false);
      expect(amounts.referrerAmount).toContain("300");
      expect(amounts.refereeAmount).toContain("200");
      expect(amounts.referrerAmount).not.toContain("%");
    });

    it("keeps the qualifying minimum", () => {
      const amounts = referralAmounts(summary({ commissionType: "FIXED" }));
      expect(amounts.minQualifyingAmount).toContain("500");
    });
  });

  describe("PERCENTAGE", () => {
    const percentage = summary({
      commissionType: "PERCENTAGE",
      referrerCreditFcfa: 60,
      refereeCreditFcfa: 40,
      minQualifyingAmountFcfa: null,
    });

    // The whole point: the API sends 60 in both modes, so formatting as
    // currency regardless renders «60 %» as a derisory franc amount.
    it("renders the amounts as percentages, never as francs", () => {
      const amounts = referralAmounts(percentage);
      expect(amounts.isPercentage).toBe(true);
      expect(amounts.referrerAmount).toBe("60 %");
      expect(amounts.refereeAmount).toBe("40 %");
    });

    it("reports no qualifying minimum", () => {
      expect(referralAmounts(percentage).minQualifyingAmount).toBeNull();
    });
  });

  /**
   * An older backend during a rolling deploy sends neither field. Absent must
   * mean FIXED — the behaviour that existed before the type did — and a bare
   * interpolation of a missing threshold would print "undefined" at the user.
   */
  describe("an older backend", () => {
    it("treats a missing commission type as FIXED", () => {
      const amounts = referralAmounts(summary({ commissionType: undefined }));
      expect(amounts.isPercentage).toBe(false);
      expect(amounts.referrerAmount).toContain("300");
    });

    it.each([
      ["null", null],
      ["undefined", undefined as unknown as null],
    ])("drops the threshold clause when it is %s", (_label, min) => {
      const amounts = referralAmounts(
        summary({ minQualifyingAmountFcfa: min }),
      );
      expect(amounts.minQualifyingAmount).toBeNull();
    });
  });
});
