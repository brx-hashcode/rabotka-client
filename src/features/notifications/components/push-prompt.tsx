import { BellRing } from "lucide-react";
import { usePush } from "@/hooks/use-push";

/**
 * Offers phone notifications on this device when it is possible and not yet
 * on. Asking needs a tap — browsers refuse a permission prompt that no gesture
 * triggered — so this is a button, never an automatic prompt.
 */
export function PushPrompt({
  message = "Soyez prévenu(e) sur votre téléphone, même quand Rabotka est fermé.",
}: Readonly<{
  /** Why turn it on, said for the moment the prompt appears in. */
  message?: string;
}> = {}) {
  const push = usePush();

  if (push.state === "off") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-lime/60 p-3 text-lime-foreground">
        <BellRing className="size-5 shrink-0" />
        <p className="min-w-0 flex-1 text-xs leading-snug">{message}</p>
        <button
          type="button"
          onClick={() => void push.enable()}
          disabled={push.pending}
          className="shrink-0 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-60"
        >
          Activer
        </button>
      </div>
    );
  }

  if (push.state === "needs-install") {
    return (
      <p className="rounded-2xl bg-secondary p-3 text-xs leading-snug text-muted-foreground">
        Sur iPhone, ajoutez Rabotka à l'écran d'accueil (Partager → « Sur l'écran
        d'accueil ») et ouvrez-le depuis là pour recevoir les notifications.
      </p>
    );
  }

  return null;
}
