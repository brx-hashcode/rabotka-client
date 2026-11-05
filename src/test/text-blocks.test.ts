// @vitest-environment node
import { describe, expect, it } from "vitest";
import { toTextBlocks } from "@/lib/text-blocks";

describe("toTextBlocks", () => {
  it("keeps a heading line and turns its dash lines into one list", () => {
    expect(
      toTextBlocks("Missions :\n- Faire les rondes.\n- Contrôler les accès."),
    ).toEqual([
      { kind: "paragraph", lines: ["Missions :"] },
      {
        kind: "list",
        ordered: false,
        items: ["Faire les rondes.", "Contrôler les accès."],
      },
    ]);
  });

  it("splits on blank lines and reads •, * and numbers", () => {
    expect(toTextBlocks("Intro\n\n• Un\n* Deux\n\n1. Premier\n2) Second")).toEqual([
      { kind: "paragraph", lines: ["Intro"] },
      { kind: "list", ordered: false, items: ["Un", "Deux"] },
      { kind: "list", ordered: true, items: ["Premier", "Second"] },
    ]);
  });

  it("leaves a dash inside a sentence alone", () => {
    expect(toTextBlocks("Poto-Poto - centre-ville")).toEqual([
      { kind: "paragraph", lines: ["Poto-Poto - centre-ville"] },
    ]);
  });

  it("does not take a bare dash without a space for a bullet", () => {
    expect(toTextBlocks("-5 % sur le prix")).toEqual([
      { kind: "paragraph", lines: ["-5 % sur le prix"] },
    ]);
  });

  it("handles Windows line endings", () => {
    expect(toTextBlocks("A\r\n- b")).toEqual([
      { kind: "paragraph", lines: ["A"] },
      { kind: "list", ordered: false, items: ["b"] },
    ]);
  });
});
