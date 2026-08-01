import { useMutation, useQuery } from "@tanstack/react-query";
import { getWalletBalance, topUpWallet } from "@/lib/api/wallet-controller";

export function useWalletBalance() {
  return useQuery({
    queryKey: ["profile", "wallet", "balance"],
    queryFn: getWalletBalance,
    staleTime: 30 * 1000,
  });
}

// Creates a WALLET_TOP_UP payment request; the returned token drives /pay/:token.
export function useTopUpWallet() {
  return useMutation({
    mutationFn: (amount: number) => topUpWallet(amount),
  });
}
