// @vitest-environment node
import { describe, expect, it } from "vitest";
import { applyButton, quotaResetLabel } from "@/lib/apply-button";

const open = {
  applied: false,
  applicationId: null,
  offerClosed: false,
  accountBlockedLabel: null,
  kycBlockedLabel: null,
  dailyExhausted: false,
  resetsAt: null,
};

describe("applyButton", () => {
  it("offers to apply when nothing blocks", () => {
    expect(applyButton(open)).toEqual({ kind: "apply", label: "Postuler" });
  });

  it("leads to the live application once applied", () => {
    expect(applyButton({ ...open, applied: true, applicationId: "a1" })).toEqual({
      kind: "view-application",
      label: "Voir ma candidature",
      to: "/applications/a1",
    });
  });

  it("falls back to the list for an application that is no longer live", () => {
    const b = applyButton({ ...open, applied: true });
    expect(b.kind === "view-application" && b.to).toBe("/mes-candidatures");
  });

  it("puts the offer before the worker, and the account before KYC", () => {
    const all = {
      ...open,
      offerClosed: true,
      accountBlockedLabel: "Compte suspendu",
      kycBlockedLabel: "Identité à vérifier",
      dailyExhausted: true,
    };
    expect(applyButton(all).label).toBe("Plus de place disponible");
    expect(applyButton({ ...all, offerClosed: false }).label).toBe("Compte suspendu");
    expect(
      applyButton({ ...all, offerClosed: false, accountBlockedLabel: null }).label,
    ).toBe("Identité à vérifier");
  });

  it("says when the daily limit resets", () => {
    const b = applyButton({
      ...open,
      dailyExhausted: true,
      resetsAt: new Date(2026, 9, 21, 0, 0).toISOString(),
      now: new Date(2026, 9, 20, 15, 0),
    });
    expect(b).toEqual({
      kind: "blocked",
      label: "Limite quotidienne atteinte",
      hint: "Nouvelles candidatures demain à 00:00",
    });
  });
});

describe("applyButton offline", () => {
  it("waits for the network, but still leads to an existing application", () => {
    expect(applyButton({ ...open, offline: true })).toEqual({
      kind: "blocked",
      label: "Postuler",
      hint: "Disponible une fois connecté",
    });
    expect(
      applyButton({ ...open, offline: true, applied: true, applicationId: "a1" })
        .kind,
    ).toBe("view-application");
  });
});

describe("quotaResetLabel", () => {
  const friday = new Date(2026, 9, 23, 18, 0); // Fri 23 Oct 2026

  it("names the weekday when the reset skips the weekend", () => {
    expect(quotaResetLabel(new Date(2026, 9, 26, 0, 0).toISOString(), friday)).toBe(
      "lundi à 00:00",
    );
  });

  it("falls back to a date beyond a week", () => {
    expect(
      quotaResetLabel(new Date(2026, 10, 12, 0, 0).toISOString(), friday),
    ).toMatch(/^le 12 nov\.? à 00:00$/);
  });
});
