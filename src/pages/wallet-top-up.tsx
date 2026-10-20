import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Loader2, Lock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScreenHeader } from "@/features/employer";
import { useWalletBalance, useTopUpWallet } from "@/hooks/use-wallet";
import { usePaymentGateways } from "@/hooks/use-payment-gateways";
import {
  WALLET_MIN_TOP_UP,
  WALLET_MAX_TOP_UP,
} from "@/lib/api/wallet-controller";
import { networkNames, topUpError } from "@/lib/top-up";
import { useToast } from "@/hooks/use-toast";
import { OFFLINE_ACTION_HINT, useIsOnline } from "@/hooks/use-is-online";
import { cn, formatAmount } from "@/lib/utils";

const PRESETS = [1000, 2500, 5000, 10000] as const;

export default function WalletTopUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const { data: gateways } = usePaymentGateways();
  const topUp = useTopUpWallet();
  const online = useIsOnline();
  const [amount, setAmount] = useState<number | null>(null);

  const error = topUpError(amount, WALLET_MIN_TOP_UP, WALLET_MAX_TOP_UP);
  const valid = amount != null && error === null;
  // The networks really on offer, from the live gateway — the page used to
  // promise « MTN / Airtel » whatever was enabled.
  const live = gateways?.gateways.find((g) => g.key === gateways.active);
  const networks = networkNames(live?.operators ?? []);

  const handleRecharge = () => {
    if (!valid || amount == null) return;
    topUp.mutate(amount, {
      onSuccess: ({ token }) =>
        navigate(`/pay/${token}?return=${encodeURIComponent("/profile")}`),
      onError: (err) =>
        toast({
          variant: "destructive",
          description:
            err instanceof Error && err.message
              ? err.message
              : "Impossible de démarrer la recharge.",
        }),
    });
  };

  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader
        title="Recharger mon portefeuille"
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 space-y-6 px-4 pt-4">
        {/* Balance, and what it becomes: the number the person came to change. */}
        <div className="rounded-xl bg-card p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime">
              <Wallet className="h-5 w-5 text-lime-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Solde actuel</p>
              {balanceLoading ? (
                <Skeleton className="mt-1 h-6 w-24" />
              ) : (
                <p className="text-xl font-bold text-foreground">
                  {/* Unknown (offline, never loaded) is not zero. */}
                  {balance == null ? "—" : formatAmount(balance)}
                </p>
              )}
            </div>
          </div>
          {valid && amount != null && !balanceLoading && balance != null && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-lime/50 px-3 py-2 text-sm text-lime-foreground">
              <span>Après la recharge</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <ArrowRight className="h-3.5 w-3.5" />
                {formatAmount(balance + amount)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Montant à recharger
          </p>
          {/* A real radiogroup: one amount at a time, announced as such. */}
          <div
            role="radiogroup"
            aria-label="Montants suggérés"
            className="grid grid-cols-2 gap-3"
          >
            {PRESETS.map((preset) => {
              const selected = amount === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setAmount(preset)}
                  className={cn(
                    "rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors active:scale-[0.98] motion-reduce:active:scale-100",
                    selected
                      ? "bg-whatsapp text-white shadow-soft"
                      : "bg-card text-foreground shadow-soft hover:bg-secondary",
                  )}
                >
                  {formatAmount(preset)}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5 pt-1">
            <label
              htmlFor="custom-amount"
              className="text-sm text-muted-foreground"
            >
              Ou un autre montant
            </label>
            <div className="relative">
              <Input
                id="custom-amount"
                type="number"
                inputMode="numeric"
                min={WALLET_MIN_TOP_UP}
                max={WALLET_MAX_TOP_UP}
                placeholder="Ex : 3000"
                aria-invalid={error !== null}
                aria-describedby="amount-help"
                className="pr-16"
                value={amount ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setAmount(v === "" ? null : Number(v));
                }}
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
                FCFA
              </span>
            </div>
            <p
              id="amount-help"
              className={cn(
                "text-xs",
                error ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {error ??
                `Entre ${formatAmount(WALLET_MIN_TOP_UP)} et ${formatAmount(WALLET_MAX_TOP_UP)}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Pinned, like the offer screen's: the action stays in reach, and the
          reassurance sits with it at the foot rather than mid-form. */}
      {/* `-bottom-6`: AppShell pads <main> 24px at the bottom and a sticky
          element stops at that padding, which left the page showing under
          the bar. */}
      <div className="sticky -bottom-6 space-y-2.5 bg-background px-4 pb-4 pt-3">
        <Button
          className="h-12 w-full bg-whatsapp text-base text-white hover:bg-whatsapp-dark"
          disabled={!valid || topUp.isPending || !online}
          onClick={handleRecharge}
        >
          {topUp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!online
            ? OFFLINE_ACTION_HINT
            : valid && amount != null
              ? `Recharger ${formatAmount(amount)}`
              : "Choisissez un montant"}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="h-3 w-3 shrink-0" />
          {networks.length > 0
            ? `Paiement Mobile Money sécurisé · ${networks.join(", ")}`
            : "Paiement Mobile Money sécurisé"}
        </p>
      </div>
    </div>
  );
}
