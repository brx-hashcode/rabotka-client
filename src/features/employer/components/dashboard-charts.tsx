import { useId, useState } from "react";

import { cn, formatAmount } from "@/lib/utils";
import {
  CHART_ACCENT,
  CHART_TRACK,
  STAGE_COLORS,
  STAGE_LABELS,
  STAGE_ORDER,
} from "../config/chart-colors";
import type { FillRate, SpendPoint, StageCount } from "../config/dashboard-metrics";

/*
 * These three forms are drawn by hand rather than with a charting library.
 *
 * A meter, a stacked bar and a column chart are a div, a flex row and a handful
 * of rects — recharts would add ~100 kB gzipped to a screen served over
 * Congolese mobile data, for shapes that cost nothing to draw. It would also
 * bring its own tooltip behaviour, which is poor under touch.
 */

/** Section wrapper — borderless card, matching the rest of the app. */
function ChartCard({
  title,
  hint,
  children,
}: Readonly<{ title: string; hint?: string; children: React.ReactNode }>) {
  return (
    <section className="bg-card shadow-soft rounded-xl p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function EmptyNote({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p className="py-6 text-center text-xs text-muted-foreground">{children}</p>
  );
}

/**
 * Positions filled, as a meter.
 *
 * A single ratio against a limit is a meter, not a chart — one bar in a bar
 * chart would be a chart pretending to be one. The figure leads because the
 * number is what the employer acts on; the track just gives it proportion.
 */
export function FillRateMeter({ rate }: Readonly<{ rate: FillRate }>) {
  const pct = Math.round(rate.ratio * 100);
  const remaining = Math.max(0, rate.total - rate.filled);

  return (
    <ChartCard
      title="Postes pourvus"
      hint="Sur vos offres en cours de recrutement"
    >
      {rate.total === 0 ? (
        <EmptyNote>Aucune offre en cours de recrutement.</EmptyNote>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold leading-none text-foreground">
              {rate.filled}
            </span>
            <span className="text-sm text-muted-foreground">
              sur {rate.total} poste{rate.total > 1 ? "s" : ""}
            </span>
            <span className="ml-auto text-sm font-medium text-foreground">
              {pct}%
            </span>
          </div>

          {/*
            role="meter" on a div rather than a native <meter>: a measurement
            within a known range is exactly what this is, but <meter> cannot be
            styled consistently across WebKit and Gecko, and this has to match
            the app's track. The aria-value* set below carries the semantics.
          */}
          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: CHART_TRACK }}
            role="meter"
            aria-valuenow={rate.filled}
            aria-valuemin={0}
            aria-valuemax={rate.total}
            aria-label={`${rate.filled} postes pourvus sur ${rate.total}`}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: CHART_ACCENT }}
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {remaining === 0
              ? "Tous les postes sont pourvus."
              : `${remaining} poste${remaining > 1 ? "s" : ""} encore à pourvoir.`}
          </p>
        </>
      )}
    </ChartCard>
  );
}

/**
 * Offer portfolio by stage — a horizontal stacked bar.
 *
 * Horizontal because the category names are French words, not codes, and
 * because a phone has width to spare and no height. Every segment is
 * direct-labelled and repeated in the legend: two of the four fills fall under
 * 3:1 on this surface, so identity may never rest on colour alone.
 */
