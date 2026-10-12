import type { CancellationPreview } from "@/lib/api/worker-mission-controller";

export type SuspensionWarning =
  | { level: "none" }
  /** One counted cancellation away from suspension, after this one. */
  | { level: "last-chance"; text: string }
  /** This cancellation suspends the account. */
  | { level: "suspends"; text: string };

/**
 * What the cancel drawer warns about the repeated-cancellation rule, from the
 * server's preview. Nothing when this cancellation does not count (an
 * application still pending) or the rule is off.
 */
export function suspensionWarning(
  preview: CancellationPreview | undefined,
): SuspensionWarning {
  if (!preview?.countsTowardSuspension) return { level: "none" };
  const days = preview.windowDays ?? 0;
  const threshold = preview.suspensionThreshold ?? 0;
  if (preview.wouldSuspend) {
    return {
      level: "suspends",
      text: `C'est votre ${threshold}e annulation de mission en ${days} jours : votre compte sera suspendu. Seule l'équipe Rabotka pourra le réactiver.`,
    };
  }
  if (preview.remainingBeforeSuspension === 1) {
    return {
      level: "last-chance",
      text: `Encore une annulation de mission dans les ${days} jours et votre compte sera suspendu.`,
    };
  }
  return { level: "none" };
}

/** Shown on every cancellation: the employer will see the worker less. */
export const COMPATIBILITY_NOTICE =
  "Annuler réduit votre compatibilité avec ce recruteur : ses offres vous seront moins proposées, et votre profil lui sera moins recommandé.";

/**
 * Reliability points this cancellation costs, from the preview. A server older
 * than `totalScoreDeduction` only charged late cancellations.
 */
export function reliabilityLoss(
  preview: CancellationPreview | undefined,
): number {
  if (!preview) return 0;
  if (typeof preview.totalScoreDeduction === "number") {
    return Math.max(0, preview.totalScoreDeduction);
  }
  return preview.wouldPenalize ? preview.scoreDeduction : 0;
}
