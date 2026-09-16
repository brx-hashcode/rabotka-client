import type { AppNotification } from "@/lib/api/notification-controller";

/** What the bell shows: nothing at 0, the number up to 9, then "9+". */
export function badgeText(unread: number): string | null {
  if (unread <= 0) return null;
  return unread > 9 ? "9+" : String(unread);
}

type Page = { items: AppNotification[] };

/**
 * Stamps `readAt` on every unread item `isTarget` picks, across all loaded
 * pages, and reports how many it changed so the badge can drop by exactly that.
 * Already-read items are left alone, so a double tap cannot count twice.
 */
export function applyRead<P extends Page>(
  pages: P[],
  isTarget: (id: string) => boolean,
  readAt: string,
): { pages: P[]; cleared: number } {
  let cleared = 0;
  const next = pages.map((page) => ({
    ...page,
    items: page.items.map((n) => {
      if (n.readAt || !isTarget(n.id)) return n;
      cleared += 1;
      return { ...n, readAt };
    }),
  }));
  return { pages: next, cleared };
}

/**
 * Drops the items `isTarget` picks from every loaded page, keeping `total`
 * honest, and reports how many of the removed items were still unread so the
 * badge drops by exactly that.
 */
export function applyDismiss<P extends Page & { total: number }>(
  pages: P[],
  isTarget: (id: string) => boolean,
): { pages: P[]; removedUnread: number } {
  let removedUnread = 0;
  const next = pages.map((page) => {
    const kept = page.items.filter((n) => {
      if (!isTarget(n.id)) return true;
      if (!n.readAt) removedUnread += 1;
      return false;
    });
    const removed = page.items.length - kept.length;
    return {
      ...page,
      items: kept,
      total: Math.max(0, page.total - removed),
    };
  });
  return { pages: next, removedUnread };
}

export type DayBucket = "today" | "yesterday" | "week" | "older";

export const DAY_BUCKET_LABELS: Record<DayBucket, string> = {
  today: "Aujourd’hui",
  yesterday: "Hier",
  week: "Cette semaine",
  older: "Plus ancien",
};

const BUCKET_ORDER: DayBucket[] = ["today", "yesterday", "week", "older"];

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function bucketOf(date: Date, now: Date): DayBucket {
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return "week";
  return "older";
}

/**
 * The section headers of the feed. Rolling windows rather than calendar weeks:
 * "Cette semaine" on a Monday would otherwise hold only today and yesterday,
 * both of which already have their own section.
 *
 * Keeps the server's order inside each section (newest first) and drops empty
 * sections. Unparseable dates land in "Plus ancien" rather than vanishing.
 */
export function groupNotificationsByDay<T extends { createdAt: string }>(
  items: T[],
  now: Date = new Date(),
): { bucket: DayBucket; label: string; items: T[] }[] {
  const groups = new Map<DayBucket, T[]>();
  for (const item of items) {
    const date = new Date(item.createdAt);
    const bucket = Number.isNaN(date.getTime())
      ? "older"
      : bucketOf(date, now);
    const list = groups.get(bucket) ?? [];
    list.push(item);
    groups.set(bucket, list);
  }
  return BUCKET_ORDER.filter((b) => groups.has(b)).map((bucket) => ({
    bucket,
    label: DAY_BUCKET_LABELS[bucket],
    items: groups.get(bucket) ?? [],
  }));
}
