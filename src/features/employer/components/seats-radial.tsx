import { CHART_TRACK } from "../config/chart-colors";
import { cn } from "@/lib/utils";

/*
 * The seats dial — a radial meter, drawn by hand.
 *
 * Same reasoning as the dashboard charts next door: an arc is two SVG paths,
 * and recharts' RadialBarChart would put ~100 kB gzipped on an employer's
 * phone to draw them. This renders what the shadcn radial-with-text chart
 * renders — a track ring, a rounded accent arc, the figure in the middle —
 * with nothing added to the bundle.
 *
 * A ratio against a known limit is a meter, so the number leads and the arc
 * only gives it proportion. role="meter" carries that to assistive tech, since
 * an <svg> says nothing on its own.
 */

/** Degrees, 0 = twelve o'clock, growing clockwise — not SVG's x-axis convention. */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

/** A 270° dial: the gap sits at the bottom, where the caption goes. */
const START = -135;
const SWEEP = 270;
const SIZE = 120;
const CENTER = SIZE / 2;
const RADIUS = 50;
const THICKNESS = 10;

type Props = Readonly<{
  filled: number;
  total: number;
  className?: string;
}>;

export function SeatsRadial({ filled, total, className }: Props) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, filled / total)) : 0;
  const remaining = Math.max(0, total - filled);
  const label = `${filled} poste${filled > 1 ? "s" : ""} pourvu${
    filled > 1 ? "s" : ""
  } sur ${total}`;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className="relative shrink-0"
        role="meter"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-[92px] w-[92px]"
          aria-hidden
        >
          <path
            d={arcPath(CENTER, CENTER, RADIUS, START, START + SWEEP)}
            fill="none"
            stroke={CHART_TRACK}
            strokeWidth={THICKNESS}
            strokeLinecap="round"
          />
          {/* Skipped at zero on purpose: a round cap with no arc behind it
              leaves a dot that reads as a filled seat. */}
          {ratio > 0 && (
            <path
              d={arcPath(
                CENTER,
                CENTER,
                RADIUS,
                START,
                START + SWEEP * ratio,
              )}
              fill="none"
              /* The brand green, not the darker --chart-accent: this dial reads
                 as a Rabotka control, next to buttons in the same green. It
                 sits at 1.9:1 on the card, under the 3:1 a mark owes when it
                 alone carries the value — which is why the figure is printed in
                 the middle and repeated beside it. Against the track, where it
                 actually has to separate, it clears every CVD check (ΔE 16.2
                 light, 40.1 dark). */
              stroke="hsl(var(--whatsapp))"
              strokeWidth={THICKNESS}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}
        </svg>

        {/* HTML over the SVG rather than <text>: it inherits the app's font
            stack and text tokens, and stays selectable. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none text-foreground">
            {filled}
          </span>
          <span className="mt-0.5 text-[11px] leading-none text-muted-foreground">
            sur {total}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          Poste{total > 1 ? "s" : ""} pourvu{total > 1 ? "s" : ""}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {remaining === 0
            ? "Tous les postes sont pourvus."
            : `${remaining} poste${remaining > 1 ? "s" : ""} encore à pourvoir.`}
        </p>
      </div>
    </div>
  );
}
