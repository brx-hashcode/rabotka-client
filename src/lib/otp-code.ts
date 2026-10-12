/** Length of the codes the API sends (login and signup). */
export const OTP_LENGTH = 6;

/**
 * A maximal run of digits, single spaces or hyphens allowed between them
 * (« 123 456 », « 123-456 »). Taking whole runs, then keeping one of exactly
 * six digits, means a code is never cut out of a longer number
 * (« 12 34 56 78 ») nor stitched to the next one.
 *
 * No lookbehind: older iOS WebKit — WhatsApp's in-app browser — rejects it as
 * a syntax error, which would take the whole bundle down.
 */
const DIGIT_RUNS = /\d(?:[ -]?\d)*/g;

/**
 * The code in whatever was pasted, suggested or copied: the bare code, the
 * code with spaces, or the whole WhatsApp message (« Votre code Rabotka est
 * 123456. Valable 5 min »). Null when no run has exactly six digits.
 */
export function extractOtpCode(text: string | null | undefined): string | null {
  if (!text) return null;
  for (const run of text.match(DIGIT_RUNS) ?? []) {
    const digits = run.replace(/\D/g, "");
    if (digits.length === OTP_LENGTH) return digits;
  }
  return null;
}
