import { NavLink } from "react-router";
import { useProfileMe } from "@/hooks/use-profile-me";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { tapFeedback } from "@/lib/haptics";
import { getTabsForProfileType } from "../config/tabs";

export function BottomNav() {
  const { data: profile } = useProfileMe();
  const tabs = getTabsForProfileType(profile?.profileType);

  const initials =
    `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <nav
      aria-label="Navigation principale"
      // The safe-area inset alone is 0 on most Android phones and in the
      // browser, which left the labels sitting flush against the bottom edge.
      // Adding to it rather than max()-ing lifts the bar everywhere while
      // still clearing an iPhone home indicator.
      // Width and breakpoint track AppShell's column exactly — change one and
      // the bar detaches from the content above it. The surface stays
      // bg-background at every width, like the column itself.
      //
      // iPhone Safari moves fixed bars a frame late while its toolbar
      // collapses or expands mid-scroll, and the page showed through the gap
      // under the bar. The ::after paints the bar's background below its own
      // edge — off-screen at rest, filling that gap while it moves. Centred
      // with inset-x-0 + mx-auto rather than a translate: a transformed fixed
      // element gets its own layer on iOS and lags (and jitters) more.
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-border bg-background pb-[calc(env(safe-area-inset-bottom)+1rem)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-32 after:bg-background after:content-[''] sm:max-w-lg"
    >
      <ul className="flex items-stretch">
        {tabs.map(({ to, label, icon: Icon }) => {
          const isProfile = to === "/profile";
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end
                // Fired on every tap, including one on the already-active tab:
                // a real button clicks whether or not it changes anything, and
                // swallowing the feedback there would read as the tap having
                // missed. No-ops on iOS and on desktop — see `haptics.ts`.
                onClick={tapFeedback}
                className={({ isActive }) =>
                  cn(
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
                  )
                }
              >
                {({ isActive }) =>
                  isProfile ? (
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
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                      <span className="text-[11px] font-medium leading-none">
                        {label}
                      </span>
                    </>
                  )
                }
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
