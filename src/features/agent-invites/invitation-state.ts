import type { AgentInvite } from "@/lib/api/agent-invite-controller";

/** Which screen an invitation shows. */
export type InvitationState =
  | { kind: "open" }
  | { kind: "accepted"; applicationId: string | null }
  | { kind: "declined" }
  | { kind: "expired" }
  /** Withdrawn — the agent closed it, or it was replaced. */
  | { kind: "closed" };

export function invitationState(invite: AgentInvite): InvitationState {
  switch (invite.status) {
    case "CONFIRMED":
      return { kind: "accepted", applicationId: invite.applicationId };
    case "DECLINED":
      return { kind: "declined" };
    case "INVITED":
      return invite.expired ? { kind: "expired" } : { kind: "open" };
    default:
      return { kind: "closed" };
  }
}

/** Everything that can stop an open invitation from being accepted. */
export type AcceptGates = {
  offerClosed: boolean;
  accountBlockedLabel: string | null;
  kycBlockedLabel: string | null;
  dailyExhausted: boolean;
};

/**
 * The accept button: its label, and whether it can be pressed. Same order of
 * precedence as the offer screen — the offer first (nothing the worker does
 * reopens it), then the account, identity, and the application limits.
 */
export function acceptButton(gates: AcceptGates): {
  label: string;
  disabled: boolean;
} {
  if (gates.offerClosed)
    return { label: "Plus de place disponible", disabled: true };
  if (gates.accountBlockedLabel)
    return { label: gates.accountBlockedLabel, disabled: true };
  if (gates.kycBlockedLabel)
    return { label: gates.kycBlockedLabel, disabled: true };
  if (gates.dailyExhausted)
    return { label: "Limite quotidienne atteinte", disabled: true };
  return { label: "Accepter et postuler", disabled: false };
}
