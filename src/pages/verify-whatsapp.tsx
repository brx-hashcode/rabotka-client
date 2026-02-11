import { useSearchParams } from "react-router";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import { useVerifyWhatsApp } from "@/hooks/use-verify-whatsapp";

type Status = "loading" | "success" | "error" | "no-token";

export default function VerifyWhatsApp() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { isLoading, isSuccess, isError } = useVerifyWhatsApp(token);

  let status: Status = "no-token";
  if (token) {
    if (isLoading) {
      status = "loading";
    } else if (isSuccess) {
      status = "success";
    } else if (isError) {
      status = "error";
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      {status === "loading" && (
        <>
          <Loader className="size-10 animate-spin text-whatsapp" />
          <p className="mt-4 text-sm text-muted-foreground">
            Vérification du numéro WhatsApp en cours…
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="size-12 text-green-600 dark:text-green-500" />
          <p className="mt-4 text-center font-medium text-foreground">
            Votre numéro WhatsApp a été vérifié avec succès.
          </p>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Vous pouvez désormais fermer cette page en toute sécurité.
          </p>
        </>
      )}

      {(status === "error" || status === "no-token") && (
        <>
          <XCircle className="size-12 text-destructive" />
          <p className="mt-4 text-center font-medium text-foreground">
            {status === "no-token"
              ? "Lien de vérification invalide ou manquant."
              : "Ce lien de vérification est invalide ou a déjà expiré."}
          </p>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Veuillez demander un nouveau lien de vérification si nécessaire.
          </p>
        </>
      )}
    </div>
  );
}
