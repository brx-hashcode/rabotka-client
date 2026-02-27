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
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatAmount, formatDateTime } from "@/lib/utils";
import { applicationsContent } from "@/content/profile";
import { useProfileApplications } from "@/hooks/use-profile-applications";
import type { ProfileApplicationItem } from "@/lib/api/profile-controller";

const content = applicationsContent;

const getStatusBadg = (status: string) => {
  return cn(
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
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
    <li className="rounded-lg border border-border bg-card p-4 space-y-1">
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
        {formatAmount(app.jobOffer.amount)}
      </p>
      <p className="text-sm text-muted-foreground truncate">
        {app.jobOffer.address}
      </p>
    </li>
  );
};

export const ApplicationsSheetButton = () => {
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
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setIsOpen(true)}
      >
        <ClipboardList className="h-4 w-4" />
        {content.button}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{content.sheet.title}</SheetTitle>
            <SheetDescription>{content.sheet.description}</SheetDescription>
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
        </SheetContent>
      </Sheet>
    </>
  );
};
