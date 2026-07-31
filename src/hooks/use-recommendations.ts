import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getWorkerFeed,
  getRecommendedWorker,
  payRecommendationWallet,
  payRecommendationMobile,
} from "@/lib/api/recommendation-controller";

export function useWorkerFeed(limit = 10) {
  return useQuery({
    queryKey: ["worker-feed", limit],
    queryFn: () => getWorkerFeed(limit),
    // Keep the current list visible while a larger page is being fetched.
    placeholderData: keepPreviousData,
  });
}

export function useRecommendedWorker(id: string | undefined) {
  return useQuery({
    queryKey: ["recommended-worker", id],
    queryFn: () => getRecommendedWorker(id as string),
    enabled: Boolean(id),
  });
}

export function usePayRecommendationWallet(id: string) {
  return useMutation({
    mutationFn: () => payRecommendationWallet(id),
    onError: (err: Error) => toast.error(err.message || "Le paiement a échoué."),
  });
}

export function usePayRecommendationMobile(id: string) {
  return useMutation({
    mutationFn: () => payRecommendationMobile(id),
    onError: (err: Error) =>
      toast.error(err.message || "Impossible de démarrer le paiement."),
  });
}
