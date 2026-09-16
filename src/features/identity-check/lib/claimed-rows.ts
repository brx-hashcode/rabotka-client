import { identityCheckContent } from "@/content/identity-check/consent";
import type { IdentityCheckRequest } from "@/lib/api/identity-check-controller";

export type ClaimedRow = { label: string; value: string };

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["fr"], { type: "region" });
  } catch {
    return null;
  }
})();

function countryName(code: string): string {
  try {
    return regionNames?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/**
 * The partner's claim as label/value rows, skipping what was not sent.
 * Shown to the person so they can tell whether the request is really about
 * them before answering.
 */
export function claimedRows(
  claimed: IdentityCheckRequest["claimed"],
): ClaimedRow[] {
  if (!claimed) return [];
  const { claimed: labels, documentTypes } = identityCheckContent;

  const rows: ClaimedRow[] = [
    {
      label: labels.name,
      value: `${claimed.firstName} ${claimed.lastName}`.trim(),
    },
  ];
  if (claimed.countryCode) {
    rows.push({ label: labels.country, value: countryName(claimed.countryCode) });
  }
  if (claimed.city) rows.push({ label: labels.city, value: claimed.city });
  if (claimed.documentType) {
    rows.push({
      label: labels.document,
      value: documentTypes[claimed.documentType],
    });
  }
  return rows;
}
