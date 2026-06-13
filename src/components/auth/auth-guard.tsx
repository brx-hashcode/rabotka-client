import { type ReactNode } from "react";
import { Navigate } from "react-router";
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !data) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
