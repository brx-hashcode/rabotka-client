// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  REMOTE_LOCATION_LABEL,
  jobLocationDetail,
  jobLocationLabel,
} from "@/lib/job-location";

/**
 * How a job's location is printed.
 *
 * `address` is null for a remote job, and every card and detail screen needs a
 * string. Without one shared answer each screen invents its own placeholder, or
 * renders a bare pin icon with nothing beside it.
 */
describe("jobLocationLabel()", () => {
  it("names a remote job rather than leaving a gap", () => {
    expect(jobLocationLabel({ address: null, isRemote: true })).toBe(
      REMOTE_LOCATION_LABEL,
    );
  });

  it("returns the address for an on-site job", () => {
    expect(
      jobLocationLabel({ address: "12 rue Foch", isRemote: false }),
    ).toBe("12 rue Foch");
  });

  it("treats a missing address as remote rather than printing nothing", () => {
    // Offers created before the columns existed, and any row where the address
    // went missing — a blank line beside a pin icon reads as a broken screen.
    expect(jobLocationLabel({ address: null })).toBe(REMOTE_LOCATION_LABEL);
    expect(jobLocationLabel({ address: "   " })).toBe(REMOTE_LOCATION_LABEL);
  });

  it("ignores a stale address on a remote job", () => {
    // The server clears it, but an older cached payload may still carry one.
    expect(
      jobLocationLabel({ address: "12 rue Foch", isRemote: true }),
    ).toBe(REMOTE_LOCATION_LABEL);
  });
});

describe("jobLocationDetail()", () => {
  it("appends the city when it adds something", () => {
    expect(
      jobLocationDetail({ address: "12 rue Foch", city: "Dolisie" }),
    ).toBe("12 rue Foch, Dolisie");
  });

  it("does not repeat a city the address already names", () => {
    // The common case for offers written before the pickers existed, where the
    // city was typed into the free-text address. "Brazzaville, Brazzaville"
    // reads like a bug.
    expect(
      jobLocationDetail({
        address: "12 rue Foch, Brazzaville",
        city: "Brazzaville",
      }),
    ).toBe("12 rue Foch, Brazzaville");
    expect(
      jobLocationDetail({ address: "12 rue Foch, BRAZZAVILLE", city: "Brazzaville" }),
    ).toBe("12 rue Foch, BRAZZAVILLE");
  });

  it("falls back to the city alone when there is no address", () => {
    expect(jobLocationDetail({ address: null, city: "Owando" })).toBe("Owando");
  });

  it("says remote regardless of what else is present", () => {
    expect(
      jobLocationDetail({
        address: "12 rue Foch",
        city: "Dolisie",
        isRemote: true,
      }),
    ).toBe(REMOTE_LOCATION_LABEL);
  });
});
