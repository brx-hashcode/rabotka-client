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
import { Switch } from "@/components/ui/switch";
import { CategoryCombobox } from "@/components/common/category-combobox";
import { useJobCategories } from "@/hooks/use-worker-search";
import type {
  JobPaymentFlow,
  JobSearchSort,
} from "@/lib/api/job-feed-controller";
import { cn } from "@/lib/utils";

export type JobDatePreset = "all" | "today" | "7d" | "30d";

export type JobSearchFilters = {
  categoryId: string | null;
  city: string;
  paymentFlow: JobPaymentFlow | null;
  minAmount: number | null;
  datePreset: JobDatePreset;
  hideApplied: boolean;
  sort: JobSearchSort;
};

export const EMPTY_JOB_FILTERS: JobSearchFilters = {
  categoryId: null,
  city: "",
  paymentFlow: null,
  minAmount: null,
  datePreset: "all",
  hideApplied: false,
  sort: "recent",
};

const FLOW_OPTIONS: { label: string; value: JobPaymentFlow | null }[] = [
  { label: "Toutes", value: null },
  { label: "Heure", value: "HOURLY" },
  { label: "Jour", value: "DAILY" },
  { label: "Mois", value: "MONTHLY" },
];

/**
 * Amount presets are scaled per payment flow — 5 000 FCFA means something very
 * different by the hour vs by the month, so a single shared scale would be
 * meaningless. Bounded by the offer DTO's 1 000–1 000 000 FCFA range.
 */
const AMOUNT_PRESETS: Record<JobPaymentFlow, number[]> = {
  HOURLY: [1000, 2500, 5000],
  DAILY: [5000, 10000, 25000],
  MONTHLY: [50000, 100000, 250000],
};

const DATE_OPTIONS: { label: string; value: JobDatePreset }[] = [
  { label: "Toutes", value: "all" },
  { label: "Aujourd'hui", value: "today" },
  { label: "7 jours", value: "7d" },
  { label: "30 jours", value: "30d" },
];

const SORT_OPTIONS: { label: string; value: JobSearchSort }[] = [
  { label: "Récentes", value: "recent" },
  { label: "Bientôt", value: "soon" },
  { label: "Mieux payées", value: "amount_desc" },
];

/** Compact FCFA label for the preset chips ("10 000+"). */
const shortAmount = (n: number) => `${n.toLocaleString("fr-FR")}+`;

function ChipRow<T>({
  options,
  value,
  onChange,
}: Readonly<{
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}>) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-md py-2 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-whatsapp text-white"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly value: JobSearchFilters;
  readonly onApply: (filters: JobSearchFilters) => void;
};

export function JobSearchFiltersSheet({
  open,
  onOpenChange,
  value,
  onApply,
}: Readonly<Props>) {
  const { data: categories = [] } = useJobCategories();
  const [draft, setDraft] = useState<JobSearchFilters>(value);
  // Portal target so the combobox dropdown renders inside the sheet (and stays
  // scrollable within the sheet's scroll-lock).
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // Sync the draft with the applied filters each time the sheet opens.
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const set = <K extends keyof JobSearchFilters>(
    k: K,
    v: JobSearchFilters[K],
  ) => setDraft((d) => ({ ...d, [k]: v }));

  // Clearing the flow must clear the amount too — the presets only mean
  // something relative to a flow.
  const setFlow = (flow: JobPaymentFlow | null) =>
    setDraft((d) => ({
      ...d,
      paymentFlow: flow,
      minAmount: flow === null ? null : d.minAmount,
    }));

  const amountOptions = draft.paymentFlow
    ? [
        { label: "Tous", value: null as number | null },
        ...AMOUNT_PRESETS[draft.paymentFlow].map((v) => ({
          label: shortAmount(v),
          value: v as number | null,
        })),
      ]
    : [];

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
          {/* Domaine */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Domaine</Label>
            <CategoryCombobox
              options={categories}
              value={draft.categoryId}
              onChange={(id) => set("categoryId", id)}
              allLabel="Tous les domaines"
              placeholder="Tous les domaines"
              container={container}
            />
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <Label htmlFor="job-city" className="text-sm font-medium">
              Ville / quartier
            </Label>
            <Input
              id="job-city"
              value={draft.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Bacongo, Poto-Poto…"
            />
          </div>

          {/* Payment flow */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Mode de paiement</Label>
            <ChipRow
              options={FLOW_OPTIONS}
              value={draft.paymentFlow}
              onChange={setFlow}
            />
          </div>

          {/* Amount — only meaningful once a flow is chosen */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Montant minimum</Label>
            {draft.paymentFlow ? (
              <ChipRow
                options={amountOptions}
                value={draft.minAmount}
                onChange={(v) => set("minAmount", v)}
              />
            ) : (
              <p className="rounded-md bg-secondary/60 px-3 py-2.5 text-xs text-muted-foreground">
                Choisissez d'abord un mode de paiement.
              </p>
            )}
          </div>

          {/* Scheduled date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Date de mission</Label>
            <ChipRow
              options={DATE_OPTIONS}
              value={draft.datePreset}
              onChange={(v) => set("datePreset", v)}
            />
          </div>

          {/* Hide applied */}
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="hide-applied" className="text-sm font-medium">
              Masquer les offres où j'ai déjà postulé
            </Label>
            <Switch
              id="hide-applied"
              checked={draft.hideApplied}
              onCheckedChange={(v) => set("hideApplied", v)}
            />
          </div>

          {/* Sort */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Trier par</Label>
            <ChipRow
              options={SORT_OPTIONS}
              value={draft.sort}
              onChange={(v) => set("sort", v)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDraft(EMPTY_JOB_FILTERS)}
            >
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
