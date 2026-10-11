// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isOfferDeletable, waitingApplicantCount } from "./job-offer-delete";

describe("isOfferDeletable", () => {
  it("allows an open offer with no candidate", () => {
    expect(isOfferDeletable("ACTIVE", [])).toBe(true);
    expect(isOfferDeletable("EXPIRED", [])).toBe(true);
  });

  it("allows it while candidates are only waiting, rejected or cancelled", () => {
    expect(
      isOfferDeletable("ACTIVE", ["PENDING", "VIEWED", "REJECTED", "CANCELLED"]),
    ).toBe(true);
  });

  it.each(["WAITING_PAYMENT", "ACCEPTED", "STARTED", "END"])(
    "refuses once a candidate is %s",
    (status) => {
      expect(isOfferDeletable("ACTIVE", ["PENDING", status])).toBe(false);
    },
  );

  it.each(["PARTIALLY_FILLED", "FILLED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])(
    "refuses a %s offer",
    (status) => {
      expect(isOfferDeletable(status, [])).toBe(false);
    },
  );
});

describe("waitingApplicantCount", () => {
  it("counts only the candidates a delete would close", () => {
    expect(
      waitingApplicantCount(["PENDING", "VIEWED", "REJECTED", "CANCELLED"]),
    ).toBe(2);
  });
});
