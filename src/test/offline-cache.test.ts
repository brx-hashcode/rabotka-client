// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  CACHE_SCHEMA,
  MAX_AGE_MS,
  isKept,
  isUsable,
  withoutContacts,
} from "@/lib/offline-cache";

describe("isKept — what may be stored on the phone", () => {
  it("keeps what the screens need offline", () => {
    for (const key of [
      ["profile", "me"],
      ["profile", "applications", 1, 20],
      ["job-feed", "x"],
      ["job-detail", "j1"],
      ["discussions", "thread", "d1"],
      ["notifications", "list"],
      ["employer", "applications"],
      ["worker", "missions", 20],
      ["profile", "portfolio"],
    ]) {
      expect(isKept(key), JSON.stringify(key)).toBe(true);
    }
  });

  it("never keeps unlocked contacts or payments", () => {
    for (const key of [
      ["profile", "contacts"],
      ["worker-mission", "m1", "unlock"],
      ["recommended-worker", "w1"],
      ["payment", "tok"],
    ]) {
      expect(isKept(key), JSON.stringify(key)).toBe(false);
    }
  });

  it("keeps nothing it was not told to", () => {
    expect(isKept(["ads"])).toBe(false);
    expect(isKept(["verify", "whatsapp", "t"])).toBe(false);
  });
});

describe("withoutContacts", () => {
  it("empties phone and e-mail fields at any depth, keeping the rest", () => {
    const application = {
      id: "a1",
      worker: { firstName: "Awa", phone: "+242061234567", email: "a@b.cg" },
      contacts: [{ direct_phone: "+242", whatsappNumber: "+242", city: "BZV" }],
      note: null,
    };
    expect(withoutContacts(application)).toEqual({
      id: "a1",
      worker: { firstName: "Awa", phone: null, email: null },
      contacts: [{ direct_phone: null, whatsappNumber: null, city: "BZV" }],
      note: null,
    });
  });
});

describe("isUsable", () => {
  const now = Date.UTC(2026, 9, 20);
  const record = (savedAt: number, schema = CACHE_SCHEMA) => ({
    schema,
    savedAt,
    profileId: "p1",
    state: { mutations: [], queries: [] },
  });

  it("restores a fresh record of this schema", () => {
    expect(isUsable(record(now - 1000), now)).toBe(true);
  });

  it("drops one older than a week, or of another schema", () => {
    expect(isUsable(record(now - MAX_AGE_MS - 1), now)).toBe(false);
    expect(isUsable(record(now, CACHE_SCHEMA + 1), now)).toBe(false);
    expect(isUsable(undefined, now)).toBe(false);
  });
});

describe("snapshot — what actually reaches IndexedDB", () => {
  it("never carries another person's phone, nor unlocked contacts", async () => {
    const { QueryClient } = await import("@tanstack/react-query");
    const { snapshot } = await import("@/lib/offline-cache");
    const client = new QueryClient();
    client.setQueryData(["profile", "me"], { id: "me", phone: "+242060000001" });
    client.setQueryData(["employer", "applications"], [
      { id: "a1", worker: { firstName: "Awa", phone: "+242069999999" } },
    ]);
    client.setQueryData(["profile", "contacts"], [{ phone: "+242068888888" }]);
    client.setQueryData(["ads"], { anything: true });

    const stored = snapshot(client);
    const json = JSON.stringify(stored);

    expect(stored.profileId).toBe("me");
    expect(stored.state.queries.map((q) => q.queryKey)).toEqual([
      ["profile", "me"],
      ["employer", "applications"],
    ]);
    // Their own number stays (their profile); nobody else's does.
    expect(json).toContain("+242060000001");
    expect(json).not.toContain("+242069999999");
    expect(json).not.toContain("+242068888888");
  });
});
