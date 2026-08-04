import { AlertTriangle, Loader2 } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useApplicationTerms } from "@/hooks/use-application-terms";
import { useProfileMe } from "@/hooks/use-profile-me";
import { formatAmount, formatDateTime } from "@/lib/utils";

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly scheduledAt: string;
  readonly address: string;
  readonly amount?: number | null;
  readonly isPending?: boolean;
  readonly onConfirm: () => void;
};

/**
 * Bottom sheet shown before a worker applies, carrying the engagement warning
 * the WhatsApp flow used to show.
 *
 * Applying is not a free action — it shares the worker's contact details with
 * the employer, holds one of their concurrent slots, and binds them to a
 * penalty if they cancel late. That has to be visible before they commit, not
 * discovered afterwards.
 */
export function ApplyConfirmDrawer({
  open,
  onOpenChange,
  title,
  scheduledAt,
  address,
  amount,
  isPending,
  onConfirm,
}: Props) {
  const { data: terms } = useApplicationTerms();
  const { data: me } = useProfileMe();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto flex max-h-[85vh] w-full max-w-md flex-col">
          <DrawerHeader className="text-center">
            <DrawerTitle>Confirmer votre candidature</DrawerTitle>
            <DrawerDescription>
              Vous êtes sur le point de postuler à « {title} ».
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-2">
            <dl className="space-y-2 rounded-xl bg-card p-3 text-left text-sm shadow-soft">
              <RecapRow label="Date" value={formatDateTime(scheduledAt)} />
              {amount != null && (
                <RecapRow label="Montant" value={formatAmount(amount)} />
              )}
              <RecapRow label="Adresse" value={address} />
            </dl>

            <div className="flex gap-3 rounded-xl bg-destructive/10 p-3 text-left">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-destructive">
                  Engagement important
                </p>
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                  <li>Vos informations seront partagées avec l'employeur.</li>
                  <li>Vous vous engagez à être présent et ponctuel.</li>
                  <li>
                    {terms ? (
                      <>
                        Une annulation moins de {terms.cancellationThresholdHours}{" "}
                        heures avant le début entraîne une pénalité de{" "}
                        <span className="font-medium text-foreground">
                          {terms.lateCancellationPenaltyFcfa.toLocaleString(
                            "fr-FR",
                          )}{" "}
                          FCFA
                        </span>
                        .
                      </>
                    ) : (
                      <>
                        Une annulation tardive entraîne une pénalité en FCFA.
                      </>
                    )}
                  </li>
                  <li>Votre score de fiabilité est impacté.</li>
                </ul>
              </div>
            </div>

            {me && (
              <div className="space-y-2 rounded-xl bg-card p-3 text-left shadow-soft">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Votre profil sera envoyé
                </p>
                <dl className="space-y-2 text-sm">
                  <RecapRow
                    label="Nom"
                    value={`${me.firstName} ${me.lastName}`}
                  />
                  <RecapRow label="Téléphone" value={me.phone} />
                  {me.email && <RecapRow label="Email" value={me.email} />}
                  {me.reliabilityScore != null && (
                    <RecapRow
                      label="Score de fiabilité"
                      value={`${me.reliabilityScore}/100`}
                    />
                  )}
                </dl>
              </div>
            )}
          </div>

          <DrawerFooter>
            <Button
              className="bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark"
              disabled={isPending}
              onClick={onConfirm}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Oui, je postule
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isPending}>
                Retour
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function RecapRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="break-words text-right font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}
