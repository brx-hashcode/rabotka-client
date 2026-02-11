import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import { env } from "@/env";

type Status = "loading" | "success" | "error" | "no-token";

export default function VerifyWhatsApp() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(() =>
    token ? "loading" : "no-token",
  );

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    const url = `${env.VITE_API_URL}/verify/whatsapp?token=${encodeURIComponent(token)}`;
    fetch(url, { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      {status === "loading" && (
        <>
          <Loader className="size-10 animate-spin text-whatsapp" />
          <p className="mt-4 text-sm text-muted-foreground">
            Vérification en cours…
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="size-12 text-green-600 dark:text-green-500" />
          <p className="mt-4 text-center font-medium text-foreground">
            Votre compte WhatsApp est maintenant lié.
          </p>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Vous pouvez fermer cette page.
          </p>
        </>
      )}

      {(status === "error" || status === "no-token") && (
        <>
          <XCircle className="size-12 text-destructive" />
          <p className="mt-4 text-center font-medium text-foreground">
            {status === "no-token"
              ? "Lien invalide : aucun code de vérification."
              : "Ce lien est invalide ou a déjà été utilisé."}
          </p>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Demandez un nouveau lien si nécessaire.
          </p>
        </>
      )}
    </div>
  );
}
