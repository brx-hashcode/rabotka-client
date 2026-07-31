import { useNavigate } from "react-router";
import { Inbox, Calendar, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployerApplicationsInfinite } from "@/hooks/use-employer-applications-infinite";
import {
  ScreenHeader,
  APPLICATION_STATUS_LABELS,
  getApplicationStatusVariant,
} from "@/features/employer";
import type { EmployerApplicationItem } from "@/lib/api/job-offer-controller";
import { formatDate } from "@/lib/utils";

const SKELETON_KEYS = ["a1", "a2", "a3", "a4", "a5"];

export default function ReceivedApplications() {
  const navigate = useNavigate();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useEmployerApplicationsInfinite();

  const applications = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const plural = total > 1 ? "s" : "";
  const subtitle = isLoading ? undefined : `${total} candidature${plural}`;

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Candidatures" subtitle={subtitle} />

      {isLoading && (
        <div className="space-y-3 px-4 py-4">
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && applications.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Inbox className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Aucune candidature reçue pour le moment.
          </p>
        </div>
      )}

      {!isLoading && applications.length > 0 && (
        <div className="space-y-3 px-4 py-4">
          {applications.map((app) => (
            <ApplicationRow
              key={app.id}
              app={app}
              onClick={() => navigate(`/candidatures/${app.id}`)}
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
              {isFetchingNextPage ? "Chargement…" : "Voir plus"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const ApplicationRow = ({
  app,
  onClick,
}: Readonly<{ app: EmployerApplicationItem; onClick: () => void }>) => {
  const initials =
    `${app.worker.firstName?.[0] ?? ""}${app.worker.lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl shadow-soft bg-card p-4 text-left active:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
    >
      <Avatar className="h-12 w-12 shrink-0">
        {app.worker.avatarUrl && (
          <AvatarImage
            src={app.worker.avatarUrl}
            alt={`${app.worker.firstName} ${app.worker.lastName}`}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-muted text-sm font-semibold text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold text-foreground">
            {app.worker.firstName} {app.worker.lastName}
          </p>
          <Badge
            variant={getApplicationStatusVariant(app.status)}
            className="shrink-0 text-xs"
          >
            {APPLICATION_STATUS_LABELS[app.status] ?? app.status}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {app.jobOffer.title}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(app.createdAt)}
        </p>
      </div>
    </button>
  );
};
