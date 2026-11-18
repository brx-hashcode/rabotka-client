// @vitest-environment node
import { describe, expect, it } from "vitest";
import { kycUploadState } from "@/lib/kyc-upload-state";

const url = "https://cdn.example.com/kyc-documents/x.jpg";

describe("kycUploadState()", () => {
  it("is complete with front, back and selfie", () => {
    expect(
      kycUploadState({
        documentType: "IDENTITY_CARD",
        kycDocumentUrl: url,
        kycDocumentBackUrl: url,
        kycSelfieUrl: url,
      }),
    ).toBe("complete");
  });

  it("needs no back for a passport", () => {
    expect(
      kycUploadState({
        documentType: "PASSPORT",
        kycDocumentUrl: url,
        kycSelfieUrl: url,
      }),
    ).toBe("complete");
  });

  it("is none when nothing was uploaded (« Plus tard »)", () => {
    expect(kycUploadState({ documentType: "IDENTITY_CARD" })).toBe("none");
    expect(kycUploadState(null)).toBe("none");
    expect(kycUploadState({ kycDocumentUrl: "  ", kycSelfieUrl: "" })).toBe(
      "none",
    );
  });

  it("is partial when a piece is missing", () => {
    expect(
      kycUploadState({ documentType: "IDENTITY_CARD", kycDocumentUrl: url }),
    ).toBe("partial");
    expect(
      kycUploadState({
        documentType: "IDENTITY_CARD",
        kycDocumentUrl: url,
        kycSelfieUrl: url,
      }),
    ).toBe("partial");
  });
});
