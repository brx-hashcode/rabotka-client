import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQueryState, parseAsInteger, parseAsFloat } from "nuqs";
import { ArrowLeft, Search, SlidersHorizontal, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendedWorkerCard } from "@/features/home/components/recommended-worker-card";
import {
  SearchFiltersSheet,
  type SearchFilters,
} from "@/features/home/components/search-filters-sheet";
import { useWorkerSearch } from "@/hooks/use-worker-search";
import { cn } from "@/lib/utils";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4"];

export default function WorkerSearch() {
  const navigate = useNavigate();

  const [q, setQ] = useQueryState("q", { defaultValue: "", clearOnDefault: true });
  const [categoryId, setCategoryId] = useQueryState("category");
  const [minReliability, setMinReliability] = useQueryState(
    "minReliability",
    parseAsInteger,
  );
  const [minRating, setMinRating] = useQueryState("minRating", parseAsFloat);
  const [city, setCity] = useQueryState("city", {
    defaultValue: "",
    clearOnDefault: true,
  });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [input, setInput] = useState(q);

  // Debounce the text field into the URL `q` param that drives the query.
  useEffect(() => {
    const t = setTimeout(() => setQ(input), 300);
    return () => clearTimeout(t);
  }, [input, setQ]);

  const filters = {
    q: q || undefined,
    categoryId: categoryId || undefined,
    minReliability: minReliability ?? undefined,
    minRating: minRating ?? undefined,
    city: city || undefined,
  };

  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    useWorkerSearch(filters);

  const list = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const activeFilterCount =
    (categoryId ? 1 : 0) +
    (minReliability ? 1 : 0) +
    (minRating ? 1 : 0) +
    (city ? 1 : 0);

  const applyFilters = (f: SearchFilters) => {
    setCategoryId(f.categoryId);
    setMinReliability(f.minReliability);
    setMinRating(f.minRating);
    setCity(f.city);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
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
              placeholder="Nom, mots-clés..."
              className="h-11 w-full rounded-md bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
            />
          </div>
          <button
            type="button"
            aria-label="Filtres"
            onClick={() => setFiltersOpen(true)}
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
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
            <Skeleton key={k} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Aucun travailleur trouvé. Essayez d'autres mots-clés ou filtres.
          </p>
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <div className="space-y-3 px-4 py-4">
          <p className="text-xs text-muted-foreground">
            {total} résultat{total > 1 ? "s" : ""}
          </p>
          {list.map((w) => (
            <RecommendedWorkerCard key={w.id} worker={w} />
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

      <SearchFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        value={{
          categoryId: categoryId ?? null,
          minReliability: minReliability ?? null,
          minRating: minRating ?? null,
          city: city ?? "",
        }}
        onApply={applyFilters}
      />
    </div>
  );
}