export function OfferStageBar({ counts }: Readonly<{ counts: StageCount[] }>) {
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <ChartCard title="Mes offres" hint="Répartition par étape">
      {total === 0 ? (
        <EmptyNote>Aucune offre publiée pour le moment.</EmptyNote>
      ) : (
        <>
          {/* 2px surface gaps between segments, per the mark spec. */}
          <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
            {counts
              .filter((c) => c.count > 0)
              .map((c) => (
                <div
                  key={c.stage}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${(c.count / total) * 100}%`,
                    background: STAGE_COLORS[c.stage],
                  }}
                />
              ))}
          </div>

          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {STAGE_ORDER.map((stage) => {
              const entry = counts.find((c) => c.stage === stage);
              const count = entry?.count ?? 0;
              return (
                <li key={stage} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: STAGE_COLORS[stage] }}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      count > 0
                        ? "text-foreground"
                        : "text-muted-foreground/60",
                    )}
                  >
                    {STAGE_LABELS[stage]}
                  </span>
                  <span className="ml-auto text-xs font-semibold text-foreground">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </ChartCard>
  );
}

/**
 * Spend per month — columns, one series, with a per-column tooltip.
 *
 * Drawn in SVG with a `viewBox` so it scales to any phone width without
 * measuring the container. Every column keeps a 2px hit-target margin and the
 * value labels sit above the bars rather than inside, where a short bar would
 * clip them.
 */
export function SpendChart({ points }: Readonly<{ points: SpendPoint[] }>) {
  const [active, setActive] = useState<string | null>(null);
  const titleId = useId();

  const max = Math.max(...points.map((p) => p.total), 0);
  const total = points.reduce((sum, p) => sum + p.total, 0);

  // A fixed coordinate space; the SVG scales itself to the card.
  const W = 320;
  const H = 120;
  const BASE = H - 18; // room for month labels under the baseline
  const slot = W / points.length;
  const barW = Math.min(28, slot * 0.55);

  const activePoint = points.find((p) => p.key === active) ?? null;

  return (
    <ChartCard title="Mes dépenses" hint="6 derniers mois">
      {total === 0 ? (
        <EmptyNote>Aucune dépense sur les 6 derniers mois.</EmptyNote>
      ) : (
        <>
          <p className="sr-only" id={titleId}>
            Dépenses mensuelles sur les six derniers mois
          </p>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-labelledby={titleId}
          >
            {/* Recessive baseline — the only rule the chart needs. */}
            <line
              x1={0}
              y1={BASE}
              x2={W}
              y2={BASE}
              stroke="currentColor"
              strokeWidth={1}
              className="text-muted-foreground/25"
            />

            {points.map((p, i) => {
              const cx = i * slot + slot / 2;
              // Keep a visible stub for a zero month so the axis reads evenly —
              // a month with no spend still happened and must occupy its slot.
              const minHeight = p.total > 0 ? 3 : 1;
              const h = max > 0 ? Math.round((p.total / max) * (BASE - 24)) : 0;
              const y = BASE - Math.max(h, minHeight);
              const isActive = active === p.key;
              // Selectively direct-labelled: the peak only. A number over every
              // column is noise, and the rest are reachable from the table below.
              const isPeak = max > 0 && p.total === max;

              return (
                <g key={p.key}>
                  {/* Hit target wider than the mark, per the interaction spec. */}
                  <rect
                    x={cx - slot / 2}
                    y={0}
                    width={slot}
                    height={H}
                    fill="transparent"
                    onMouseEnter={() => setActive(p.key)}
                    onMouseLeave={() => setActive(null)}
                    onTouchStart={() => setActive(p.key)}
                  />
                  <rect
                    x={cx - barW / 2}
                    y={y}
                    width={barW}
                    height={BASE - y}
                    rx={4}
                    style={{ fill: CHART_ACCENT }}
                    opacity={active === null || isActive ? 1 : 0.45}
                  />
                  {isPeak && (
                    <text
                      x={cx}
                      y={y - 5}
                      textAnchor="middle"
                      className="fill-foreground text-[9px] font-semibold"
                    >
                      {p.total.toLocaleString("fr-FR")}
                    </text>
                  )}
                  <text
                    x={cx}
                    y={H - 4}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[9px]"
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Reserve the row so hovering doesn't shift the card's height. */}
          <p className="mt-1 h-4 text-center text-xs">
            {activePoint ? (
              <span className="text-foreground">
                <span className="text-muted-foreground">
                  {activePoint.label} :{" "}
                </span>
                <span className="font-semibold">
                  {formatAmount(activePoint.total)}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                Total : {formatAmount(total)}
              </span>
            )}
          </p>

          {/*
            The table twin. A tooltip must never be the only way to read a
            value — on a phone there is no hover at all, so without this the
            five unlabelled months would be unreadable.
          */}
          <details className="mt-2 group">
            <summary className="cursor-pointer list-none text-center text-xs text-muted-foreground underline underline-offset-2">
              <span className="group-open:hidden">Voir les chiffres</span>
              <span className="hidden group-open:inline">
                Masquer les chiffres
              </span>
            </summary>
            <table className="mt-2 w-full text-xs">
              <caption className="sr-only">
                Dépenses par mois sur les six derniers mois
              </caption>
              <tbody>
                {points.map((p) => (
                  <tr key={p.key}>
                    <th
                      scope="row"
                      className="py-1 text-left font-normal text-muted-foreground"
                    >
                      {p.label}
                    </th>
                    <td className="py-1 text-right font-medium tabular-nums text-foreground">
                      {formatAmount(p.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </ChartCard>
  );
}
