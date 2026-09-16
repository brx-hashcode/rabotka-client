// @vitest-environment node
import { describe, expect, it } from "vitest";
import { claimedRows } from "./claimed-rows";

describe("claimedRows", () => {
  it("lists only what the partner sent", () => {
    expect(
      claimedRows({
        firstName: "Jean",
        lastName: "Mabiala",
        countryCode: null,
        city: null,
        documentType: null,
      }),
    ).toEqual([{ label: "Nom", value: "Jean Mabiala" }]);
  });

  it("names the country and the document in French", () => {
    const rows = claimedRows({
      firstName: "Jean",
      lastName: "Mabiala",
      countryCode: "cg",
      city: "Brazzaville",
      documentType: "PASSPORT",
    });
    expect(rows).toEqual([
      { label: "Nom", value: "Jean Mabiala" },
      { label: "Pays", value: expect.stringMatching(/Congo/) },
      { label: "Ville", value: "Brazzaville" },
      { label: "Pièce d'identité", value: "Passeport" },
    ]);
  });

  it("is empty once the claim was erased", () => {
    expect(claimedRows(null)).toEqual([]);
  });
});
