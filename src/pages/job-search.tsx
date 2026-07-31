import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  useQueryState,
  parseAsInteger,
  parseAsBoolean,
  parseAsStringLiteral,
} from "nuqs";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Briefcase,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/features/home/components/job-card";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycNotice } from "@/features/kyc";
import {
  JobSearchFiltersSheet,
  EMPTY_JOB_FILTERS,
  type JobSearchFilters,
  type JobDatePreset,
} from "@/features/home/components/job-search-filters-sheet";
import { useJobSearch, useCanApply } from "@/hooks/use-jobs";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4"];

const FLOWS = ["HOURLY", "DAILY", "MONTHLY"] as const;
const DATES = ["today", "7d", "30d"] as const;
const SORTS = ["recent", "soon", "amount_desc"] as const;

/**
 * Turns a date chip into an ISO range on the offer's scheduled date. `today` is
 * bounded on both ends; the rolling windows run from now forward, so past-but-
 * still-open offers drop out of them.
 */
function presetToRange(preset: JobDatePreset): {
  from?: string;
  to?: string;
} {
  if (preset === "all") return {};
  const now = new Date();
  if (preset === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  const days = preset === "7d" ? 7 : 30;
  const end = new Date(now);
  end.setDate(end.getDate() + days);
  return { from: now.toISOString(), to: end.toISOString() };
}

export default function JobSearch() {
  const navigate = useNavigate();

  const [q, setQ] = useQueryState("q", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const [categoryId, setCategoryId] = useQueryState("category");
  const [city, setCity] = useQueryState("city", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const [flow, setFlow] = useQueryState(
    "flow",
    parseAsStringLiteral(FLOWS),
  );
  const [minAmount, setMinAmount] = useQueryState("minAmount", parseAsInteger);
  const [datePreset, setDatePreset] = useQueryState(
    "date",
    parseAsStringLiteral(DATES),
  );
  const [hideApplied, setHideApplied] = useQueryState(
    "hideApplied",
    parseAsBoolean,
  );
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringLiteral(SORTS).withDefault("recent"),
  );

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [input, setInput] = useState(q);

  // Debounce the text field into the URL `q` param that drives the query.
  useEffect(() => {
    const t = setTimeout(() => setQ(input), 300);
    return () => clearTimeout(t);
  }, [input, setQ]);

  const { from, to } = presetToRange(datePreset ?? "all");

  // `undefined` (not "" / null) for empties keeps the query key stable.
  const filters = {
    q: q || undefined,
    categoryId: categoryId || undefined,
    city: city || undefined,
    paymentFlow: flow ?? undefined,
    minAmount: minAmount ?? undefined,
    from,
    to,
    hideApplied: hideApplied ? true : undefined,
    sort,
  };

  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    useJobSearch(filters);
  const { canApply } = useCanApply();
  const { blocked, reason } = useKycGate();

  const list = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  // `sort` is excluded on purpose — it always has a value, so counting it would
  // pin the badge to at least 1 forever.
  const activeFilterCount =
    (categoryId ? 1 : 0) +
    (city ? 1 : 0) +
    (flow ? 1 : 0) +
    (minAmount ? 1 : 0) +
    (datePreset ? 1 : 0) +
    (hideApplied ? 1 : 0);

  const sheetValue: JobSearchFilters = {
    categoryId: categoryId ?? null,
    city: city ?? "",
    paymentFlow: flow ?? null,
    minAmount: minAmount ?? null,
    datePreset: datePreset ?? "all",
    hideApplied: Boolean(hideApplied),
    sort,
  };

  const applyFilters = (f: JobSearchFilters) => {
    setCategoryId(f.categoryId);
    setCity(f.city);
    setFlow(f.paymentFlow);
    setMinAmount(f.minAmount);
    setDatePreset(f.datePreset === "all" ? null : f.datePreset);
    setHideApplied(f.hideApplied ? true : null);
    setSort(f.sort);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Retour"
            onClick={() => navigate(-1)}
            className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Poste, domaine, adresse, réf…"
              className="h-11 w-full rounded-md bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
            />
          </div>
          <button
            type="button"
            aria-label="Filtres"
            onClick={() => setFiltersOpen(true)}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-whatsapp px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {isLoading && (
        <div className="space-y-3 px-4 py-4">
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
            Aucune offre trouvée. Essayez d'autres mots-clés ou filtres.
          </p>
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => applyFilters(EMPTY_JOB_FILTERS)}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}

      {blocked && reason && (
        <div className="px-4 pt-4">
          <KycNotice reason={reason} />
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <div className="space-y-3 px-4 py-4">
          <p className="text-sm text-muted-foreground">
            {total} résultat{total > 1 ? "s" : ""}
          </p>
          {list.map((job) => (
            <JobCard key={job.id} job={job} canApply={canApply} />
          ))}
          {hasNextPage && (
            <Button
              variant="outline"
              className="w-full"
              disabled={isFetching}
              onClick={() => fetchNextPage()}
            >
              {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Voir plus
            </Button>
          )}
        </div>
      )}

      <JobSearchFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        value={sheetValue}
        onApply={applyFilters}
      />
    </div>
  );
}
