import type { LucideIcon } from "lucide-react";
import {
  Home,
  User,
  Users,
  Briefcase,
  FileText,
  CalendarCheck,
  MessageCircle,
} from "lucide-react";
import type { ProfileMeResponse } from "@/lib/api/profile-controller";

export type NavTab = {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

/**
 * Five slots, and they stay five.
 *
 * A sixth entry does not break anything technically — the bar is a flex row
 * with `flex-1` per cell — but at phone width with 11px labels six cells are
 * cramped, and "Candidatures" is already the longest label in either bar. So
 * Discussion REPLACES rather than adds.
 *
 * What it replaced, in each case, moved into the Profile menu rather than
 * disappearing: `/claims` was already a row there, and `/missions` was added to
 * it in the same change. Neither route lost its only way in.
 *
 * ONE SHAPE PER ICON, and that is the rule this set is picked on. At 20px a
 * glyph made of several overlapping parts turns to mush — the first draft used
 * MessagesSquare (two stacked bubbles), Inbox (a tray with slots) and
 * ClipboardList (a board plus ruled lines), and the bar read as busy rather
 * than as five clear targets. Single silhouettes survive the size; detail does
 * not. The stroke weight is set once in `BottomNav`, not here.
 */
export const WORKER_TABS: readonly NavTab[] = [
  { to: "/home", label: "Accueil", icon: Home },
  // The applications this worker SENT — one document, not a clipboard.
  { to: "/mes-candidatures", label: "Candidatures", icon: FileText },
  // Confirmed engagements, so a calendar with a tick rather than a clock: the
  // clock said "time", which is not what a mission is.
  { to: "/applications", label: "Missions", icon: CalendarCheck },
  // Réclamations gave up this slot; it lives in the Profile menu, where it
  // already had a row.
  { to: "/discussions", label: "Discussion", icon: MessageCircle },
  { to: "/profile", label: "Profil", icon: User },
];

export const EMPLOYER_TABS: readonly NavTab[] = [
  { to: "/home", label: "Accueil", icon: Home },
  { to: "/jobs", label: "Mes offres", icon: Briefcase },
  // What arrives here is PEOPLE, not mail. The tray metaphor was borrowed from
  // email and said nothing about candidates.
  { to: "/candidatures", label: "Candidatures", icon: Users },
  // Missions gave up this slot. Candidatures stays, and the two views are
  // close, so the loss of reach is small — but /missions was NOT in the
  // Profile menu before this change, so a row was added there first.
  { to: "/discussions", label: "Discussion", icon: MessageCircle },
  { to: "/profile", label: "Profil", icon: User },
];

export function getTabsForProfileType(
  profileType: ProfileMeResponse["profileType"] | undefined,
): readonly NavTab[] {
  return profileType === "EMPLOYER" ? EMPLOYER_TABS : WORKER_TABS;
}
