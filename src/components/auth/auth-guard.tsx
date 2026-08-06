import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useProfileMe } from "@/hooks/use-profile-me";
import { QueryErrorState } from "@/components/common/query-error-state";
import { isUnauthorized } from "@/lib/api/errors";
import { LoadingScreen } from "./loading-screen";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  const { data, isPending, isError, isFetching, error, refetch } =
    useProfileMe();
  const location = useLocation();

  // Not `isLoading`: in React Query v5 that is `isPending && isFetching`, so
  // once `profile/me` is cached as an error it reads false on the next mount
  // even though `refetchOnMount` has already put a fresh request on the wire —
  // and the guard would redirect while the answer was still in flight. Only
  // widen it to cover the error case; a bare `isFetching` would blank the screen
  // during ordinary background refetches of a perfectly good session.
  if (isPending || (isError && isFetching)) {
    return <LoadingScreen />;
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
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(destination)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}
