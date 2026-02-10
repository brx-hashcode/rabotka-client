import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileWarning } from "lucide-react";
import { getPenalties } from "@/lib/api/profile-controller";
import { Skeleton } from "@/components/ui/skeleton";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const PenaltiesSheetButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: penalties, isLoading } = useQuery({
    queryKey: ["profile", "penalties"],
    queryFn: getPenalties,
    enabled: isOpen,
  });

  const hasPenalties = Boolean(Array.isArray(penalties) && penalties.length > 0);
  const list = hasPenalties ? penalties : [];

  return (
    <>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setIsOpen(true)}
      >
        <FileWarning className="h-4 w-4" />
        Voir mes pénalités
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Mes pénalités</SheetTitle>
            <SheetDescription>
              Consultez l'historique de vos pénalités
            </SheetDescription>
          </SheetHeader>

          {isLoading && (
            <div className="space-y-4 py-6">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          )}
          {!isLoading && !hasPenalties && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="bg-muted rounded-full p-6">
                <FileWarning className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center">
                Vous n'avez aucune pénalité pour le moment.
              </p>
            </div>
          )}
          {!isLoading && hasPenalties && (
            <ul className="space-y-3 py-4">
              {list.map((p) => (
                <li
                  key={p.id}
                  className="rounded-lg border border-border bg-card p-4 space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-destructive">
                      {formatAmount(p.amount)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(p.appliedAt)}
                    </span>
                  </div>
                  {p.jobOfferTitle && (
                    <p className="text-sm text-muted-foreground">
                      {p.jobOfferTitle}
                    </p>
                  )}
                  {p.reason && (
                    <p className="text-sm text-foreground">{p.reason}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
