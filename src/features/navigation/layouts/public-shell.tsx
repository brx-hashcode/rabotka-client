import { APP_SCROLL_ID } from "@/lib/app-scroll";

type PublicShellProps = {
  readonly children: React.ReactNode;
};

/**
 * `AppShell`'s frame for pages a signed-out visitor can open: the public
 * portfolio, plus the whole way in — login and every onboarding step.
 *
 * The public portfolio rendered as a 576px column of content floating on a
 * plain white page, while every screen inside the app sits in a centred column
 * on a darker field. Same product, two different-looking surfaces, and the
 * public one is the surface a recruiter sees first. Signup and login had the
 * same break: someone crossed from a full-bleed form into a centred column the
 * moment their account existed.
 *
 * Frame only — no header, no bottom nav. Deliberately NOT `AppShell` itself,
 * for two reasons that both matter here:
 *
 * 1. **No bottom nav.** Its tabs go to `/home`, `/candidatures`, `/profile` —
 *    screens this visitor has no account for. Offering them is worse than
 *    offering nothing.
 * 2. **No `useProfileMe` / `useJobEvents`.** `AppShell` calls both. On a page
 *    that is crawled and served to strangers, firing an authenticated profile
 *    request and opening a socket is waste at best.
 *
 * The column classes are duplicated rather than shared through a constant: the
 * two shells are the same width today by intention, not by coupling, and a
 * shared token would make a future change to one silently change the other.
 */
export function PublicShell({ children }: Readonly<PublicShellProps>) {
  return (
    // The same fixed frame as AppShell: only <main> scrolls, never the
    // document, so iPhone Safari's toolbar cannot collapse mid-scroll and
    // shake the page — onboarding, /pay and the public portfolio did exactly
    // that while the tab screens were already still. See lib/app-scroll.
    <div className="fixed inset-0 overflow-hidden sm:bg-app-surround">
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col bg-background sm:max-w-lg sm:shadow-soft">
        <main
          id={APP_SCROLL_ID}
          className="app-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
