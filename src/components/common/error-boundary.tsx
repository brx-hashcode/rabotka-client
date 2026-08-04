import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Survives the reload, so one retry cannot become a loop. */
const RELOAD_FLAG = "rabotka:chunk-reload";

/**
 * A dynamic import that 404s. Every route in this app is lazy, and a deploy
 * changes the hashed chunk filenames — so any page left open (WhatsApp's
 * webview keeps them alive for a long time) is still asking for files that no
 * longer exist. The browser wording differs per engine, hence the list.
 */
function isChunkLoadError(error: unknown): boolean {
  const message =
    error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return [
    "ChunkLoadError",
    "Failed to fetch dynamically imported module",
    "Importing a module script failed",
    "error loading dynamically imported module",
    "Loading chunk",
    "Loading CSS chunk",
  ].some((needle) => message.toLowerCase().includes(needle.toLowerCase()));
}

type Props = { readonly children: ReactNode };
type State = { readonly failed: boolean };

/**
 * Catches what would otherwise be a blank page.
 *
 * Without a boundary anywhere in the tree, a render error or a failed lazy
 * chunk unmounts everything and leaves white — recoverable only by a manual
 * reload, which in an in-app browser is genuinely hard to find.
 *
 * A stale chunk is not really an error: the app moved on and this tab did not.
 * That case reloads itself once and the user sees a flicker. Anything else, or
 * a second failure, gets a real screen with a way out.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error)) {
      // Only ever once — if the reload lands on the same failure, the problem
      // is not a stale chunk and reloading again would spin forever.
      if (globalThis.sessionStorage?.getItem(RELOAD_FLAG) !== "1") {
        globalThis.sessionStorage?.setItem(RELOAD_FLAG, "1");
        globalThis.location.reload();
        return;
      }
    }
    console.error("Unhandled render error:", error, info.componentStack);
  }

  private readonly retry = () => {
    globalThis.sessionStorage?.removeItem(RELOAD_FLAG);
    globalThis.location.reload();
  };

  private readonly goHome = () => {
    globalThis.sessionStorage?.removeItem(RELOAD_FLAG);
    globalThis.location.assign("/home");
  };

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="bg-muted flex size-14 items-center justify-center rounded-full">
          <RotateCw className="text-muted-foreground size-7" />
        </div>

        <div className="space-y-1">
          <p className="text-foreground text-sm font-medium">
            Une erreur est survenue.
          </p>
          <p className="text-muted-foreground max-w-xs text-xs">
            L'application n'a pas pu afficher cette page. Réessayez — vos données
            ne sont pas perdues.
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button variant="whatsapp" onClick={this.retry}>
            Réessayer
          </Button>
          <Button variant="outline" onClick={this.goHome}>
            Aller à l'accueil
          </Button>
        </div>
      </div>
    );
  }
}

/**
 * Clears the one-shot guard once the app has rendered successfully, so a stale
 * chunk weeks from now still gets its automatic reload.
 */
export function clearChunkReloadGuard() {
  globalThis.sessionStorage?.removeItem(RELOAD_FLAG);
}
