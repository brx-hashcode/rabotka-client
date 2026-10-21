import { Briefcase, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { EmployerJobOfferItem } from "@/lib/api/job-offer-controller";
import { JobOfferCard } from "./job-offer-card";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];

type JobOfferListProps = {
  readonly offers: readonly EmployerJobOfferItem[];
  readonly isLoading: boolean;
  readonly emptyMessage: string;
  /** Where to go from an empty list, under the message. */
  readonly emptyAction?: React.ReactNode;
  readonly hasMore?: boolean;
  readonly isLoadingMore?: boolean;
  readonly onLoadMore?: () => void;
  readonly onOfferClick?: (offer: EmployerJobOfferItem) => void;
};

export function JobOfferList({
  offers,
  isLoading,
  emptyMessage,
  emptyAction,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onOfferClick,
}: Readonly<JobOfferListProps>) {
  if (isLoading) {
    return (
      <div className="space-y-3 px-4 py-4">
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 rounded-2xl bg-lime p-5">
          <Briefcase className="h-10 w-10 text-lime-foreground" />
        </div>
        <p className="max-w-xs text-sm text-muted-foreground">{emptyMessage}</p>
        {emptyAction && (
          <div className="mt-5 flex w-full max-w-xs flex-col gap-2">{emptyAction}</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 py-4">
      {offers.map((offer) => (
        <JobOfferCard key={offer.id} offer={offer} onClick={onOfferClick} />
      ))}

      {hasMore && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoadingMore}
          onClick={onLoadMore}
        >
          {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoadingMore ? "Chargement…" : "Voir plus"}
        </Button>
      )}
    </div>
  );
}
