// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  cvFileProblem,
  formatFileSize,
  initialCvChoice,
  MAX_CV_BYTES,
} from "@/lib/profile-cv";

const uploaded = {
  fileName: "cv.pdf",
  sizeBytes: 1,
  mimeType: "application/pdf",
  uploadedAt: "2026-11-04T00:00:00Z",
};

describe("cvFileProblem", () => {
  it("takes PDF and Word", () => {
    expect(cvFileProblem({ name: "Mon CV.PDF", size: 10 })).toBeNull();
    expect(cvFileProblem({ name: "cv.docx", size: 10 })).toBeNull();
  });

  it("refuses other types, empty and oversized files", () => {
    expect(cvFileProblem({ name: "cv.jpg", size: 10 })).toMatch(/PDF/);
    expect(cvFileProblem({ name: "cv.doc", size: 10 })).toMatch(/PDF/);
    expect(cvFileProblem({ name: "cv.pdf", size: 0 })).toMatch(/vide/);
    expect(cvFileProblem({ name: "cv.pdf", size: MAX_CV_BYTES + 1 })).toMatch(
      /10 Mo/,
    );
  });
});

describe("initialCvChoice", () => {
  it("starts on the worker's own CV when it is their default", () => {
    expect(initialCvChoice({ uploaded, preferred: "UPLOADED" })).toBe("UPLOADED");
  });

  it("starts on the Rabotka CV otherwise", () => {
    expect(initialCvChoice({ uploaded, preferred: "RABOTKA" })).toBe("RABOTKA");
    expect(initialCvChoice({ uploaded: null, preferred: "UPLOADED" })).toBe(
      "RABOTKA",
    );
    expect(initialCvChoice(undefined)).toBe("RABOTKA");
  });
});

describe("formatFileSize", () => {
  it("reads in Ko, then Mo", () => {
    expect(formatFileSize(300)).toBe("1 Ko");
    expect(formatFileSize(250 * 1024)).toBe("250 Ko");
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2,5 Mo");
  });
});
