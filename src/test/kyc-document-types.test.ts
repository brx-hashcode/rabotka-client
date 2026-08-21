// @vitest-environment node
// Pure schema and label logic — no DOM needed, and the shared jsdom
// environment currently fails to load its native `canvas` binding.
import { describe, it, expect } from "vitest";
import {
  KYC_DOCUMENT_TYPES,
  KYC_DOCUMENT_TYPE_OPTIONS,
  documentTypeLabel,
  requiresBackSide,
  shouldDropBackSide,
} from "@/lib/kyc-document-types";
import { kycDocumentGuidance } from "@/content/onboarding";
import { step3Schema } from "@/lib/validations/onboarding";

const imageFile = (name = "doc.jpg") =>
  new File([new Uint8Array([1, 2, 3])], name, { type: "image/jpeg" });

describe("KYC document types", () => {
  it("accepts exactly the four verifiable types", () => {
    expect([...KYC_DOCUMENT_TYPES]).toEqual([
      "IDENTITY_CARD",
      "PASSPORT",
      "DRIVER_LICENSE",
      "NIU_CARD",
    ]);
  });

  it("offers a French label for every type", () => {
    for (const type of KYC_DOCUMENT_TYPES) {
      expect(documentTypeLabel(type)).toBeTruthy();
    }
    expect(KYC_DOCUMENT_TYPE_OPTIONS).toHaveLength(KYC_DOCUMENT_TYPES.length);
  });

  it("has no label for an unset or unknown type", () => {
    expect(documentTypeLabel("")).toBeNull();
    expect(documentTypeLabel(null)).toBeNull();
  });
});

describe("requiresBackSide", () => {
  it("exempts only the passport", () => {
    // A passport carries every field on its photo page; the others split their
    // data across two sides.
    expect(requiresBackSide("PASSPORT")).toBe(false);
    expect(requiresBackSide("IDENTITY_CARD")).toBe(true);
    expect(requiresBackSide("DRIVER_LICENSE")).toBe(true);
    expect(requiresBackSide("NIU_CARD")).toBe(true);
  });

  it("asks for nothing before a type is chosen", () => {
    expect(requiresBackSide("")).toBe(false);
    expect(requiresBackSide(null)).toBe(false);
  });
});

describe("step3Schema", () => {
  const base = {
    kycDocument: imageFile("front.jpg"),
    kycSelfie: imageFile("selfie.jpg"),
  };

  it("rejects a non-passport submission with no back", () => {
    const result = step3Schema.safeParse({
      ...base,
      documentType: "IDENTITY_CARD",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      // The error must land on the field so it renders under the verso zone
      // rather than at the top of the form.
      expect(result.error.issues[0]?.path).toEqual(["kycDocumentBack"]);
    }
  });

  it("accepts a non-passport submission with a back", () => {
    const result = step3Schema.safeParse({
      ...base,
      documentType: "DRIVER_LICENSE",
      kycDocumentBack: imageFile("back.jpg"),
    });

    expect(result.success).toBe(true);
  });

  it("accepts a passport with no back", () => {
    const result = step3Schema.safeParse({
      ...base,
      documentType: "PASSPORT",
    });

    expect(result.success).toBe(true);
  });

  it("still requires a document type to be chosen", () => {
    const result = step3Schema.safeParse({ ...base, documentType: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["documentType"]);
    }
  });

  it("rejects a removed document type", () => {
    const result = step3Schema.safeParse({
      ...base,
      documentType: "OTHER",
    });

    expect(result.success).toBe(false);
  });
});

describe("shouldDropBackSide", () => {
  it("drops a verso once the user picks a passport", () => {
    expect(shouldDropBackSide("PASSPORT", true)).toBe(true);
  });

  it("keeps the verso for types that have one", () => {
    expect(shouldDropBackSide("IDENTITY_CARD", true)).toBe(false);
    expect(shouldDropBackSide("NIU_CARD", true)).toBe(false);
    expect(shouldDropBackSide("DRIVER_LICENSE", true)).toBe(false);
  });

  it("never drops before a type is chosen", () => {
    // The regression this exists for: the form's defaultValues snapshot an
    // empty documentType, and the store hydrates asynchronously after it. An
    // unchosen type also "needs no back", so a plain !requiresBackSide check
    // deleted the verso the user had already uploaded, on every reload.
    expect(shouldDropBackSide("", true)).toBe(false);
    expect(shouldDropBackSide(null, true)).toBe(false);
    expect(shouldDropBackSide(undefined, true)).toBe(false);
  });

  it("does nothing when there is no verso to drop", () => {
    expect(shouldDropBackSide("PASSPORT", false)).toBe(false);
  });
});

describe("kycDocumentGuidance", () => {
  it("names the document in every zone of every type", () => {
    for (const type of KYC_DOCUMENT_TYPES) {
      const guidance = kycDocumentGuidance[type];
      expect(guidance, `missing guidance for ${type}`).toBeDefined();
      expect(guidance.front.label).toBeTruthy();
      expect(guidance.front.description).toBeTruthy();
      expect(guidance.selfie.label).toBeTruthy();
      expect(guidance.selfie.description).toBeTruthy();
    }
  });

  it("gives a verso to exactly the types that have one", () => {
    for (const type of KYC_DOCUMENT_TYPES) {
      expect(
        Boolean(kycDocumentGuidance[type].back),
        `back copy mismatch for ${type}`,
      ).toBe(requiresBackSide(type));
    }
  });
});
