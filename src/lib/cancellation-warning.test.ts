// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { CancellationPreview } from "@/lib/api/worker-mission-controller";
import { reliabilityLoss, suspensionWarning } from "./cancellation-warning";

const base: CancellationPreview = {
  wouldPenalize: false,
  penaltyFcfa: 5000,
  thresholdHours: 4,
  scoreDeduction: 5,
  affectsCompatibility: true,
  countsTowardSuspension: true,
  cancellationsInWindow: 0,
  suspensionThreshold: 3,
  windowDays: 30,
  wouldSuspend: false,
  remainingBeforeSuspension: 2,
};

describe("suspensionWarning", () => {
  it("says nothing while there is room left", () => {
    expect(suspensionWarning(base).level).toBe("none");
  });

  it("warns when one more would suspend", () => {
    const w = suspensionWarning({
      ...base,
      cancellationsInWindow: 1,
      remainingBeforeSuspension: 1,
    });
    expect(w.level).toBe("last-chance");
  });

  it("says plainly that this one suspends", () => {
    const w = suspensionWarning({
      ...base,
      cancellationsInWindow: 2,
      wouldSuspend: true,
      remainingBeforeSuspension: 0,
    });
    expect(w).toMatchObject({ level: "suspends" });
    if (w.level === "suspends") expect(w.text).toContain("3e annulation");
  });

  it("says nothing about a pending application, which does not count", () => {
    expect(
      suspensionWarning({
        ...base,
        countsTowardSuspension: false,
        wouldSuspend: false,
        remainingBeforeSuspension: 1,
      }).level,
    ).toBe("none");
  });

  it("says nothing to an older server without the rule", () => {
    expect(
      suspensionWarning({
        wouldPenalize: false,
        penaltyFcfa: 0,
        thresholdHours: 4,
        scoreDeduction: 5,
      }).level,
    ).toBe("none");
  });
});

describe("reliabilityLoss", () => {
  it("uses the total the server computed", () => {
    expect(reliabilityLoss({ ...base, totalScoreDeduction: 3 })).toBe(3);
  });

  it("falls back to the late deduction on an older server", () => {
    expect(
      reliabilityLoss({
        wouldPenalize: true,
        penaltyFcfa: 5000,
        thresholdHours: 4,
        scoreDeduction: 5,
      }),
    ).toBe(5);
  });

  it("is nothing for an early cancellation on an older server", () => {
    expect(
      reliabilityLoss({
        wouldPenalize: false,
        penaltyFcfa: 5000,
        thresholdHours: 4,
        scoreDeduction: 5,
      }),
    ).toBe(0);
  });
});
