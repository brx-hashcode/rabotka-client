// @vitest-environment node
import { describe, expect, it } from "vitest";

import { safeDestination } from "@/lib/safe-destination";

/**
 * This value arrives in a URL a stranger can construct — `…/s/<anything>` —
 * and the result is handed to `navigate()`. An open redirect here would be a
 * worse bug than the dead link it replaces, so the rejections matter more than
 * the happy path.
 */
describe("safeDestination", () => {
  it("turns a bare path into an in-app path", () => {
    // The real case: mint() failed, so the button carried the destination.
    expect(safeDestination("profile")).toBe("/profile");
    expect(safeDestination("claims/new")).toBe("/claims/new");
    expect(safeDestination("/mes-candidatures")).toBe("/mes-candidatures");
  });

  it("decodes percent-encoding before deciding", () => {
    expect(safeDestination("job-offers%2Fnew")).toBe("/job-offers/new");
  });

  it("refuses anything with a scheme", () => {
    expect(safeDestination("https://evil.test")).toBeNull();
    expect(safeDestination("http://evil.test")).toBeNull();
    expect(safeDestination("javascript:alert(1)")).toBeNull();
    expect(safeDestination("HTTPS://evil.test")).toBeNull();
    expect(safeDestination("https%3A%2F%2Fevil.test")).toBeNull();
  });

  it("refuses protocol-relative and backslash forms", () => {
    // `//evil.test` is a URL to another host, not a path.
    expect(safeDestination("//evil.test")).toBeNull();
    expect(safeDestination("///evil.test")).toBeNull();
    expect(safeDestination("\\\\evil.test")).toBeNull();
    expect(safeDestination("/\\evil.test")).toBeNull();
  });

  it("refuses traversal", () => {
    expect(safeDestination("../etc/passwd")).toBeNull();
    expect(safeDestination("profile/../../etc")).toBeNull();
    expect(safeDestination("..%2Fetc")).toBeNull();
  });

  it("refuses empty input", () => {
    expect(safeDestination("")).toBeNull();
    expect(safeDestination("   ")).toBeNull();
    expect(safeDestination("/")).toBeNull();
  });

  it("keeps a dotted segment that is not traversal", () => {
    expect(safeDestination("p/awa.menagere")).toBe("/p/awa.menagere");
  });
});
