import { useNavigate } from "react-router";
import { Calendar, Coins, MapPin, Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerMissions } from "@/hooks/use-worker-missions";
import {
  ScreenHeader,
  StatusChip,
  APPLICATION_STATUS_LABELS,
  getApplicationStatusChipClass,
} from "@/features/employer";
import type { WorkerMission } from "@/lib/api/worker-mission-controller";
import { cn, formatDateTime, formatOfferAmount } from "@/lib/utils";
import { jobLocationLabel } from "@/lib/job-location";

export default function Applications() {
  const navigate = useNavigate();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useWorkerMissions();

  const missions = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const plural = total > 1 ? "s" : "";
  const subtitle = isLoading ? undefined : `${total} mission${plural}`;

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Mes missions" subtitle={subtitle} />

      <div className="flex-1 space-y-4 px-4 py-4">
        {isLoading && (
          <>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </>
        )}

        {!isLoading && missions.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp/10">
              <ClipboardList className="h-7 w-7 text-whatsapp" />
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Aucune mission pour le moment. Les jobs pour lesquels vous êtes
              retenu(e) apparaîtront ici.
            </p>
          </div>
        )}

        {missions.map((m) => (
          <MissionCard
            key={m.applicationId}
            mission={m}
            onClick={() => navigate(`/applications/${m.applicationId}`)}
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

function MissionCard({
  mission,
  onClick,
}: Readonly<{ mission: WorkerMission; onClick: () => void }>) {
  const { jobOffer, employer } = mission;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-card p-4 text-left shadow-soft active:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 text-base font-bold leading-snug text-foreground">
          {jobOffer.title}
        </h2>
        <StatusChip
          className={cn(
            "shrink-0",
            getApplicationStatusChipClass(mission.applicationStatus),
          )}
        >
          {APPLICATION_STATUS_LABELS[mission.applicationStatus] ??
            mission.applicationStatus}
        </StatusChip>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {employer.firstName} {employer.lastName}
      </p>

      <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        {jobOffer.amount != null && (
          <p className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-whatsapp" />
            <span className="font-medium text-foreground">
              {formatOfferAmount(jobOffer.amount)}
            </span>
          </p>
        )}
        {jobOffer.scheduledAt && (
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-whatsapp" />
            {formatDateTime(jobOffer.scheduledAt)}
          </p>
        )}
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-whatsapp" />
          <span className="truncate">{jobLocationLabel(jobOffer)}</span>
        </p>
      </div>
    </button>
  );
}
