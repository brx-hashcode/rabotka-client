import { useNavigate } from "react-router";
import { CheckCircle2, Copy, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  type CreateJobOfferFormData,
  type PaymentFlowValue,
  PAYMENT_FLOW_LABELS,
} from "@/lib/validations/job-offer";

type Props = {
  reference: string;
  recap: CreateJobOfferFormData;
  onCreateAnother: () => void;
};

export function JobOfferSuccess({
  reference,
  recap,
  onCreateAnother,
}: Readonly<Props>) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const dateLabel = new Date(recap.scheduledAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const amountLabel =
    typeof recap.amount === "number"
      ? `${recap.amount.toLocaleString("fr-FR")} FCFA`
      : "Non spécifié";

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      toast({ description: "Référence copiée." });
    } catch {
      toast({
        variant: "destructive",
        description: "Impossible de copier la référence.",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg lg:p-8 p-4">
      <div className="flex flex-col items-center text-center gap-2">
        <CheckCircle2 className="size-12 text-green-600" />
        <h2 className="text-2xl font-bold">Votre offre est publiée !</h2>
        <p className="text-sm text-muted-foreground">
          Un message WhatsApp de confirmation vous a été envoyé. Partagez la
          référence ci-dessous avec un travailleur pour qu'il trouve directement
          votre offre.
        </p>
      </div>

      <Card className="mt-6">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Référence de l'offre</p>
            <p className="font-mono text-lg font-semibold">{reference}</p>
          </div>
          <Button variant="outline" onClick={copyReference}>
            <Copy className="size-4" />
            Copier
          </Button>
        </CardContent>
      </Card>

      <dl className="mt-6 space-y-3 text-sm">
        <RecapRow label="Offre" value={recap.title} />
        <RecapRow label="Date" value={dateLabel} />
        <RecapRow label="Adresse" value={recap.address} />
        <RecapRow label="Nombre de personnes" value={String(recap.quantity)} />
        <RecapRow label="Montant" value={amountLabel} />
        {recap.paymentFlow ? (
          <RecapRow
            label="Rémunération"
            value={PAYMENT_FLOW_LABELS[recap.paymentFlow as PaymentFlowValue]}
          />
        ) : null}
      </dl>

      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={() => navigate("/dashboard")}>Voir mes offres</Button>
        <Button variant="outline" onClick={onCreateAnother}>
          <Plus className="size-4" />
          Créer une autre offre
        </Button>
      </div>
    </div>
  );
}

function RecapRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right font-medium break-words">{value}</dd>
    </div>
  );
}
