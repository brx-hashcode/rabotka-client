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
import { ClipboardList } from "lucide-react";
import { getApplications } from "@/lib/api/profile-controller";
import { Skeleton } from "@/components/ui/skeleton";

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  CANCELLED: "Annulée",
};

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

const getStatusLabel = (status: string) =>
  APPLICATION_STATUS_LABELS[status] ?? status;

export const ApplicationsSheetButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const page = 1;
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["profile", "applications", page],
    queryFn: () => getApplications(page, limit),
    enabled: isOpen,
  });

  const applications = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasApplications = applications.length > 0;

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

          {isLoading && (
            <div className="space-y-4 py-6">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          )}
          {!isLoading && !hasApplications && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="bg-muted rounded-full p-6">
                <ClipboardList className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center">
                Vous n'avez aucune candidature pour le moment.
              </p>
            </div>
          )}
          {!isLoading && hasApplications && (
            <div className="py-4 space-y-4">
              {total > 0 && (
                <p className="text-sm text-muted-foreground">
                  {total} {total > 1 ? "candidatures" : "candidature"} au total
                </p>
              )}
              <ul className="space-y-3">
                {applications.map((app) => (
                  <li
                    key={app.id}
                    className="rounded-lg border border-border bg-card p-4 space-y-2"
                  >
                    <p className="font-medium text-foreground">
                      {app.jobOffer.title}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span>{getStatusLabel(app.status)}</span>
                      <span>{formatDate(app.jobOffer.scheduledAt)}</span>
                      <span>{formatAmount(app.jobOffer.amount)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {app.jobOffer.address}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
