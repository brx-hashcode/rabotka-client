import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  acceptInvite,
  declineInvite,
  getInvite,
} from "@/lib/api/agent-invite-controller";

const inviteKey = (token: string | undefined) => ["agent-invite", token];

export function useAgentInvite(token: string | undefined) {
  return useQuery({
    queryKey: inviteKey(token),
    queryFn: () => getInvite(token as string),
    enabled: Boolean(token),
    // A 404 ("not yours") or a stale link will not fix itself on retry.
    retry: false,
  });
}

/**
 * Accepting applies to the job — the same checks as applying from the offer.
 * On failure the invitation is re-read: if it expired or was answered in the
 * meantime, the page switches to that state instead of offering a button
 * that can only fail again.
 */
export function useAcceptInvite(token: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => acceptInvite(token as string),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inviteKey(token) });
      qc.invalidateQueries({ queryKey: ["daily-quota"] });
      qc.invalidateQueries({ queryKey: ["job-feed"] });
      toast.success("Candidature envoyée !");
    },
    onError: (err: Error) => {
      qc.invalidateQueries({ queryKey: inviteKey(token) });
      toast.error(err.message || "Impossible d'accepter l'invitation.");
    },
  });
}

export function useDeclineInvite(token: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => declineInvite(token as string),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inviteKey(token) });
      toast.success("Invitation refusée.");
    },
    onError: (err: Error) => {
      qc.invalidateQueries({ queryKey: inviteKey(token) });
      toast.error(err.message || "Impossible de refuser l'invitation.");
    },
  });
}
