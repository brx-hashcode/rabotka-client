import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type FiltersSheetProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export function FiltersSheet({ open, onOpenChange }: Readonly<FiltersSheetProps>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Filtres</SheetTitle>
          <SheetDescription>
            Affinez votre recherche d'offres.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 text-sm text-muted-foreground">
          Bientôt disponible
        </div>
      </SheetContent>
    </Sheet>
  );
}
