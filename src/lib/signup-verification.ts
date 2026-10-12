/**
 * The proof, from the WhatsApp code, that the person signing up holds the
 * phone number they typed. The API requires its token on every KYC upload
 * and on the account creation.
 */
export type SignupVerification = {
  token: string;
  /** The number the code was sent to, as the API normalises it. */
  phone: string;
  /** Epoch ms after which the API no longer accepts the token. */
  expiresAt: number;
};

/** The API's normalisation of a phone number: trimmed, lower-cased. */
export function normalizeSignupPhone(phone: string): string {
  return phone.trim().toLowerCase();
}

/**
 * Whether `verification` still covers `phone`: same number, and not about to
 * expire. A minute of margin, so a step started just before expiry does not
 * fail half-way through an upload.
 */
export function isSignupVerified(
  verification: SignupVerification | null | undefined,
  phone: string,
  now: number = Date.now(),
): boolean {
  if (!verification?.token) return false;
  if (verification.phone !== normalizeSignupPhone(phone)) return false;
  return verification.expiresAt - 60_000 > now;
}

/** The API's refusal when the token is missing, expired or spent. */
export function isSignupVerificationError(error: unknown): boolean {
  return (
    error instanceof Error && /vérifiez votre numéro/i.test(error.message)
  );
}
