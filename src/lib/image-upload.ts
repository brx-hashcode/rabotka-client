/**
 * What an image picker in this app may offer, in one place.
 *
 * Four different hand-rolled strings existed — claims took
 * `image/*,.pdf,.doc,.docx`, portfolio `image/jpeg,image/png,image/webp`, the
 * avatar its own ordering, KYC a bare `image/*` — so tightening one left the
 * others as they were.
 *
 * These MUST stay in step with the backend's `ALLOWED_IMAGE_MIME_TYPES`. A
 * looser value here does not open anything up; it only turns a refusal the user
 * sees in the file dialog into a 400 they see after waiting for an upload.
 */

/**
 * Deliberately NOT `image/*`.
 *
 * `image/*` admits SVG, which the server refuses because these files are served
 * from a public CDN and an SVG can carry script; and HEIC, which an iPhone
 * offers natively and the server also refuses.
 */
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

/** Per file, matching the server's limit. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Per claim and per comment. The server allows 5; the UI keeps 3. */
export const MAX_CLAIM_ATTACHMENTS = 3;

/** Human-readable list for helper copy, so it cannot drift from IMAGE_ACCEPT. */
export const IMAGE_FORMATS_LABEL = "JPG, PNG, WEBP";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "avif"];

/**
 * Whether a stored url is worth putting in an `<img>`.
 *
 * Needed for what is ALREADY in the database. Claims accepted PDF and DOC until
 * now, and three render sites assume every attachment is an image — so an old
 * PDF renders as a broken image with no explanation. This lets those sites show
 * a file tile instead.
 *
 * Looser than the upload allowlist on purpose: this asks "will a browser
 * probably paint this", not "would we accept it today". `gif` and `avif` are
 * here because old rows may hold them.
 */
export function looksLikeImageUrl(url: string): boolean {
  const path = url.split("?")[0].split("#")[0];
  const dot = path.lastIndexOf(".");
  if (dot <= 0 || dot === path.length - 1) return false;
  return IMAGE_EXTENSIONS.includes(path.slice(dot + 1).toLowerCase());
}

/** The last path segment, for labelling a non-image attachment. */
export function fileNameFromUrl(url: string, fallback = "fichier"): string {
  try {
    const path = new URL(url, window.location.origin).pathname;
    return decodeURIComponent(path.split("/").filter(Boolean).pop() ?? fallback);
  } catch {
    return fallback;
  }
}
