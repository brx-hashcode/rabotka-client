// @vitest-environment node
// Pure helpers behind the bell and the feed — no DOM needed, and the shared
// jsdom environment currently fails to load its native `canvas` binding.
import { describe, expect, it } from "vitest";
import {
  applyDismiss,
  applyRead,
  badgeText,
  groupNotificationsByDay,
} from "@/features/notifications/read-state";
import type { AppNotification } from "@/lib/api/notification-controller";
import { notificationsContent } from "@/content/notifications";

const item = (id: string, readAt: string | null = null): AppNotification => ({
  id,
  type: "PROFILE_VIEW",
  title: "Votre profil a été consulté",
  body: "Un employeur a consulté votre profil.",
  link: "/profile",
  metadata: null,
  actorAvatarUrl: null,
  createdAt: "2026-09-16T10:00:00.000Z",
  readAt,
});

const NOW = "2026-09-16T12:00:00.000Z";

describe("badgeText", () => {
  it("hides the badge when nothing is unread", () => {
    expect(badgeText(0)).toBeNull();
    expect(badgeText(-1)).toBeNull();
  });

  it("shows the count up to 9, then caps it", () => {
    expect(badgeText(1)).toBe("1");
    expect(badgeText(9)).toBe("9");
    expect(badgeText(10)).toBe("9+");
  });
});

describe("bell label", () => {
  it("announces the unread count to screen readers", () => {
    expect(notificationsContent.bellLabel(0)).toBe("Notifications");
    expect(notificationsContent.bellLabel(3)).toBe(
      "Notifications (3 non lues)",
    );
  });
});

describe("applyRead", () => {
  it("marks one notification read across pages", () => {
    const pages = [{ items: [item("a")] }, { items: [item("b")] }];

    const result = applyRead(pages, (id) => id === "b", NOW);

    expect(result.cleared).toBe(1);
    expect(result.pages[0].items[0].readAt).toBeNull();
    expect(result.pages[1].items[0].readAt).toBe(NOW);
  });

  it("marks everything read and counts only what changed", () => {
    const pages = [{ items: [item("a"), item("b", "earlier")] }];

    const result = applyRead(pages, () => true, NOW);

    expect(result.cleared).toBe(1);
    // An already-read row keeps its original timestamp.
    expect(result.pages[0].items[1].readAt).toBe("earlier");
    expect(result.pages[0].items[0].readAt).toBe(NOW);
  });

  it("does not mutate the cached pages", () => {
    const pages = [{ items: [item("a")] }];

    applyRead(pages, () => true, NOW);

    expect(pages[0].items[0].readAt).toBeNull();
  });
});

describe("applyDismiss", () => {
  const page = (items: AppNotification[], total = items.length) => ({
    items,
    total,
  });

  it("removes the item and lowers the badge only for an unread one", () => {
    const pages = [page([item("a"), item("b", "earlier")], 5)];

    const unreadRemoved = applyDismiss(pages, (id) => id === "a");
    expect(unreadRemoved.pages[0].items.map((n) => n.id)).toEqual(["b"]);
    expect(unreadRemoved.pages[0].total).toBe(4);
    expect(unreadRemoved.removedUnread).toBe(1);

    const readRemoved = applyDismiss(pages, (id) => id === "b");
    expect(readRemoved.removedUnread).toBe(0);
  });

  it("clears every page", () => {
    const result = applyDismiss(
      [page([item("a")]), page([item("b"), item("c", "x")])],
      () => true,
    );
    expect(result.pages.every((p) => p.items.length === 0)).toBe(true);
    expect(result.pages.every((p) => p.total === 0)).toBe(true);
    expect(result.removedUnread).toBe(2);
  });
});

describe("groupNotificationsByDay", () => {
  // A Wednesday, mid-afternoon, local time.
  const now = new Date(2026, 8, 16, 15, 0, 0);
  const at = (id: string, date: Date) => ({
    ...item(id),
    createdAt: date.toISOString(),
  });

  it("buckets into today, yesterday, this week and older, in that order", () => {
    const groups = groupNotificationsByDay(
      [
        at("t1", new Date(2026, 8, 16, 14, 0)),
        at("t2", new Date(2026, 8, 16, 0, 5)),
        at("y1", new Date(2026, 8, 15, 23, 59)),
        at("w1", new Date(2026, 8, 11, 9, 0)),
        at("o1", new Date(2026, 8, 9, 9, 0)),
      ],
      now,
    );

    expect(groups.map((g) => g.label)).toEqual([
      "Aujourd’hui",
      "Hier",
      "Cette semaine",
      "Plus ancien",
    ]);
    // Server order is kept inside a section.
    expect(groups[0].items.map((n) => n.id)).toEqual(["t1", "t2"]);
    expect(groups[1].items.map((n) => n.id)).toEqual(["y1"]);
    expect(groups[2].items.map((n) => n.id)).toEqual(["w1"]);
    expect(groups[3].items.map((n) => n.id)).toEqual(["o1"]);
  });

  it("drops empty sections and files bad dates as older", () => {
    const groups = groupNotificationsByDay(
      [{ ...item("bad"), createdAt: "not a date" }],
      now,
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].bucket).toBe("older");
  });
});
