/**
 * What the offer screen's main button says and does. Pure, so the order of the
 * gates — which one wins when several apply — is pinned by a test rather than
 * by reading a chain of `else if`s in a page.
 *
 * A blocked button should still lead somewhere: "Déjà postulé", disabled, was a
 * dead end on the one screen a worker comes back to to check on an
 * application, and "Limite quotidienne atteinte" never said until when.
 */
export type ApplyButton =
  | { kind: "apply"; label: string }
  | { kind: "view-application"; label: string; to: string }
  | { kind: "blocked"; label: string; hint: string | null };

export function applyButton(input: {
  applied: boolean;
  /** The worker's LIVE application, or null (ended, rejected, cancelled). */
  applicationId: string | null;
  offerClosed: boolean;
  accountBlockedLabel: string | null;
  kycBlockedLabel: string | null;
  dailyExhausted: boolean;
  resetsAt: string | null;
  now?: Date;
}): ApplyButton {
  if (input.applied) {
    return {
      kind: "view-application",
      label: "Voir ma candidature",
      // A dead application has no detail to open, but it is still listed.
      to: input.applicationId
        ? `/applications/${input.applicationId}`
        : "/mes-candidatures",
    };
  }
  // About the offer, not the worker — so it is checked first.
  if (input.offerClosed)
    return { kind: "blocked", label: "Plus de place disponible", hint: null };
  // The account outranks KYC: clearing KYC changes nothing while suspended.
  if (input.accountBlockedLabel)
    return { kind: "blocked", label: input.accountBlockedLabel, hint: null };
  if (input.kycBlockedLabel)
    return { kind: "blocked", label: input.kycBlockedLabel, hint: null };
  if (input.dailyExhausted) {
    return {
      kind: "blocked",
      label: "Limite quotidienne atteinte",
      hint: input.resetsAt
        ? `Nouvelles candidatures ${quotaResetLabel(input.resetsAt, input.now)}`
        : null,
    };
  }
  return { kind: "apply", label: "Postuler" };
}

const DAY_MS = 86_400_000;

/**
 * "demain à 00:00", "lundi à 00:00", "le 12 nov. à 00:00" — in the phone's
 * time zone. The quota resets at the start of the next BUSINESS day, so after
 * a Friday it is Monday, not tomorrow.
 */
export function quotaResetLabel(resetsAt: string, now: Date = new Date()): string {
  const at = new Date(resetsAt);
  const time = at.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const days = Math.round((startOfDay(at) - startOfDay(now)) / DAY_MS);
  if (days <= 0) return `aujourd'hui à ${time}`;
  if (days === 1) return `demain à ${time}`;
  if (days < 7)
    return `${at.toLocaleDateString("fr-FR", { weekday: "long" })} à ${time}`;
  return `le ${at.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} à ${time}`;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
