/**
 * Chart mark colours, as CSS variables.
 *
 * The hex values and the validator findings that justify them live beside the
 * tokens in `styles/index.css` — kept there so the light and dark steps sit in
 * one place and cannot drift from each other. This module only names the roles.
 *
 * Two rules the values encode, worth knowing before changing anything here:
 *   - Slot order IS the colourblind-safety mechanism. These are slots 1–4 of a
 *     validated categorical theme; reordering or cycling them breaks the
 *     adjacent-pair separation the stack depends on.
 *   - In light mode two of the four fall under 3:1 against the card, which
 *     obliges *relief*: every segment carries a visible direct label and a
 *     legend, so a segment is never identified by colour alone.
 */

/** Single-series mark — sequential, one hue. */
export const CHART_ACCENT = "var(--chart-accent)";

/** Neutral track behind a meter or an empty bar. */
export const CHART_TRACK = "var(--chart-track)";

/**
 * The four offer stages, in fixed slot order.
 *
 * Eight raw statuses would blow past the series ceiling, and "Expirée" vs
 * "Annulée" is not a distinction an employer acts on differently at a glance —
 * so the statuses fold into four stages that map to real decisions: still
 * recruiting, staffed, delivered, over.
 */
export const STAGE_COLORS = {
  open: "var(--chart-stage-open)",
  staffed: "var(--chart-stage-staffed)",
  done: "var(--chart-stage-done)",
  closed: "var(--chart-stage-closed)",
} as const;

export type OfferStage = keyof typeof STAGE_COLORS;

export const STAGE_LABELS: Record<OfferStage, string> = {
  open: "Ouvertes",
  staffed: "Pourvues",
  done: "Terminées",
  closed: "Clôturées",
};

/** Stack, legend and table order — matches the validated slot order. */
export const STAGE_ORDER: readonly OfferStage[] = [
  "open",
  "staffed",
  "done",
  "closed",
];
