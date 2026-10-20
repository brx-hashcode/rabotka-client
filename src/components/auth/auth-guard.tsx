import { type ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useProfileMe } from "@/hooks/use-profile-me";
import { QueryErrorState } from "@/components/common/query-error-state";
import { isUnauthorized } from "@/lib/api/errors";
import { clearQueryCache } from "@/lib/offline-cache";
import { LoadingScreen } from "./loading-screen";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  const { data, isPending, isError, isFetching, error, refetch, fetchStatus } =
    useProfileMe();
  const location = useLocation();

  // Not `isLoading`: in React Query v5 that is `isPending && isFetching`, so
  // once `profile/me` is cached as an error it reads false on the next mount
  // even though `refetchOnMount` has already put a fresh request on the wire —
  // and the guard would redirect while the answer was still in flight. Only
  // widen it to cover the error case; a bare `isFetching` would blank the screen
  // during ordinary background refetches of a perfectly good session.
  // Signed out by the server (expired or revoked session): the offline copy
  // belongs to that session and goes with it.
  const signedOut = isError && isUnauthorized(error);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!signedOut) return;
    void clearQueryCache();
    // And from memory: nothing of the ended session may linger for the next
    // person to sign in on this phone. `profile/me` stays — it carries the 401
    // the redirect below reads.
    queryClient.removeQueries({
      predicate: (q) => !(q.queryKey[0] === "profile" && q.queryKey[1] === "me"),
    });
  }, [signedOut, queryClient]);

  // Offline with nothing stored yet (first visit, or the copy was wiped): the
  // check is paused, waiting for a network — say so instead of a loader that
  // never ends.
  if (isPending && fetchStatus === "paused") {
    return (
      <QueryErrorState
        message="Pas de connexion internet. Rabotka s'ouvrira dès que vous serez connecté."
        onRetry={refetch}
        isRetrying={false}
        className="min-h-screen"
      />
    );
  }

  if (isPending || (isError && isFetching)) {
    return <LoadingScreen />;
  }

  // A network failure with a profile already in hand — restored from the
  // offline copy, or loaded earlier in the session: open the app on it. The
  // connection, not the session, is what failed; the server alone can sign
  // someone out (the 401 below).
  if (isError && !isUnauthorized(error) && data) {
    return <>{children}</>;
  }

  if (isError && !isUnauthorized(error)) {
    // The server never said "signed out" — the request just failed. Treating
    // that as a logout is what turned a dropped request in WhatsApp's webview
    // into a trip through the login screen.
    return (
      <QueryErrorState
        message="Impossible de vérifier votre session."
        onRetry={refetch}
        isRetrying={isFetching}
        className="min-h-screen"
      />
    );
  }

  if (isError || !data) {
    // Carry where they were going. Without this every guarded route sent a
    // signed-out visitor to /login with no destination, and login's own default
    // then landed them on /home — so a WhatsApp link to a specific page quietly
    // became a link to the home screen. `login.tsx` already honours `redirect`.
    const destination = `${location.pathname}${location.search}`;

    // A signed-out visitor goes to the login screen, wherever they came from.
    //
    // This used to divert anyone with no "arrived from WhatsApp" mark to an
    // explanatory screen. The mark lived in localStorage, and a webview with
    // storage disabled, cleared or partitioned reports it missing — so the
    // screen was being shown to people who were inside WhatsApp, telling them
    // to open the app they already had open. A guard that misfires on the
    // audience it exists to help is worse than no guard.
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(destination)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}
