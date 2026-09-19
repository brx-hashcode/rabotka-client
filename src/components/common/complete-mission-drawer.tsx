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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/common/star-rating";

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly subtitle?: string;
  /**
   * Shows an optional note field (employer → worker feedback). Off everywhere:
   * see the note on the component below before switching it on.
   */
  readonly showNote?: boolean;
  readonly submitLabel?: string;
  readonly onSubmit: (score: number, note?: string) => void;
  readonly isPending?: boolean;
};

/**
 * Bottom-sheet form to mark a mission completed and rate the other party: a
 * required 1–5 star rating, and nothing else.
 *
 * No caller passes `showNote` today, so the note field below is dormant, not
 * live UI: a rating is a score alone. The field and its plumbing are kept
 * because the endpoint still accepts a note (it lands on `Assignment.note`),
 * so turning it back on is one prop rather than a rewrite. Delete the pair
 * together if that ever stops being true.
 */
export function CompleteMissionDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  showNote = false,
  submitLabel = "Terminer et noter",
  onSubmit,
  isPending,
}: Props) {
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");

  // Reset the form each time the sheet opens.
  useEffect(() => {
    if (open) {
      setScore(0);
      setNote("");
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-center">
            <DrawerTitle>{title}</DrawerTitle>
            {subtitle && <DrawerDescription>{subtitle}</DrawerDescription>}
          </DrawerHeader>

          <div className="space-y-5 px-4 pb-2">
            <StarRating value={score} onChange={setScore} disabled={isPending} />

            {showNote && (
              <div className="space-y-1.5">
                <Label htmlFor="mission-note" className="text-sm font-medium">
                  Note (optionnel)
                </Label>
                <Textarea
                  id="mission-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Un mot sur la mission réalisée…"
                  rows={3}
                  maxLength={500}
                  disabled={isPending}
                />
              </div>
            )}
          </div>

          <DrawerFooter>
            <Button
              className="bg-whatsapp text-white hover:bg-whatsapp-dark"
              disabled={isPending || score < 1}
              onClick={() => onSubmit(score, note.trim() || undefined)}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {submitLabel}
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
