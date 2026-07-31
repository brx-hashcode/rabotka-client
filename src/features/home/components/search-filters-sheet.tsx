import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CategoryCombobox } from "@/components/common/category-combobox";
import { useJobCategories } from "@/hooks/use-worker-search";
import { cn } from "@/lib/utils";

export type SearchFilters = {
  categoryId: string | null;
  minReliability: number | null;
  minRating: number | null;
  city: string;
};

const RATING_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Toutes", value: null },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "4.5+", value: 4.5 },
];

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly value: SearchFilters;
  readonly onApply: (filters: SearchFilters) => void;
};

export function SearchFiltersSheet({
  open,
  onOpenChange,
  value,
  onApply,
}: Readonly<Props>) {
  const { data: categories = [] } = useJobCategories();
  const [draft, setDraft] = useState<SearchFilters>(value);
  // Portal target so the combobox dropdown renders inside the sheet (and stays
  // scrollable within the sheet's scroll-lock).
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // Sync the draft with the applied filters each time the sheet opens.
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const set = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const reset = () =>
    setDraft({ categoryId: null, minReliability: null, minRating: null, city: "" });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={setContainer}
        side="bottom"
        className="max-h-[88vh] overflow-y-auto rounded-t-2xl"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Filtres</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 py-4">
          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Catégorie</Label>
            <CategoryCombobox
              options={categories}
              value={draft.categoryId}
              onChange={(id) => set("categoryId", id)}
              allLabel="Toutes les catégories"
              placeholder="Toutes les catégories"
              container={container}
            />
          </div>

          {/* Reliability */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Fiabilité minimale</Label>
              <span className="text-sm text-muted-foreground">
                {draft.minReliability ?? 0}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[draft.minReliability ?? 0]}
              onValueChange={([v]) => set("minReliability", v === 0 ? null : v)}
            />
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Note minimale</Label>
            <div className="flex gap-2">
              {RATING_OPTIONS.map((opt) => {
                const active = (draft.minRating ?? null) === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => set("minRating", opt.value)}
                    className={cn(
                      "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-whatsapp text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm font-medium">
              Ville / quartier
            </Label>
            <Input
              id="city"
              value={draft.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Bacongo, Poto-Poto…"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={reset}>
              Réinitialiser
            </Button>
            <Button
              className="flex-1 bg-whatsapp text-white hover:bg-whatsapp-dark"
              onClick={() => {
                onApply(draft);
                onOpenChange(false);
              }}
            >
              Appliquer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
