import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { exchangeWhatsAppSession } from "@/lib/api/auth-controller";

/** Query parameter carrying the one-time login code on WhatsApp links. */
const SESSION_PARAM = "s";

/** Removes the code from the address bar without reloading or losing the route. */
function stripSessionParam(): void {
  const url = new URL(globalThis.location.href);
  if (!url.searchParams.has(SESSION_PARAM)) return;

  url.searchParams.delete(SESSION_PARAM);
  globalThis.history.replaceState(
    globalThis.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

/**
 * Signs the user in from a WhatsApp link before the app renders.
 *
 * Bot links carry `?s=<code>`; trading it for the session cookie here — above
 * the router — is what lets a tapped notification land on its destination
 * instead of the OTP screen. Rendering is held during the exchange on purpose:
 * `AuthGuard` would otherwise resolve `profile/me` first and bounce to /login.
 */
export function SessionLinkProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(() =>
    new URLSearchParams(globalThis.location.search).has(SESSION_PARAM),
  );

  useEffect(() => {
    if (!pending) return;

    const code = new URLSearchParams(globalThis.location.search).get(
      SESSION_PARAM,
    );
    if (!code) {
      setPending(false);
      return;
    }

    let cancelled = false;

    void exchangeWhatsAppSession(code)
      .then(() => {
        if (cancelled) return;
        // The cookie is set; anything already holding a "logged out" answer
        // must ask again.
        return queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      })
      // A dead code (already used, expired) is an ordinary outcome, not an
      // error to surface: the user just sees the login screen as before.
      .catch(() => undefined)
      .finally(() => {
        if (cancelled) return;
        stripSessionParam();
        setPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pending, queryClient]);

  if (pending) return <LoadingScreen />;

  return <>{children}</>;
}
