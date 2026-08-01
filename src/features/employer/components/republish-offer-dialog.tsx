import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function RepublishOfferDialog({
  open,
  onOpenChange,
  offerTitle,
  isPending,
  onConfirm,
}: Readonly<Props>) {
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    if (!value) return;
    // datetime-local yields local wall-clock time; the API expects ISO 8601.
    onConfirm(new Date(value).toISOString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Republier cette offre ?</DialogTitle>
          <DialogDescription>
            « {offerTitle} » sera de nouveau visible par les travailleurs, avec
            les mêmes informations et une nouvelle date de début.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="republish-date">Nouvelle date et heure</Label>
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || !value}>
            {isPending ? "Republication..." : "Republier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
