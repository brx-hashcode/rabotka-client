import { Loader2, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** What failed, in the user's terms. */
  readonly message: string;
  /** React Query's `refetch`. Omit only when there is genuinely nothing to retry. */
  readonly onRetry?: () => void;
  /** React Query's `isFetching`, so the button can show it is working. */
  readonly isRetrying?: boolean;
  readonly className?: string;
};

/**
 * The shared "it didn't load" state, with a way out.
 *
 * Queries run with `retry: false` (see app/providers) and this app lives inside
 * WhatsApp's webview, which fires no focus or reconnect events — so a single
 * dropped request on a mobile connection used to strand the user on a dead
 * sentence, with no in-app way to try again and often no browser chrome to
 * reload from. Every load failure should offer this.
 */
export function QueryErrorState({
  message,
  onRetry,
  isRetrying,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <WifiOff className="text-muted-foreground size-7" />
      </div>

      <div className="space-y-1">
        <p className="text-foreground text-sm font-medium">{message}</p>
        <p className="text-muted-foreground max-w-xs text-xs">
          Vérifiez votre connexion internet, puis réessayez.
        </p>
      </div>

      {onRetry && (
        <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
          {isRetrying && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isRetrying ? "Chargement…" : "Réessayer"}
        </Button>
      )}
    </div>
  );
}
