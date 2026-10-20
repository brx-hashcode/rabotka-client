import { Link, useLocation } from "react-router";
import { useProfileMe } from "@/hooks/use-profile-me";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { tapFeedback } from "@/lib/haptics";
import { getTabsForProfileType } from "../config/tabs";
import { activeTab } from "../config/active-tab";
import { useUnreadDiscussionsCount } from "@/hooks/use-discussions";
import { badgeText } from "@/features/notifications/read-state";

/**
 * The tab screen the person was last on. Module state rather than React
 * state: the bar remounts with each screen's AppShell, and this has to
 * outlive that. A reload forgets it, and the prefixes take over.
 */
let lastTab: string | null = null;

export function BottomNav() {
  const { data: profile } = useProfileMe();
  const tabs = getTabsForProfileType(profile?.profileType);
  const { pathname } = useLocation();
  if (tabs.some((t) => t.to === pathname)) lastTab = pathname;
  const current = activeTab(pathname, tabs, lastTab)?.to ?? null;
  // Messages are where an engagement gets settled; the bell alone did not say
  // one was waiting. Same "9+" cap as the bell.
  const unreadMessages = useUnreadDiscussionsCount();

  const initials =
    `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <nav
      aria-label="Navigation principale"
      // Part of AppShell's column, under the scrolling <main> — not fixed —
      // so it never moves while the page scrolls. The safe-area inset alone is
      // 0 on most Android phones and in the browser, which left the labels
      // flush against the bottom edge; adding a little to it rather than
      // max()-ing lifts the bar everywhere while still clearing an iPhone home
      // indicator. Kept small: on top of the inset, a full rem read as a gap.
      className="z-50 w-full shrink-0 border-t border-border bg-background pb-[calc(env(safe-area-inset-bottom)+0.25rem)]"
    >
      <ul className="flex items-stretch">
        {tabs.map(({ to, label, icon: Icon }) => {
          const isProfile = to === "/profile";
          const isActive = current === to;
          const badge = to === "/discussions" ? badgeText(unreadMessages) : null;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                // Lit by `activeTab`, not NavLink's exact match, so a detail
                // screen keeps the tab it belongs to (see active-tab.ts).
                aria-current={isActive ? "page" : undefined}
                // Fired on every tap, including one on the already-active tab:
                // a real button clicks whether or not it changes anything, and
                // swallowing the feedback there would read as the tap having
                // missed. No-ops on iOS and on desktop — see `haptics.ts`.
                onClick={tapFeedback}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2",
                  // `transition`, not `transition-transform` alongside
                  // `transition-colors`: both set the same CSS property, so
                  // tailwind-merge keeps only the last and the dip would snap
                  // instead of animating. The shorthand covers colour and
                  // transform together.
                  //
                  // `active:` is the touch-DOWN state, so the press happens
                  // under the thumb rather than once the route has changed.
                  // Feedback that arrives after the thing it confirms is not
                  // feedback.
                  "transition duration-100 active:scale-90",
                  // Vestibular safety. The colour still changes, so nothing
                  // here is carried by motion alone.
                  "motion-reduce:transition-none motion-reduce:active:scale-100",
                  isActive
                    ? "text-whatsapp"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isProfile ? (
                  <>
                    <Avatar
                      className={cn(
                        "h-5 w-5",
                        isActive && "ring-2 ring-whatsapp ring-offset-1",
                      )}
                    >
                      {profile?.avatarUrl && (
                        <AvatarImage
                          src={profile.avatarUrl}
                          alt={label}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-muted text-[9px] font-medium text-muted-foreground">
                        {initials || <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] font-medium leading-none">
                      {label}
                    </span>
                  </>
                ) : (
                  <>
                    {/* 1.75, not lucide's default 2. At 20px a 2px stroke
                        fills the counters of a glyph and the row reads as
                        heavy rather than crisp — which is most of what made
                        the first version look unfinished. Set here rather
                        than per icon in `tabs.tsx`, so the bar cannot drift
                        out of step with itself. */}
                    <span className="relative">
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                      {badge && (
                        <span
                          aria-hidden
                          className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-whatsapp px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background"
                        >
                          {badge}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-medium leading-none">
                      {label}
                      {badge && (
                        <span className="sr-only">
                          {` (${unreadMessages} non lu${unreadMessages > 1 ? "s" : ""})`}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
