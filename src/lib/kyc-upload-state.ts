import { requiresBackSide, type DocumentType } from "@/lib/kyc-document-types";

/**
 * Where a person's identity documents stand before they are sent.
 *
 * - `complete`: front, selfie, and the back unless it is a passport.
 * - `none`: nothing uploaded — « Plus tard », sent later from the profile.
 * - `partial`: something but not everything. Never sent: half a set is a
 *   mistake to finish or clear, never a choice (the backend refuses it too).
 */
export type KycUploadState = "complete" | "none" | "partial";

type Uploaded = {
  documentType?: DocumentType | "" | null;
  kycDocumentUrl?: string | null;
  kycDocumentBackUrl?: string | null;
  kycSelfieUrl?: string | null;
};

const present = (value: string | null | undefined): boolean =>
  !!value && value.trim() !== "";

export function kycUploadState(k: Uploaded | null | undefined): KycUploadState {
  const front = present(k?.kycDocumentUrl);
  const back = present(k?.kycDocumentBackUrl);
  const selfie = present(k?.kycSelfieUrl);
  const needsBack = requiresBackSide(k?.documentType);

  if (front && selfie && (!needsBack || back)) return "complete";
  if (!front && !selfie && !back) return "none";
  return "partial";
}

/** The page where a signed-in person sends their identity documents. */
export const KYC_VERIFICATION_PATH = "/profile/verification";
