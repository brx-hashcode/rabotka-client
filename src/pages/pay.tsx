import { useState } from "react";
import { useParams } from "react-router";
import type { Value as PhoneValue } from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import mtnLogo from "@/assets/MTN-logo.jpg";
import airtelLogo from "@/assets/airtel-new-logo.jpg";
import rabotkaLogo from "@/assets/rabotka-logo.png";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
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

  const [phone, setPhone] = useState<PhoneValue | null>(null);
  const [operator, setOperator] = useState<Operator | null>("MTN");
  const [localStatus, setLocalStatus] = useState<LocalStatus>("form");
  const [phoneError, setPhoneError] = useState("");

  usePaymentSocket(token ?? "", localStatus === "processing", (status) => {
    setLocalStatus(status === "APPROVED" ? "approved" : "rejected");
  });

  const handlePay = () => {
    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError("Veuillez entrer un numéro de téléphone valide.");
      return;
    }
    if (!operator) {
      setPhoneError("Veuillez sélectionner un opérateur.");
      return;
    }
    setPhoneError("");
    initiate(
      { phone, operator },
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
          <div className="space-y-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-40" />
          </div>
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
        <img src={rabotkaLogo} alt="Rabotka" className="h-10 w-auto" />

        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-foreground">Paiement</h1>
          <p className="text-sm text-muted-foreground">
            Pour{" "}
            <span className="font-semibold text-foreground">
              {payment.profileName}
            </span>
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl px-5 py-4 space-y-3">
          {description && (
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
              <span>{description}</span>
            </div>
          )}
          <div>
            <p className="text-3xl font-bold text-foreground">
              {amount === null ? "—" : amount.toLocaleString("fr-FR")}
              <span className="text-base font-medium text-muted-foreground ml-2">
                FCFA
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Paiement sécurisé via mobile money
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="operator"
            className="text-sm font-medium text-foreground"
          >
            Opérateur mobile
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OperatorCard
              label="MTN Mobile Money"
              selected={operator === "MTN"}
              logo={mtnLogo}
              onClick={() => setOperator("MTN")}
            />
            <OperatorCard
              label="Airtel Money"
              selected={operator === "AIRTEL"}
              logo={airtelLogo}
              onClick={() => setOperator("AIRTEL")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="phone-input"
            className="text-sm font-medium text-foreground"
          >
            Numéro de téléphone
          </label>
          <PhoneInput
            defaultCountry="CG"
            value={phone}
            onChange={(value) => {
              setPhone(value);
              if (phoneError) setPhoneError("");
            }}
            placeholder="06 000 0000"
          />
          {phoneError && (
            <p className="text-xs text-destructive">{phoneError}</p>
          )}
        </div>

        <Button
          className="w-full h-12 text-base font-semibold rounded-md"
          onClick={handlePay}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          {isPending ? "Envoi en cours..." : "Payer"}
        </Button>

        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
          <span>🔒</span>
          <span>
            Paiement sécurisé avec{" "}
            <span className="font-semibold text-foreground">CashLock</span>
          </span>
        </p>
      </div>
    </PageWrapper>
  );
}

function PageWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 overflow-hidden">
      {children}
    </div>
  );
}

function OperatorCard({
  label,
  selected,
  logo,
  onClick,
}: Readonly<{
  label: string;
  selected: boolean;
  logo: string;
  onClick: () => void;
}>) {
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
      <img
        src={logo}
        alt={label}
        className="h-8 w-8 rounded-full mb-2 object-cover"
      />
      <p className="text-sm font-semibold text-foreground leading-tight">
        {label}
      </p>
    </button>
  );
}
