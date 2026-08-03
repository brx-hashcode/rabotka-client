import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Earliest selectable value for the picker, in local time (YYYY-MM-DDTHH:mm).
 * Mirrors the backend's 4-hour minimum so the native picker blocks invalid
 * dates before a round-trip. Same rule as the create-offer form.
 */
const MIN_HOURS_AHEAD = 4;

function minScheduledAt(): string {
  const d = new Date(Date.now() + MIN_HOURS_AHEAD * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerTitle: string;
  isPending: boolean;
  onConfirm: (scheduledAtIso: string) => void;
};

/**
 * Bottom sheet to reopen an expired offer at a new date.
 *
 * A sheet rather than a centred dialog: every other confirmation in the app
 * (ConfirmDialog, CancelApplicationDrawer, CompleteMissionDrawer) is one, and on
 * a phone it puts the date field and the primary button within thumb reach
 * instead of stranding them mid-screen.
 */
export function RepublishOfferDialog({
  open,
  onOpenChange,
  offerTitle,
  isPending,
  onConfirm,
}: Readonly<Props>) {
  const [value, setValue] = useState("");

  // Reset each time the sheet opens, so a date abandoned on a previous attempt
  // is never silently resubmitted.
  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  const handleConfirm = () => {
    if (!value) return;
    // datetime-local yields local wall-clock time; the API expects ISO 8601.
    onConfirm(new Date(value).toISOString());
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-center">
            <DrawerTitle>Republier cette offre ?</DrawerTitle>
            <DrawerDescription>
              « {offerTitle} » sera de nouveau visible par les travailleurs, avec
              les mêmes informations et une nouvelle date de début.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-1.5 px-4 pb-2 text-left">
            <Label htmlFor="republish-date" className="text-sm font-medium">
              Nouvelle date et heure
            </Label>
            <Input
              id="republish-date"
              type="datetime-local"
              min={minScheduledAt()}
              value={value}
              disabled={isPending}
              onChange={(e) => setValue(e.target.value)}
              className="w-full min-w-0 max-w-full"
            />
            <p className="text-xs text-muted-foreground">
              La date doit être au moins {MIN_HOURS_AHEAD} heures dans le futur.
            </p>
          </div>

          <DrawerFooter>
            <Button
              variant="whatsapp"
              onClick={handleConfirm}
              disabled={isPending || !value}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isPending ? "Republication…" : "Republier"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isPending}>
                Annuler
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
