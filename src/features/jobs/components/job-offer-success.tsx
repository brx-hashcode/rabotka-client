import { useNavigate } from "react-router";
import { REMOTE_LOCATION_LABEL } from "@/lib/job-location";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/employment-type";
import { Check, Copy, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
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

  // Guarded: a CDI/CDD/STAGE has no closing date, and `new Date("")` renders
  // the literal string "Invalid Date" straight into the recap.
  const dateLabel = recap.scheduledAt
    ? new Date(recap.scheduledAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
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
    <div className="flex w-full flex-col">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
          <Check className="size-8 text-green-600" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold">Votre offre est publiée !</h2>
        <p className="text-sm text-muted-foreground">
          Un message WhatsApp de confirmation vous a été envoyé. Partagez la
          référence ci-dessous avec un travailleur pour qu'il trouve directement
          votre offre.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Référence de l'offre</p>
          <p className="font-mono text-lg font-semibold">{reference}</p>
        </div>
        <Button variant="outline" onClick={copyReference}>
          <Copy className="size-4" />
          Copier
        </Button>
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <RecapRow label="Offre" value={recap.title} />
        <RecapRow
          label="Type de contrat"
          value={EMPLOYMENT_TYPE_LABELS[recap.employmentType]}
        />
        {dateLabel ? (
          <RecapRow label="Date de clôture" value={dateLabel} />
        ) : null}
        <RecapRow
          label="Lieu"
          value={
            recap.isRemote
              ? REMOTE_LOCATION_LABEL
              : [recap.address, recap.city].filter(Boolean).join(", ")
          }
        />
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
        {/* /jobs, not /dashboard: "Mes offres" in the employer tab bar is the
            list of their offers, which is what this button promises. */}
        <Button onClick={() => navigate("/jobs")}>Voir mes offres</Button>
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
