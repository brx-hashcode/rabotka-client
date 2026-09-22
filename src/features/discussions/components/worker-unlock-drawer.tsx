import { AlertTriangle } from "lucide-react";
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
import { formatAmount } from "@/lib/utils";
import type { WorkerUnlockState } from "@/lib/api/worker-mission-controller";

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employerName: string;
  unlock: WorkerUnlockState;
  onConfirm: () => void;
}>;

/**
 * The worker's side of "Débloquer", as a sheet — the mirror of the employer's
 * ContactConfirmDrawer.
 *
 * Before this the worker's button NAVIGATED straight to the payment page, and
 * learned the fee only once there. The fee, the balance and the one rule that
 * surprises people — nothing arrives until BOTH sides have paid — belong
 * before the tap that costs money, not after it.
 *
 * Confirming continues into the existing payment page, which already handles
 * wallet versus mobile money. This sheet decides nothing about paying; it only
 * makes sure the person knows what they are about to do.
 */
export function WorkerUnlockDrawer({
  open,
  onOpenChange,
  employerName,
  unlock,
  onConfirm,
}: Props) {
  const fee = unlock.workerFee;
  const balance = unlock.walletBalance;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto flex max-h-[85vh] w-full max-w-md flex-col">
          <DrawerHeader className="text-center">
            <DrawerTitle>Débloquer le contact de {employerName} ?</DrawerTitle>
            <DrawerDescription>
              Ses coordonnées vous seront envoyées par WhatsApp après paiement.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-2">
            <dl className="space-y-2 rounded-xl bg-card p-3 text-left text-sm shadow-soft">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Votre part</dt>
                <dd className="font-semibold text-foreground">{formatAmount(fee)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Votre portefeuille</dt>
                <dd className="font-semibold text-foreground">
                  {formatAmount(balance)}
                </dd>
              </div>
            </dl>

            <div className="flex gap-3 rounded-xl bg-destructive/10 p-3 text-left">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-destructive">Avant de continuer</p>
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                  {/* The rule that surprises people. The mission path is
                      mutual: paying your share does not release anything on
                      its own. */}
                  <li>
                    {unlock.employerPaid
                      ? "Le recruteur a déjà payé sa part : les coordonnées arrivent dès votre paiement."
                      : "Les coordonnées arrivent quand vous ET le recruteur avez payé votre part."}
                  </li>
                  <li>Elles arrivent par WhatsApp, jamais dans l'application.</li>
                </ul>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={onConfirm}>Continuer — {formatAmount(fee)}</Button>
            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
