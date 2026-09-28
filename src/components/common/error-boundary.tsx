import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildClientErrorReport,
  reportClientError,
} from "@/lib/report-client-error";

/** Survives the reload, so one retry cannot become a loop. */
const RELOAD_FLAG = "rabotka:chunk-reload";

/*
 * sessionStorage can throw rather than be absent — blocked site data, some
 * in-app browsers. The boundary is the last line of defence, so its own
 * bookkeeping must never be what crashes.
 */
function readReloadFlag(): string | null {
  try {
    return globalThis.sessionStorage?.getItem(RELOAD_FLAG) ?? null;
  } catch {
    return null;
  }
}

function writeReloadFlag(set: boolean) {
  try {
    if (set) globalThis.sessionStorage?.setItem(RELOAD_FLAG, "1");
    else globalThis.sessionStorage?.removeItem(RELOAD_FLAG);
  } catch {
    // Without storage the guard cannot persist; the error screen still shows.
  }
}

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

type Props = {
  readonly children: ReactNode;
  /**
   * When this changes, a failed boundary tries its children again. The route
   * boundary passes the pathname, so leaving a broken page — back, a tab —
   * recovers without a reload.
   */
  readonly resetKey?: string;
};
type State = {
  readonly error: Error | null;
  readonly componentStack: string | null;
};

/** The top of a stack is where the answer is; the rest is framework frames. */
const firstLines = (text: string | null | undefined, n: number) =>
  (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, n)
    .join("\n");

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
  state: State = { error: null, componentStack: null };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error)) {
      // Only ever once — if the reload lands on the same failure, the problem
      // is not a stale chunk and reloading again would spin forever.
      if (readReloadFlag() !== "1") {
        writeReloadFlag(true);
        globalThis.location.reload();
        return;
      }
    }
    console.error("Unhandled render error:", error, info.componentStack);
    this.setState({ componentStack: info.componentStack ?? null });
    // The app lives in WhatsApp's in-app browser, where nobody can open a
    // console — this is the only way the error reaches us.
    reportClientError(
      buildClientErrorReport(
        error,
        info.componentStack,
        globalThis.location?.pathname ?? "",
        __APP_VERSION__,
      ),
    );
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null, componentStack: null });
    }
  }

  private readonly retry = () => {
    writeReloadFlag(false);
    globalThis.location.reload();
  };

  private readonly goHome = () => {
    writeReloadFlag(false);
    globalThis.location.assign("/home");
  };

  render() {
    const { error, componentStack } = this.state;
    if (!error) return this.props.children;

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

        {/* Readable on the phone itself: in WhatsApp's browser there is no
            console, and a screenshot of this is a usable bug report. */}
        <details className="w-full max-w-xs text-left">
          <summary className="text-muted-foreground cursor-pointer text-center text-xs">
            Détails techniques
          </summary>
          <pre className="bg-muted text-muted-foreground mt-2 max-h-60 overflow-auto rounded-md p-3 text-[11px] leading-snug whitespace-pre-wrap break-words select-text">
            {[
              `${error.name}: ${error.message}`,
              `Page : ${globalThis.location?.pathname ?? ""}`,
              `Version : ${__APP_VERSION__}`,
              firstLines(error.stack, 5),
              firstLines(componentStack, 5),
            ]
              .filter(Boolean)
              .join("\n\n")}
          </pre>
        </details>
      </div>
    );
  }
}

/**
 * Clears the one-shot guard once the app has rendered successfully, so a stale
 * chunk weeks from now still gets its automatic reload.
 */
export function clearChunkReloadGuard() {
  writeReloadFlag(false);
}
