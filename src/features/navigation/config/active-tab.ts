/**
 * Which tab the bottom bar lights for a path.
 *
 * NavLink's `end` lit a tab on its own path only, so every detail screen
 * (/offres/:id, /applications/:id, …) showed the bar with nothing lit. Path
 * prefixes alone cannot fix that: a worker reaches /applications/:id from
 * both Candidatures and Missions. So the tab the person came from wins, and
 * prefixes are the fallback for arriving cold — a notification, a shared link.
 */
export type TabMatch = {
  readonly to: string;
  /** Other path prefixes that belong to this tab, e.g. its detail screens. */
  readonly match?: readonly string[];
};

export function activeTab<T extends TabMatch>(
  pathname: string,
  tabs: readonly T[],
  lastTab: string | null,
): T | null {
  const exact = tabs.find((t) => t.to === pathname);
  if (exact) return exact;

  const last = lastTab ? tabs.find((t) => t.to === lastTab) : undefined;
  if (last) return last;

  return (
    tabs.find((t) =>
      [t.to, ...(t.match ?? [])].some((p) => underPrefix(pathname, p)),
    ) ?? null
  );
}

/** `/offres/12` is under `/offres`; `/offres-speciales` is not. */
function underPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
