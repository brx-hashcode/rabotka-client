import { useState } from "react";
import { useNavigate } from "react-router";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScreenHeader } from "@/features/employer";
import { useWalletBalance, useTopUpWallet } from "@/hooks/use-wallet";
import {
  WALLET_MIN_TOP_UP,
  WALLET_MAX_TOP_UP,
} from "@/lib/api/wallet-controller";
import { useToast } from "@/hooks/use-toast";
import { cn, formatAmount } from "@/lib/utils";

const PRESETS = [1000, 2500, 5000, 10000] as const;

export default function WalletTopUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const topUp = useTopUpWallet();
  const [amount, setAmount] = useState<number | null>(null);

  const valid =
    amount != null && amount >= WALLET_MIN_TOP_UP && amount <= WALLET_MAX_TOP_UP;

  const handleRecharge = () => {
    if (!valid || amount == null) return;
    topUp.mutate(amount, {
      onSuccess: ({ token }) =>
        navigate(`/pay/${token}?return=${encodeURIComponent("/profile")}`),
      onError: (error) =>
        toast({
          variant: "destructive",
          description:
            error instanceof Error && error.message
              ? error.message
              : "Impossible de démarrer la recharge.",
        }),
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader
        title="Recharger mon portefeuille"
        onBack={() => navigate(-1)}
      />

      <div className="space-y-5 px-4 py-4">
        {/* Balance */}
        <div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-soft">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-whatsapp/10">
            <Wallet className="h-5 w-5 text-whatsapp" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Solde actuel</p>
            {balanceLoading ? (
              <Skeleton className="mt-1 h-6 w-24" />
            ) : (
              <p className="text-xl font-bold text-foreground">
                {formatAmount(balance ?? 0)}
              </p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Montant à recharger
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                  amount === preset
                    ? "bg-whatsapp text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {formatAmount(preset)}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="custom-amount"
              className="text-sm text-muted-foreground"
            >
              Ou un autre montant (FCFA)
            </label>
            <Input
              id="custom-amount"
              type="number"
              inputMode="numeric"
              min={WALLET_MIN_TOP_UP}
              max={WALLET_MAX_TOP_UP}
              placeholder="Ex : 3000"
              value={amount ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setAmount(v === "" ? null : Number(v));
              }}
            />
            <p className="text-xs text-muted-foreground">
              Entre {formatAmount(WALLET_MIN_TOP_UP)} et{" "}
              {formatAmount(WALLET_MAX_TOP_UP)}.
            </p>
          </div>
        </div>

        <Button
          className="w-full bg-whatsapp text-white hover:bg-whatsapp-dark"
          disabled={!valid || topUp.isPending}
          onClick={handleRecharge}
        >
          {topUp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {amount && valid
            ? `Recharger ${formatAmount(amount)}`
            : "Recharger"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Paiement sécurisé par Mobile Money (MTN / Airtel).
        </p>
      </div>
    </div>
  );
}
