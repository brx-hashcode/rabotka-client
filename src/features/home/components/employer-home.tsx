import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Loader2,
  Plus,
  Briefcase,
  Inbox,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerFeed } from "@/hooks/use-recommendations";
import type { RecommendedWorker } from "@/lib/api/recommendation-controller";
import { HomeHeader } from "./home-header";
import { RecommendedWorkerCard } from "./recommended-worker-card";
import { SponsoredCard } from "@/features/sponsored/sponsored-card";
import { interleaveAds } from "@/features/sponsored/interleave";
import { useFeedSlots } from "@/features/sponsored/use-feed-slots";

const INITIAL_LIMIT = 10;
const PAGE_STEP = 5;
const SKELETON_KEYS = ["s1", "s2", "s3"];

/** Shared so a loading feed keeps the same array, and the memo below holds. */
const NO_WORKERS: RecommendedWorker[] = [];

export function EmployerHome() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const { data: workers, isLoading, isFetching } = useWorkerFeed(limit);

  const list = workers ?? NO_WORKERS;
  // Keep the button visible while a larger page is being fetched (the pending
  // `limit` runs ahead of the placeholder list) so its loading state shows.
  const canLoadMore = isFetching || list.length >= limit;

  const ads = useFeedSlots();
  // Same slot rule as the worker feed — the two lists are the same shape, so
  // an advert lands in the same place whichever side of the app you are on.
  const entries = useMemo(() => interleaveAds(list, ads), [list, ads]);

  return (
    <div className="flex flex-col">
      <HomeHeader />

      <QuickActions />

      {isLoading && (
        <div className="space-y-3 px-4 py-4">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 rounded-full bg-whatsapp/10 p-6">
            <Users className="h-10 w-10 text-whatsapp" />
          </div>
          <p className="mb-4 max-w-xs text-sm text-muted-foreground">
            Aucun profil recommandé pour le moment. Publiez une offre pour
            obtenir des recommandations.
          </p>
          <Button
            className="bg-whatsapp text-white hover:bg-whatsapp-dark"
            onClick={() => navigate("/job-offers/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Créer une offre
          </Button>
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <section className="space-y-3 py-4">
          <SectionHeader
            title="Profils recommandés"
            actionLabel="Voir tout"
            onAction={() => navigate("/recherche")}
          />
          {/* Single column: the feed is already ranked best-first, so a
              carousel just hid the ranking behind a horizontal swipe. */}
          <div className="grid grid-cols-1 gap-3 px-4">
            {entries.map((entry) =>
              entry.kind === "ad" ? (
                <SponsoredCard key={entry.key} ad={entry.item} />
              ) : (
                <RecommendedWorkerCard key={entry.key} worker={entry.item} />
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
                {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Voir plus
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function QuickActions() {
  const navigate = useNavigate();
  return (
    <section className="space-y-3 px-4 pt-3">
      {/* Hero CTA */}
      <button
        type="button"
        onClick={() => navigate("/job-offers/new")}
        className="flex w-full items-center justify-between gap-3 rounded-xl bg-whatsapp px-4 py-3.5 text-left text-white shadow-soft active:bg-whatsapp-dark"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold">Créer une offre</p>
          <p className="text-xs text-white/80">Publiez un job en 2 minutes</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Plus className="h-5 w-5" />
        </div>
      </button>

      {/* Shortcuts */}
      <div className="grid grid-cols-3 gap-3">
        <Shortcut
          icon={<Briefcase className="h-5 w-5 text-whatsapp" />}
          label="Mes offres"
          onClick={() => navigate("/jobs")}
        />
        <Shortcut
          icon={<Inbox className="h-5 w-5 text-whatsapp" />}
          label="Candidatures"
          onClick={() => navigate("/candidatures")}
        />
        <Shortcut
          icon={<Clock className="h-5 w-5 text-whatsapp" />}
          label="Missions"
          onClick={() => navigate("/missions")}
        />
      </div>
    </section>
  );
}

function Shortcut({
  icon,
  label,
  onClick,
}: Readonly<{ icon: React.ReactNode; label: string; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl bg-card p-3 shadow-soft active:bg-secondary/40"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-whatsapp/10">
        {icon}
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: Readonly<{
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}>) {
  return (
    <div className="flex items-center justify-between px-4">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-0.5 text-xs font-medium text-whatsapp"
        >
          {actionLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
