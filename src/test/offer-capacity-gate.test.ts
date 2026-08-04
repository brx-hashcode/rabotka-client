// @vitest-environment node
// Pure predicates over an offer's status/counts — no DOM or React runtime.
import { describe, expect, it } from "vitest";

import {
  isClosedToNewCandidates,
  isClosedToApplications,
  closedToCandidatesReason,
} from "@/features/employer/config/job-status";
import type { JobOfferStatus } from "@/lib/api/job-offer-controller";

describe("isClosedToNewCandidates (employer accepting a candidature)", () => {
  it("blocks accepting once the offer is full", () => {
    // The backend flips an offer to FILLED the moment its accepted count
    // reaches `quantity`, then rejects any later accept with a 409.
    expect(isClosedToNewCandidates("FILLED")).toBe(true);
  });

  it("blocks accepting on a finished or cancelled offer", () => {
    expect(isClosedToNewCandidates("COMPLETED")).toBe(true);
    expect(isClosedToNewCandidates("CANCELLED")).toBe(true);
  });

  it("still allows accepting while seats remain", () => {
    expect(isClosedToNewCandidates("ACTIVE")).toBe(false);
    expect(isClosedToNewCandidates("PARTIALLY_FILLED")).toBe(false);
  });

  it("still allows accepting from an expired offer", () => {
    // The backend's accept guard checks capacity, not expiry — hiding the
    // action here would deny something the server would happily do.
    expect(isClosedToNewCandidates("EXPIRED")).toBe(false);
  });

  it("explains the block in the employer's words, and only when blocked", () => {
    expect(closedToCandidatesReason("FILLED")).toMatch(/pourvus/);
    expect(closedToCandidatesReason("CANCELLED")).toMatch(/annulée/);
    expect(closedToCandidatesReason("ACTIVE")).toBeNull();
  });
});

describe("isClosedToApplications (worker applying)", () => {
  const offer = (
    status: JobOfferStatus,
    acceptedCount?: number,
    quantity?: number,
  ) => ({ status, acceptedCount, quantity });

  it("allows applying only to open offers", () => {
    expect(isClosedToApplications(offer("ACTIVE"))).toBe(false);
    expect(isClosedToApplications(offer("PARTIALLY_FILLED"))).toBe(false);
  });

  it("is stricter than the employer rule: an expired offer is closed", () => {
    // The apply guard admits ACTIVE and PARTIALLY_FILLED only, so this diverges
    // from isClosedToNewCandidates by design. The two must not be merged.
    expect(isClosedToApplications(offer("EXPIRED"))).toBe(true);
    expect(isClosedToNewCandidates("EXPIRED")).toBe(false);
  });

  it("closes filled, completed and cancelled offers", () => {
    expect(isClosedToApplications(offer("FILLED"))).toBe(true);
    expect(isClosedToApplications(offer("COMPLETED"))).toBe(true);
    expect(isClosedToApplications(offer("CANCELLED"))).toBe(true);
  });

  it("closes an offer whose own counts say it is full", () => {
    // A feed row cached just before the offer filled still reads
    // PARTIALLY_FILLED; its counts are the fresher signal.
    expect(isClosedToApplications(offer("PARTIALLY_FILLED", 3, 3))).toBe(true);
    expect(isClosedToApplications(offer("PARTIALLY_FILLED", 2, 3))).toBe(false);
  });

  it("does not close an offer when counts are absent or degenerate", () => {
    // Endpoints that omit the counts must not be read as "full".
    expect(isClosedToApplications(offer("ACTIVE", undefined, undefined))).toBe(
      false,
    );
    expect(isClosedToApplications(offer("ACTIVE", 0, 0))).toBe(false);
  });
});
