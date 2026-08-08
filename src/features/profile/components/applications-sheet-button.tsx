import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClipboardList, FileDown, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadLink } from "@/components/common/download-link";
import { cn, formatDateTime, formatOfferAmount } from "@/lib/utils";
import { jobLocationLabel } from "@/lib/job-location";
import { applicationsContent } from "@/content/profile";
import { useProfileApplications } from "@/hooks/use-profile-applications";
import type { ProfileApplicationItem } from "@/lib/api/profile-controller";
import { contractDownloadUrl } from "@/lib/api/profile-controller";

const content = applicationsContent;

const getStatusBadg = (status: string) => {
  return cn(
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
    {
      "bg-yellow-100 text-yellow-800": status === "PENDING",
      "bg-green-100 text-green-800": status === "ACCEPTED",
      "bg-red-100 text-red-800":
        status === "REJECTED" || status === "CANCELLED",
    },
  );
};

const getStatusLabel = (status: string) =>
  content.statusLabels[status] ?? status;

type ApplicationCardProps = {
  application: ProfileApplicationItem;
};

const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const app = application;

  return (
    <li className="rounded-lg shadow-soft bg-card p-4 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-foreground">{app.jobOffer.title}</p>
        <span className={getStatusBadg(app.status)}>
          {getStatusLabel(app.status)}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {formatDateTime(app.jobOffer.scheduledAt)}
      </p>
      <p className="text-sm text-muted-foreground">
        {formatOfferAmount(app.jobOffer.amount)}
      </p>
      <p className="text-sm text-muted-foreground truncate">
        {jobLocationLabel(app.jobOffer)}
      </p>
      {app.status === "ACCEPTED" && app.contractId && (
        <DownloadLink
          href={contractDownloadUrl(app.contractId)}
          className="inline-flex items-center gap-1 text-xs pt-1"
        >
          <FileDown className="h-3 w-3" />
          Télécharger le contrat
        </DownloadLink>
      )}
    </li>
  );
};

export const ApplicationsSheetButton = ({ asRow = false }: { asRow?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const page = 1;
  const limit = 10;

  const { data, isLoading } = useProfileApplications({
    page,
    limit,
    enabled: isOpen,
  });

  const applications = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasApplications = applications.length > 0;

  return (
    <>
      {asRow ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-muted text-foreground"
        >
          <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">{content.button}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setIsOpen(true)}
        >
          <ClipboardList className="h-4 w-4" />
          {content.button}
        </Button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>{content.sheet.title}</SheetTitle>
            <SheetDescription>{content.sheet.description}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  {content.empty}
                </p>
              </div>
            )}
            {!isLoading && hasApplications && (
              <ul className="space-y-3 py-3">
                {applications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
