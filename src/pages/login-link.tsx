import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Loader } from "lucide-react";

import { safeDestination } from "@/lib/safe-destination";

/** Same expression the backend uses to recognise a code (`^[\w-]{16,128}$`). */
const CODE_REGEX = /^[A-Za-z0-9_-]{16,128}$/;

/**
 * `/s/:code` — the one-tap entry point for every WhatsApp link.
 *
 * For a real code nothing happens here beyond handing it to the API: the
 * backend consumes it, sets the session cookie and redirects to the destination
 * stored with the code. Same shape as the ad redirect (`/r/:hash`), and for the
 * same reason — nginx serves the SPA for unknown paths, so a link the bot sends
 * has to land in the app before it can reach the server.
 *
 * When the segment is NOT a code it is the destination itself. The outbound
 * processor leaves the path in the button URL whenever `mint()` returns null —
 * which it does for any profile that is not ACTIVE — so a pending-activation
 * user receives `…/s/profile`. That used to render "Lien de connexion
 * invalide.", and the way out sent an already-signed-in user to /home instead
 * of the page they had tapped. Going straight to the path costs nothing when a
 * session exists, and defers to AuthGuard when it does not.
 */
export default function LoginLink() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();

  const isCode = useMemo(() => Boolean(code && CODE_REGEX.test(code)), [code]);
  const destination = useMemo(
    () => (code && !isCode ? safeDestination(code) : null),
    [code, isCode],
  );

  useEffect(() => {
    if (code && isCode) {
      globalThis.location.replace(`/api/v1/s/${encodeURIComponent(code)}`);
      return;
    }
    // `replace` so the dead link leaves no history entry to go back into.
    navigate(destination ?? "/home", { replace: true });
  }, [code, isCode, destination, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Loader className="size-10 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Connexion en cours...</p>
    </div>
  );
}
