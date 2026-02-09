import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClipboardList } from "lucide-react";

export const ApplicationsSheetButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setIsOpen(true)}
      >
        <ClipboardList className="h-4 w-4" />
        Voir mes candidatures
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Mes candidatures</SheetTitle>
            <SheetDescription>
              Suivez l'état de vos candidatures
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="bg-muted rounded-full p-6">
              <ClipboardList className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center">
              Vous n'avez aucune candidature pour le moment.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
