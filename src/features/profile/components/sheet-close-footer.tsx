import { Button } from "@/components/ui/button";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";

/**
 * A close button pinned to the bottom of a profile sheet.
 *
 * These sheets hold long lists — invoices, penalties, applications — and the
 * only way out was the small × in the top-right corner. Once you had scrolled
 * to the twelfth invoice, closing meant scrolling all the way back up to find
 * it. On a phone, where these sheets are full height, that is most of the
 * screen's worth of scrolling to dismiss something.
 *
 * Sits outside the scroll area, so it stays put however long the list is. The
 * × in the corner stays too — this adds a way out, it does not move one.
 */
export function SheetCloseFooter({
  label = "Fermer",
}: Readonly<{ label?: string }>) {
  return (
    <SheetFooter className="shrink-0 pt-4">
      <SheetClose asChild>
        <Button variant="outline" className="w-full">
          {label}
        </Button>
      </SheetClose>
    </SheetFooter>
  );
}
