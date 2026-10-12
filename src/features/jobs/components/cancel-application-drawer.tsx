import { useEffect, useState } from "react";
import { AlertTriangle, Info, Loader2, ShieldAlert } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { CancellationPreview } from "@/lib/api/worker-mission-controller";
import {
  COMPATIBILITY_NOTICE,
  reliabilityLoss,
  suspensionWarning,
} from "@/lib/cancellation-warning";

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly offerTitle: string;
  readonly preview: CancellationPreview | undefined;
  readonly isPreviewLoading: boolean;
  readonly isPending?: boolean;
  readonly onConfirm: (reason?: string) => void;
};

/**
 * Bottom sheet to withdraw an application, matching CompleteMissionDrawer.
 *
 * The penalty warning is why this confirms rather than acting on tap: cancelling
 * within the threshold of the start time costs real money and reliability score,
 * and the worker must see that before committing — the WhatsApp flow always
 * warned first.
 */
export function CancelApplicationDrawer({
  open,
  onOpenChange,
  offerTitle,
  preview,
  isPreviewLoading,
  isPending,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");
  const suspension = suspensionWarning(preview);
  const pointsLost = reliabilityLoss(preview);

  // Reset each time the sheet opens.
  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full">
          <DrawerHeader className="text-center">
            <DrawerTitle>Annuler cette candidature ?</DrawerTitle>
            <DrawerDescription>
              Vous ne serez plus candidat pour « {offerTitle} ».
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-6 pb-2">
            {isPreviewLoading && (
              <Skeleton className="h-20 w-full rounded-xl" />
            )}

            {!isPreviewLoading && preview?.wouldPenalize && (
              <div className="flex gap-3 rounded-xl bg-destructive/10 p-3 text-left">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-destructive">
                    Annulation tardive
                  </p>
                  <p className="text-muted-foreground">
                    La mission commence dans moins de {preview.thresholdHours}{" "}
                    heures. Une pénalité de{" "}
                    <span className="font-medium text-foreground">
                      {preview.penaltyFcfa.toLocaleString("fr-FR")} FCFA
                    </span>{" "}
                    sera appliquée et votre score de fiabilité baissera de{" "}
                    {pointsLost} points.
                  </p>
                </div>
              </div>
            )}

            {/* Not late, but the mission was accepted: it still costs
                reliability points when the platform is set to charge them. */}
            {!isPreviewLoading && !preview?.wouldPenalize && pointsLost > 0 && (
              <div className="flex gap-3 rounded-xl bg-destructive/10 p-3 text-left">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Annuler une mission acceptée fait baisser votre score de
                  fiabilité de{" "}
                  <span className="font-medium text-foreground">
                    {pointsLost} points
                  </span>
                  .
                </p>
              </div>
            )}

            {/* Repeated cancellations suspend the account — said before the
                last one, and plainly on the one that does it. */}
            {!isPreviewLoading && suspension.level !== "none" && (
              <div className="flex gap-3 rounded-xl bg-destructive/10 p-3 text-left">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-destructive">
                    {suspension.level === "suspends"
                      ? "Votre compte sera suspendu"
                      : "Risque de suspension"}
                  </p>
                  <p className="text-muted-foreground">{suspension.text}</p>
                </div>
              </div>
            )}

            {!isPreviewLoading && preview?.affectsCompatibility && (
              <div className="flex gap-3 rounded-xl bg-muted p-3 text-left">
                <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {COMPATIBILITY_NOTICE}
                </p>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <Label htmlFor="cancel-reason" className="text-sm font-medium">
                Motif (optionnel)
              </Label>
              <Textarea
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Expliquez brièvement pourquoi vous annulez…"
                rows={3}
                maxLength={500}
                disabled={isPending}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => onConfirm(reason.trim() || undefined)}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirmer l'annulation
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
