import type { CvChoice, ProfileCv } from "@/lib/api/profile-cv-controller";

/** Same cap as the server's: a CV is a few pages, not a scan of a book. */
export const MAX_CV_BYTES = 10 * 1024 * 1024;

export const CV_ACCEPT =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Why this file cannot be sent, or null. Checked before uploading so a phone
 * on a slow connection does not spend minutes sending what the server refuses.
 */
export function cvFileProblem(file: Pick<File, "name" | "size">): string | null {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
    return "Le CV doit être un PDF ou un fichier Word (.docx).";
  }
  if (file.size > MAX_CV_BYTES) return "Le CV ne doit pas dépasser 10 Mo.";
  if (file.size === 0) return "Ce fichier est vide.";
  return null;
}

/** Which CV the apply panel starts on: the default, when it can be honoured. */
export function initialCvChoice(cv: ProfileCv | undefined): CvChoice {
  return cv?.uploaded && cv.preferred === "UPLOADED" ? "UPLOADED" : "RABOTKA";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}
