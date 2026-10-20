// @vitest-environment node
import { describe, expect, it } from "vitest";
import { activeTab } from "@/features/navigation/config/active-tab";

const tabs = [
  { to: "/home", match: ["/offres"] },
  { to: "/mes-candidatures" },
  { to: "/applications", match: ["/missions"] },
  { to: "/profile", match: ["/claims"] },
];
const to = (path: string, last: string | null = null) =>
  activeTab(path, tabs, last)?.to ?? null;

describe("activeTab", () => {
  it("lights a tab on its own path, whatever came before", () => {
    expect(to("/profile", "/home")).toBe("/profile");
  });

  it("keeps the tab the person came from on a detail screen", () => {
    // /applications/:id is reachable from both Candidatures and Missions.
    expect(to("/applications/a1", "/mes-candidatures")).toBe("/mes-candidatures");
    expect(to("/applications/a1", "/applications")).toBe("/applications");
  });

  it("falls back to prefixes when arriving cold", () => {
    expect(to("/offres/42")).toBe("/home");
    expect(to("/applications/a1")).toBe("/applications");
    expect(to("/missions/m1")).toBe("/applications");
    expect(to("/claims/c1")).toBe("/profile");
  });

  it("matches whole path segments only", () => {
    expect(to("/offres-archive")).toBeNull();
  });

  it("lights nothing on a screen that belongs to no tab", () => {
    expect(to("/notifications")).toBeNull();
  });

  it("ignores a remembered tab the current bar does not have", () => {
    expect(to("/offres/42", "/jobs")).toBe("/home");
  });
});
