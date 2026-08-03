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
import { Skeleton } from "@/components/ui/skeleton";
import { useRecommendedWorker } from "@/hooks/use-recommendations";
import { formatAmount } from "@/lib/utils";

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly workerId: string;
  readonly workerName: string;
  readonly onConfirm: () => void;
};

/**
 * Bottom sheet shown before an employer contacts a recommended worker.
 *
 * The mirror of ApplyConfirmDrawer on the worker's side. Contacting is not a
 * free action: it charges a fee, and the previous flow jumped straight from
 * "Contacter" to a payment screen — the employer learned the price only after
 * committing to the step. The fee and their balance belong here, before the tap
 * that costs money.
 *
 * The fee is fetched only while the sheet is open (`enabled`), so a home feed of
 * recommendation cards does not fire one request per card on render.
 */
export function ContactConfirmDrawer({
  open,
  onOpenChange,
  workerId,
  workerName,
  onConfirm,
}: Props) {
  const { data, isLoading } = useRecommendedWorker(workerId, open);

  const fee = data?.recommendationFee ?? null;
  const balance = data?.walletBalance ?? null;
  const insufficient =
    fee !== null && balance !== null && balance < fee;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto flex max-h-[85vh] w-full max-w-md flex-col">
          <DrawerHeader className="text-center">
            <DrawerTitle>Contacter {workerName} ?</DrawerTitle>
            <DrawerDescription>
              Ses coordonnées vous seront envoyées par WhatsApp après paiement.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-2">
            {isLoading ? (
              <Skeleton className="h-20 w-full rounded-xl" />
            ) : (
              <dl className="space-y-2 rounded-xl bg-card p-3 text-left text-sm shadow-soft">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Frais de contact</dt>
                  <dd className="font-semibold text-foreground">
                    {fee !== null ? formatAmount(fee) : "—"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Votre portefeuille</dt>
                  <dd
                    className={
                      insufficient
                        ? "font-medium text-destructive"
                        : "font-medium text-foreground"
                    }
                  >
                    {balance !== null ? formatAmount(balance) : "—"}
                  </dd>
                </div>
              </dl>
            )}

            <div className="flex gap-3 rounded-xl bg-destructive/10 p-3 text-left">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-destructive">
                  Avant de continuer
                </p>
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                  <li>Ces frais sont dus même si le travailleur décline.</li>
                  <li>
                    Les coordonnées arrivent par WhatsApp, jamais dans
                    l'application.
                  </li>
                  {insufficient && (
                    <li className="text-destructive">
                      Votre solde est insuffisant : vous paierez par Mobile
                      Money à l'étape suivante.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button variant="whatsapp" disabled={isLoading} onClick={onConfirm}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {fee !== null ? `Continuer — ${formatAmount(fee)}` : "Continuer"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
