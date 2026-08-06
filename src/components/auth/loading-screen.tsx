/**
 * The full-screen wait shown while the session is being resolved.
 *
 * Shared by `AuthGuard` and the login page on purpose: both stand in front of
 * the same `profile/me` round-trip, and a user who is handed off between them
 * must not see the spinner change shape mid-wait.
 */
export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}
