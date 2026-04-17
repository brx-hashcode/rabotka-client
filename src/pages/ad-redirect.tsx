import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
import { Loader } from "lucide-react";

const TRACKING_HASH_REGEX = /^[A-Za-z0-9_-]+$/;

export default function AdRedirect() {
  const { hash } = useParams<{ hash: string }>();

  const isValidHash = useMemo(() => {
    if (!hash) return false;
    return TRACKING_HASH_REGEX.test(hash);
  }, [hash]);

  useEffect(() => {
    if (!hash || !isValidHash) return;
    globalThis.location.replace(`/api/v1/r/${encodeURIComponent(hash)}`);
  }, [hash, isValidHash]);

  if (!isValidHash) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center">
        <p className="font-medium text-foreground">Lien de redirection invalide.</p>
        <Link to="/" className="mt-3 text-sm text-primary underline">
          Retour a l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Loader className="size-10 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">
        Redirection en cours...
      </p>
    </div>
  );
}
