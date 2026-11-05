// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { matchQuery } from "@tanstack/react-query";
import { refreshFor, refreshKeysFor } from "@/lib/notification-refresh";

/** Whether a screen's query is refreshed by this notification. */
const refreshes = (type: string, queryKey: readonly unknown[], metadata = {}) =>
  refreshKeysFor({ type, metadata }).some((key) =>
    matchQuery({ queryKey: key }, { queryKey, queryHash: JSON.stringify(queryKey) } as never),
  );

describe("refreshKeysFor", () => {
  it("a worker retained or refused sees their mission and applications move", () => {
    for (const type of ["APPLICATION_ACCEPTED", "APPLICATION_REJECTED"]) {
      expect(refreshes(type, ["worker", "missions", 20])).toBe(true);
      expect(refreshes(type, ["worker", "mission", "a1"])).toBe(true);
      expect(refreshes(type, ["profile", "applications", "infinite", 20])).toBe(true);
    }
  });

  it("an interview invitation refreshes the application it is for", () => {
    expect(refreshes("INTERVIEW_INVITED", ["worker", "mission", "a1"])).toBe(true);
  });

  it("an employer sees a new applicant on the offer at once", () => {
    expect(refreshes("NEW_APPLICATION", ["employer", "applications"])).toBe(true);
    expect(refreshes("NEW_APPLICATION", ["job-offer", "o1"])).toBe(true);
  });

  it("a payment or an unlock refreshes the wallet, invoices and contacts", () => {
    for (const key of [["profile", "wallet", "balance"], ["profile", "invoices"], ["profile", "contacts"], ["worker-mission", "a1", "unlock"]]) {
      expect(refreshes("PAYMENT_SUCCEEDED", key)).toBe(true);
    }
  });

  it("a message refreshes the discussions, a claim the claims", () => {
    expect(refreshes("NEW_MESSAGE", ["discussions", "thread", "c1"])).toBe(true);
    expect(refreshes("CLAIM_STATUS_CHANGED", ["profile", "claims", "x1"])).toBe(true);
  });

  it("an announcement only refreshes the list", () => {
    expect(refreshKeysFor({ type: "ANNOUNCEMENT" })).toEqual([["notifications"]]);
  });

  it("an unknown type refreshes both sides of an application", () => {
    expect(refreshes("SOMETHING_NEW", ["worker", "missions"])).toBe(true);
    expect(refreshes("SOMETHING_NEW", ["employer", "applications"])).toBe(true);
  });
});

describe("refreshFor", () => {
  it("invalidates each key", () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    refreshFor({ invalidateQueries } as never, { type: "NEW_MESSAGE" });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["discussions"] });
  });
});
