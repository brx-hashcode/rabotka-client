import { kycDocumentsContent } from "@/content/onboarding";

/**
 * The identity documents Rabotka accepts for KYC.
 *
 * Mirrors the backend's `DocumentType` enum (rabotka-backend/prisma/schema.prisma).
 * Order is the order the select offers them in.
 *
 * Kept deliberately short: birth certificates and student cards are not identity
 * proof, and an "other" bucket produces submissions no reviewer can judge
 * consistently. Adding a type here means adding it to the Prisma enum too.
 */
export const KYC_DOCUMENT_TYPES = [
  "IDENTITY_CARD",
  "PASSPORT",
  "DRIVER_LICENSE",
  "NIU_CARD",
] as const;

export type DocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

/**
 * Types whose back must be photographed too.
 *
 * A passport is the sole exception: its photo page carries every field a
 * reviewer needs. Every other document splits its data across two sides — issue
 * and expiry dates, signature and the machine-readable strip all live on the
 * back — so the front alone cannot be verified.
 *
 * This is the single place the exemption is expressed client-side; the upload
 * form, the step-3 schema and the confirmation view all read it from here.
 */
export function requiresBackSide(
  documentType: DocumentType | "" | null | undefined,
): boolean {
  return !!documentType && documentType !== "PASSPORT";
}

const LABELS_BY_TYPE: Record<DocumentType, string> = {
  IDENTITY_CARD: kycDocumentsContent.documentType.options.identityCard,
  PASSPORT: kycDocumentsContent.documentType.options.passport,
  DRIVER_LICENSE: kycDocumentsContent.documentType.options.driverLicense,
  NIU_CARD: kycDocumentsContent.documentType.options.niuCard,
};

/** French label for a stored type, or `null` for none/unknown. */
export function documentTypeLabel(
  documentType: DocumentType | "" | null | undefined,
): string | null {
  if (!documentType) return null;
  return LABELS_BY_TYPE[documentType] ?? null;
}

/** Value/label pairs for the document-type select, in display order. */
export const KYC_DOCUMENT_TYPE_OPTIONS = KYC_DOCUMENT_TYPES.map((value) => ({
  value,
  label: LABELS_BY_TYPE[value],
}));
