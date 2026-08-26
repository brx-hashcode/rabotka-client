/**
 * Where a `?ref=` code waits between the landing page and the signup form.
 *
 * `localStorage`, deliberately not the onboarding store's `sessionStorage`.
 * Those two lifetimes are different on purpose: onboarding state is
 * session-scoped so KYC image references never outlive the tab, while a
 * referral attribution has to survive "I'll finish this tonight", a closed tab,
 * and the four onboarding steps between the link click and the code field on
 * the confirmation screen.
 *
 * Cleared on a completed signup so a shared phone — the common case here — does
 * not attribute the next person who registers on it to the same parrain.
 */

const STORAGE_KEY = "rabotka_referral";

/** Long enough to survive "I'll do it this weekend", short enough to expire. */
const TTL_DAYS = 30;

export type ReferralSource = "LINK" | "MANUAL_CODE";

export type ReferralAttribution = {
  code: string;
  source: ReferralSource;
  capturedAt: number;
};

/** Matches the codes the backend mints — see referral-code.util.ts. */
export const REFERRAL_CODE_PATTERN = /^[2-9A-HJ-NP-Z]{6}$/;

/**
 * Uppercase, strip the spaces and dashes people paste or add, and reject
 * anything that could not be a code. Returns null rather than throwing: a bad
 * code is an expected input here, not an error.
 */
export function normalizeReferralCode(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().toUpperCase().replace(/[\s-]/g, "");
  return REFERRAL_CODE_PATTERN.test(cleaned) ? cleaned : null;
}

export function readReferralAttribution(): ReferralAttribution | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<ReferralAttribution>;
    const code = normalizeReferralCode(parsed.code ?? null);
    if (!code || typeof parsed.capturedAt !== "number") return null;

    const ageMs = Date.now() - parsed.capturedAt;
    if (ageMs > TTL_DAYS * 24 * 60 * 60 * 1000) {
      clearReferralAttribution();
      return null;
    }

    return {
      code,
      source: parsed.source === "MANUAL_CODE" ? "MANUAL_CODE" : "LINK",
      capturedAt: parsed.capturedAt,
    };
  } catch {
    // Private mode, cleared site data, or a value someone else wrote. None of
    // these are worth breaking a signup over.
    return null;
  }
}

/**
 * Store a captured code. Returns the normalised code, or null if it was not one.
 *
 * First capture wins: someone who follows two different links keeps the parrain
 * who actually got them here, rather than whoever happened to be last.
 */
export function saveReferralAttribution(
  raw: string | null,
  source: ReferralSource = "LINK",
): string | null {
  const code = normalizeReferralCode(raw);
  if (!code) return null;

  const existing = readReferralAttribution();
  if (existing) return existing.code;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ code, source, capturedAt: Date.now() }),
    );
  } catch {
    // Storage full or blocked — the code is still in the URL for this visit,
    // and the field on the confirmation screen still accepts it by hand.
  }
  return code;
}

export function clearReferralAttribution(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do; the TTL will retire it.
  }
}
