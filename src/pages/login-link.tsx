import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Loader } from "lucide-react";

const CODE_REGEX = /^[A-Za-z0-9_-]{16,128}$/;

/**
 * `/s/:code` — the one-tap entry point for every WhatsApp link.
 *
 * Nothing happens here beyond handing the code to the API: the backend consumes
 * it, sets the session cookie and redirects to the destination stored with the
 * code. Same shape as the ad redirect (`/r/:hash`), and for the same reason —
 * nginx serves the SPA for unknown paths, so a link the bot sends has to land
 * in the app before it can reach the server.
 */
export default function LoginLink() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();

  const isValid = useMemo(() => Boolean(code && CODE_REGEX.test(code)), [code]);

  useEffect(() => {
    if (!code || !isValid) return;
    globalThis.location.replace(`/api/v1/s/${encodeURIComponent(code)}`);
  }, [code, isValid]);

  if (!isValid) {
    // A malformed code never reaches the API. Send them to the login screen
    // rather than a dead end — they can still sign in the usual way.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 py-8 text-center">
        <p className="font-medium text-foreground">Lien de connexion invalide.</p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-sm text-primary underline"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Loader className="size-10 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Connexion en cours...</p>
    </div>
  );
}
