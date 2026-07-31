import { useState } from "react";
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
import { HomeHeader } from "./home-header";
import { JobCard } from "./job-card";
import { cn } from "@/lib/utils";

const INITIAL_LIMIT = 10;
const PAGE_STEP = 5;
const SKELETON_KEYS = ["s1", "s2", "s3"];

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
      className="flex h-28 w-40 shrink-0 flex-col justify-between rounded-2xl bg-card p-4 text-left shadow-soft active:bg-secondary/40"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-whatsapp/10">
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
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { data: jobs, isLoading, isFetching } = useJobFeed(limit, categoryId);
  const { canApply, quota } = useCanApply();

  const list = jobs ?? [];
  const canLoadMore = isFetching || list.length >= limit;

  const chips: Chip[] = [
    { id: null, name: "Pour vous" },
    ...(profile?.categoryIds ?? []).map((id, i) => ({
      id,
      name: profile?.categoryNames?.[i] ?? "Catégorie",
    })),
  ];

  const selectChip = (id: string | null) => {
    setCategoryId(id);
    setLimit(INITIAL_LIMIT);
  };

  return (
    <div className="flex flex-col pb-4">
      <HomeHeader
        to="/recherche-offres"
        placeholder="Poste, domaine, adresse, réf…"
        trailing={
          <button
            type="button"
            aria-label="Offres enregistrées"
            onClick={() => navigate("/favoris")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground active:bg-secondary/70"
          >
            <Bookmark className="h-5 w-5" />
          </button>
        }
      />

      <div className="flex gap-3 overflow-x-auto px-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(() => {
          if (!quota?.concurrent) {
            return <Skeleton className="h-28 w-40 shrink-0 rounded-2xl" />;
          }
          const qLimit = Math.min(quota.limit, quota.concurrent.limit);
          const remaining = Math.min(
            quota.remaining,
            quota.concurrent.remaining,
          );
          const used = Math.max(0, qLimit - remaining);
          const pct = qLimit ? Math.min(100, (used / qLimit) * 100) : 0;

          return (
            <div className="flex h-28 w-40 shrink-0 flex-col justify-between rounded-2xl bg-whatsapp p-3 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Send className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{remaining}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-white/85">
                  candidature{remaining > 1 ? "s" : ""} restante
                  {remaining > 1 ? "s" : ""}
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })()}
        <QuickCard
          icon={<Bookmark className="h-5 w-5 text-whatsapp" />}
          title="Offres"
          subtitle="enregistrées"
          onClick={() => navigate("/favoris")}
        />
        <QuickCard
          icon={<ClipboardList className="h-5 w-5 text-whatsapp" />}
          title="Mes"
          subtitle="candidatures"
          onClick={() => navigate("/mes-candidatures")}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  ? "bg-whatsapp text-white"
                  : "bg-whatsapp/10 text-whatsapp",
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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp/10">
            <Briefcase className="h-8 w-8 text-whatsapp" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Aucune offre pour le moment. Revenez plus tard ou essayez une autre
            catégorie.
          </p>
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <section className="space-y-3 py-2">
          <div className="grid grid-cols-1 gap-3 px-4">
            {list.map((j) => (
              <JobCard key={j.id} job={j} canApply={canApply} />
            ))}
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
