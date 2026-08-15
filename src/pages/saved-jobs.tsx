import { useNavigate } from "react-router";
import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScreenHeader } from "@/features/employer";
import { JobCard } from "@/features/home/components/job-card";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycNotice } from "@/features/kyc";
import { useAccountGate } from "@/hooks/use-account-gate";
import { AccountNotice } from "@/features/account";
import { useSavedJobs, useCanApply } from "@/hooks/use-jobs";

export default function SavedJobs() {
  const navigate = useNavigate();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSavedJobs();
  const { canApply } = useCanApply();
  const { blocked, reason } = useKycGate();
  const { blocked: accountBlocked, reason: accountReason } = useAccountGate();

  const jobs = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Offres enregistrées" onBack={() => navigate(-1)} />

      <div className="flex-1 space-y-3 px-4 py-4">
        {accountBlocked && accountReason ? (
          <AccountNotice reason={accountReason} />
        ) : (
          blocked && reason && <KycNotice reason={reason} />
        )}

        {isLoading && (
          <>
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </>
        )}

        {!isLoading && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp/10">
              <Bookmark className="h-7 w-7 text-whatsapp" />
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Aucune offre enregistrée. Touchez le signet sur une offre pour la
              retrouver ici.
            </p>
          </div>
        )}

        {jobs.map((j) => (
          <JobCard key={j.id} job={j} canApply={canApply} />
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
