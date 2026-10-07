import { useMemo, useState } from "react";
import { useRestoredFeedSize } from "@/hooks/use-restored-feed-size";
import { useNavigate } from "react-router";
import {
  Bookmark,
  Loader2,
  Briefcase,
  Send,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useJobFeed, useCanApply } from "@/hooks/use-jobs";
import type { JobFeedItem } from "@/lib/api/job-feed-controller";
import { BrandHero } from "./brand-hero";
import { HomeHeader } from "./home-header";
import { JobCard } from "./job-card";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycNotice } from "@/features/kyc";
import { useAccountGate } from "@/hooks/use-account-gate";
import { AccountNotice } from "@/features/account";
import { NotificationBell } from "@/features/notifications";
import { SponsoredCard } from "@/features/sponsored/sponsored-card";
import { interleaveAds } from "@/features/sponsored/interleave";
import { useFeedSlots } from "@/features/sponsored/use-feed-slots";
import { cn } from "@/lib/utils";

const INITIAL_LIMIT = 10;
const PAGE_STEP = 5;
const SKELETON_KEYS = ["s1", "s2", "s3"];

/** Shared so a loading feed keeps the same array, and the memo below holds. */
const NO_JOBS: JobFeedItem[] = [];

type Chip = { id: string | null; name: string };

function QuickCard({
  icon,
  title,
  subtitle,
  onClick,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-30 w-40 shrink-0 flex-col justify-between rounded-2xl bg-card p-4 text-left shadow-soft transition-transform duration-100 active:scale-[0.97] motion-reduce:active:scale-100"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime text-lime-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight text-foreground">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}

export function WorkerHome() {
  const navigate = useNavigate();
  const { data: profile } = useProfileMe();
  // Remembered across a job-detail round trip: see `useRestoredFeedSize`.
  const [limit, setLimit, resetLimit] = useRestoredFeedSize(
    "feed:worker-home",
    INITIAL_LIMIT,
  );
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { data: jobs, isLoading, isFetching } = useJobFeed(limit, categoryId);
  const { canApply, quota } = useCanApply();
  const { blocked, reason } = useKycGate();
  const { blocked: accountBlocked, reason: accountReason } = useAccountGate();

  const list = jobs ?? NO_JOBS;
  const canLoadMore = isFetching || list.length >= limit;

  const ads = useFeedSlots();
  // Memoised so the entries keep their identity across the re-renders this
  // screen gets from the quota and KYC caches — otherwise an ad card remounts
  // and its impression timer restarts before it can finish.
  const entries = useMemo(() => interleaveAds(list, ads), [list, ads]);

  const chips: Chip[] = [
    { id: null, name: "Pour vous" },
    ...(profile?.categoryIds ?? []).map((id, i) => ({
      id,
      name: profile?.categoryNames?.[i] ?? "Catégorie",
    })),
  ];

  const selectChip = (id: string | null) => {
    setCategoryId(id);
    resetLimit();
  };

  return (
    <div className="flex flex-col pb-4">
      {/* Saved offers are reached from the "Offres enregistrées" card below,
          so the band keeps only search, filters and notifications. */}
      <BrandHero
        greeting={profile?.firstName ? `Bonjour ${profile.firstName}` : "Bonjour"}
        title="Offres près de chez vous"
        trailing={<NotificationBell tone="onLime" />}
        search={
          <HomeHeader
            variant="onLime"
            to="/recherche-offres"
            placeholder="Poste, domaine, adresse, réf…"
          />
        }
      />

      {/* Straddles the lime band's rounded edge. py-2 gives the cards'
          shadows room: a horizontal scroller clips vertically too. */}
      <div className="relative z-10 -mt-12 flex gap-3 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(() => {
          // Guard on the quota itself, not on a nested field. It used to key
          // off `quota.concurrent`, so removing that server-side would have
          // left this skeleton on screen forever rather than failing visibly.
          if (!quota) {
            return <Skeleton className="h-30 w-40 shrink-0 rounded-2xl" />;
          }
          const qLimit = quota.limit;
          const remaining = quota.remaining;
          const used = Math.max(0, qLimit - remaining);
          const pct = qLimit ? Math.min(100, (used / qLimit) * 100) : 0;

          return (
            // White like the cards beside it: the band is the brand surface,
            // the rail is plain cards. The bar carries the green.
            <div className="flex h-30 w-40 shrink-0 flex-col justify-between rounded-2xl bg-card p-4 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime text-lime-foreground">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight text-foreground">
                  {remaining} candidature{remaining > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  restante{remaining > 1 ? "s" : ""}
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-lime/60">
                  <div
                    className="h-full rounded-full bg-whatsapp transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })()}
        <QuickCard
          icon={<Bookmark className="h-5 w-5" />}
          title="Offres"
          subtitle="enregistrées"
          onClick={() => navigate("/favoris")}
        />
        <QuickCard
          icon={<ClipboardList className="h-5 w-5" />}
          title="Mes"
          subtitle="candidatures"
          onClick={() => navigate("/mes-candidatures")}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => {
          const active = chip.id === categoryId;

          return (
            <button
              key={chip.id ?? "for-you"}
              type="button"
              onClick={() => selectChip(chip.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-lime-foreground text-lime"
                  : "bg-lime/60 text-lime-foreground",
              )}
            >
              {chip.name}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="space-y-3 px-4 py-2">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-lime">
            <Briefcase className="h-8 w-8 text-lime-foreground" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Aucune offre pour le moment. Revenez plus tard ou essayez une autre
            catégorie.
          </p>
        </div>
      )}

      {(accountBlocked || blocked) && (
        <div className="px-4 pb-2">
          {accountBlocked && accountReason ? (
            <AccountNotice reason={accountReason} />
          ) : (
            reason && <KycNotice reason={reason} />
          )}
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <section className="space-y-3 py-2">
          <div className="grid grid-cols-1 gap-3 px-4">
            {entries.map((entry) =>
              entry.kind === "ad" ? (
                <SponsoredCard key={entry.key} ad={entry.item} />
              ) : (
                <JobCard
                  key={entry.key}
                  job={entry.item}
                  canApply={canApply}
                />
              ),
            )}
          </div>
          {canLoadMore && (
            <div className="px-4">
              <Button
                variant="outline"
                className="w-full"
                disabled={isFetching}
                onClick={() => setLimit((l) => l + PAGE_STEP)}
              >
                {isFetching && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Voir plus
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
