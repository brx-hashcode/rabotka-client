import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApplication,
  acceptApplication,
  rejectApplication,
  payUnlockWallet,
  payUnlockMobile,
  type ApplicationDetail,
} from "@/lib/api/application-controller";

const detailKey = (id: string) => ["application", id];

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplication(id as string),
    enabled: Boolean(id),
  });
}

export function useAcceptApplication(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => acceptApplication(id),
    // Write the returned detail (now WAITING_PAYMENT + unlock) straight into the
    // cache so the payment-method chooser appears immediately.
    onSuccess: (data: ApplicationDetail) => {
      qc.setQueryData(detailKey(id), data);
      qc.invalidateQueries({ queryKey: ["employer", "applications"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Impossible d'accepter la candidature."),
  });
}

export function useRejectApplication(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => rejectApplication(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: detailKey(id) });
      qc.invalidateQueries({ queryKey: ["employer", "applications"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Impossible de refuser la candidature."),
  });
}

export function usePayUnlockWallet(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => payUnlockWallet(id),
    onSuccess: (data: ApplicationDetail) => {
      qc.setQueryData(detailKey(id), data);
      qc.invalidateQueries({ queryKey: ["employer", "applications"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Le paiement a échoué."),
  });
}

export function usePayUnlockMobile(id: string) {
  return useMutation({
    mutationFn: () => payUnlockMobile(id),
    onError: (err: Error) =>
      toast.error(err.message || "Impossible de démarrer le paiement."),
  });
}
