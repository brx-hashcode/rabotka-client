import { useNavigate } from "react-router";
import { ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ScreenHeader,
  StatusChip,
  APPLICATION_STATUS_LABELS,
  getApplicationStatusChipClass,
} from "@/features/employer";
import { useProfileApplicationsInfinite } from "@/hooks/use-profile-applications-infinite";
import type { ProfileApplicationItem } from "@/lib/api/profile-controller";
import { cn, formatAmount, formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 5;

export default function WorkerApplications() {
  const navigate = useNavigate();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useProfileApplicationsInfinite(PAGE_SIZE);

  const applications = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const plural = total > 1 ? "s" : "";
  const subtitle = isLoading ? undefined : `${total} candidature${plural}`;

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Candidatures" subtitle={subtitle} />

      <div className="flex-1 space-y-3 px-4 py-4">
        {isLoading && (
          <>
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </>
        )}

        {!isLoading && applications.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp/10">
              <ClipboardList className="h-7 w-7 text-whatsapp" />
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Vous n'avez pas encore postulé à une offre. Vos candidatures
              apparaîtront ici.
            </p>
          </div>
        )}

        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            onClick={() => navigate(`/applications/${app.id}`)}
          />
        ))}

        {hasNextPage && (
          <Button
            variant="outline"
            className="w-full"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Voir plus
          </Button>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({
  application: app,
  onClick,
}: Readonly<{ application: ProfileApplicationItem; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-card p-4 text-left shadow-soft active:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 font-semibold leading-snug text-foreground">
          {app.jobOffer.title}
        </p>
        <StatusChip
          className={cn("shrink-0", getApplicationStatusChipClass(app.status))}
        >
          {APPLICATION_STATUS_LABELS[app.status] ?? app.status}
        </StatusChip>
      </div>

      <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
        <p>{formatDateTime(app.jobOffer.scheduledAt)}</p>
        <p className="font-medium text-foreground">
          {formatAmount(app.jobOffer.amount)}
        </p>
        <p className="truncate">{app.jobOffer.address}</p>
      </div>
    </button>
  );
}
