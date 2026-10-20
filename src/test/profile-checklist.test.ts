// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  profileChecklist,
  whatsAppShareLink,
} from "@/features/portfolio/profile-checklist";

const bare = { avatarUrl: null, description: "", categoryIds: [] as string[] };

describe("profileChecklist", () => {
  it("starts at zero for an empty profile", () => {
    const { steps, percent } = profileChecklist(bare, 0);
    expect(percent).toBe(0);
    expect(steps.every((s) => !s.done)).toBe(true);
  });

  it("counts publications up to the target", () => {
    const { steps } = profileChecklist(bare, 1);
    const pubs = steps.find((s) => s.key === "publications");
    expect(pubs?.label).toBe("Publier 3 réalisations (1/3)");
    expect(pubs?.done).toBe(false);
    expect(
      profileChecklist(bare, 7).steps.find((s) => s.key === "publications")
        ?.label,
    ).toContain("(3/3)");
  });

  it("reaches 100 % with a photo, a real bio, a domain and 3 publications", () => {
    const { percent } = profileChecklist(
      {
        avatarUrl: "a.jpg",
        description: "Plombier depuis dix ans à Brazzaville",
        categoryIds: ["c1"],
      },
      3,
    );
    expect(percent).toBe(100);
  });

  it("does not count a two-word bio", () => {
    const { steps } = profileChecklist({ ...bare, description: "Plombier" }, 0);
    expect(steps.find((s) => s.key === "bio")?.done).toBe(false);
  });
});

it("builds a WhatsApp share link carrying the portfolio URL", () => {
  const link = whatsAppShareLink("Awa M", "https://www.rabotka.work/p/awa");
  expect(link.startsWith("https://wa.me/?text=")).toBe(true);
  expect(decodeURIComponent(link)).toContain("https://www.rabotka.work/p/awa");
});
