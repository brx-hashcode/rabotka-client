import { useState } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaymentByToken } from "@/hooks/use-payment-by-token";
import { useInitiatePayment } from "@/hooks/use-initiate-payment";
import { usePaymentSocket } from "@/hooks/use-payment-socket";
import { CheckCircle2, AlertCircle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Operator = "MTN" | "AIRTEL";
type LocalStatus = "form" | "processing" | "approved" | "rejected";

export default function Pay() {
  const { token } = useParams<{ token: string }>();
  const { data: payment, isLoading, error } = usePaymentByToken(token);
  const { mutate: initiate, isPending } = useInitiatePayment(token ?? "");

  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState<Operator | null>(null);
  const [localStatus, setLocalStatus] = useState<LocalStatus>("form");
  const [phoneError, setPhoneError] = useState("");

  usePaymentSocket(
    token ?? "",
    localStatus === "processing",
    (status) => {
      setLocalStatus(status === "APPROVED" ? "approved" : "rejected");
    },
  );

  const handlePay = () => {
    const cleaned = phone.replace(/\s/g, "");
    if (!cleaned) {
      setPhoneError("Veuillez entrer votre numéro de téléphone.");
      return;
    }
    if (!operator) {
      setPhoneError("Veuillez sélectionner un opérateur.");
      return;
    }
    setPhoneError("");
    initiate(
      { phone: cleaned, operator },
      {
        onSuccess: () => setLocalStatus("processing"),
        onError: () => setLocalStatus("rejected"),
      },
    );
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-8 w-40 mx-auto" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-10 rounded-md" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !payment) {
    return (
      <PageWrapper>
        <div className="text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-bold">Lien invalide ou expiré</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Ce lien de paiement est introuvable ou a déjà été traité.
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (localStatus === "approved") {
    return (
      <PageWrapper>
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Paiement effectué !</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Votre paiement a été confirmé avec succès. Vous pouvez fermer cette
            page.
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (localStatus === "rejected") {
    return (
      <PageWrapper>
        <div className="text-center space-y-4">
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Paiement échoué</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Le paiement n'a pas pu être traité. Veuillez réessayer.
          </p>
          <Button
            onClick={() => setLocalStatus("form")}
            variant="outline"
            className="mt-2"
          >
            Réessayer
          </Button>
        </div>
      </PageWrapper>
    );
  }

  if (localStatus === "processing") {
    return (
      <PageWrapper>
        <div className="text-center space-y-4">
          <Loader2 className="h-14 w-14 text-primary mx-auto animate-spin" />
          <h1 className="text-xl font-bold">En attente de confirmation</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Une demande de paiement a été envoyée sur votre téléphone. Veuillez
            confirmer sur votre téléphone.
          </p>
        </div>
      </PageWrapper>
    );
  }

  const amount = payment.amount;
  const description = payment.description;

  return (
    <PageWrapper>
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Paiement</h1>
          <p className="text-sm text-muted-foreground">
            Pour{" "}
            <span className="font-semibold text-foreground">
              {payment.profileName}
            </span>
          </p>
        </div>

        {/* Amount card */}
        <div className="bg-card border border-border rounded-xl px-5 py-4 space-y-1">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <p className="text-3xl font-bold text-foreground">
            {amount !== null ? amount.toLocaleString("fr-FR") : "—"}
            <span className="text-base font-medium text-muted-foreground ml-2">
              FCFA
            </span>
          </p>
        </div>

        {/* Phone input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Numéro de téléphone
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 h-10 flex items-center border border-border rounded-md bg-muted text-sm text-muted-foreground select-none">
              +237
            </span>
            <Input
              type="tel"
              placeholder="6XXXXXXXX"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError("");
              }}
              className="flex-1"
            />
          </div>
          {phoneError && (
            <p className="text-xs text-destructive">{phoneError}</p>
          )}
        </div>

        {/* Operator selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Opérateur
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OperatorCard
              label="MTN Mobile Money"
              selected={operator === "MTN"}
              color="bg-yellow-400"
              textColor="text-yellow-900"
              onClick={() => setOperator("MTN")}
            />
            <OperatorCard
              label="Airtel Money"
              selected={operator === "AIRTEL"}
              color="bg-red-500"
              textColor="text-white"
              onClick={() => setOperator("AIRTEL")}
            />
          </div>
        </div>

        {/* Pay button */}
        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handlePay}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : null}
          {isPending ? "Envoi en cours..." : "Payer"}
        </Button>
      </div>
    </PageWrapper>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}

function OperatorCard({
  label,
  selected,
  color,
  textColor,
  onClick,
}: {
  label: string;
  selected: boolean;
  color: string;
  textColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-4 py-3 text-left transition-all border-2",
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-muted-foreground/40",
      )}
    >
      <div
        className={cn(
          "h-7 w-7 rounded-full mb-2 flex items-center justify-center",
          color,
        )}
      >
        <span className={cn("text-xs font-bold", textColor)}>
          {label.charAt(0)}
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground leading-tight">
        {label}
      </p>
    </button>
  );
}
