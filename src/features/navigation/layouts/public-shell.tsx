type PublicShellProps = {
  readonly children: React.ReactNode;
};

/**
 * `AppShell`'s frame for pages a signed-out visitor can open.
 *
 * The public portfolio rendered as a 576px column of content floating on a
 * plain white page, while every screen inside the app sits in a centred column
 * on a darker field. Same product, two different-looking surfaces, and the
 * public one is the surface a recruiter sees first.
 *
 * Deliberately NOT `AppShell` itself, for two reasons that both matter here:
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
    <div className="sm:bg-app-surround">
      <div className="relative mx-auto min-h-svh w-full max-w-md bg-background sm:max-w-lg sm:shadow-soft">
        {children}
      </div>
    </div>
  );
}
