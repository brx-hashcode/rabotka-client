import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useProfileMe } from "@/hooks/use-profile-me";

type AuthGuardProps = {
  children: ReactNode;
};

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  const { data, isLoading, isError } = useProfileMe();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
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
