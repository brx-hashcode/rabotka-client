// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  RETURN_REFRESH_AFTER_MS,
  RETURN_REFRESH_KEYS,
  shouldRefreshOnReturn,
} from "@/lib/notification-refresh";

describe("refresh on return", () => {
  it("re-reads after 30 seconds away, not after a glance", () => {
    expect(shouldRefreshOnReturn(0, RETURN_REFRESH_AFTER_MS)).toBe(true);
    expect(shouldRefreshOnReturn(0, RETURN_REFRESH_AFTER_MS - 1)).toBe(false);
    expect(shouldRefreshOnReturn(null, Date.now())).toBe(false);
  });

  it("covers status, money, messages and both sides of an application", () => {
    const keys = RETURN_REFRESH_KEYS.map((k) => JSON.stringify(k));
    for (const key of [
      ["profile", "me"],
      ["profile", "wallet"],
      ["notifications"],
      ["discussions"],
      ["worker", "missions"],
      ["employer", "applications"],
    ]) {
      expect(keys).toContain(JSON.stringify(key));
    }
  });

  it("leaves the job feed alone: it would reorder under the thumb", () => {
    const keys = RETURN_REFRESH_KEYS.map((k) => JSON.stringify(k));
    expect(keys).not.toContain(JSON.stringify(["job-feed"]));
    expect(keys).not.toContain(JSON.stringify(["job-detail"]));
  });
});
