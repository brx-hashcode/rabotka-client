// @vitest-environment node
// Pure helpers for the invitation page — no DOM or React runtime.
import { describe, expect, it } from "vitest";

import {
  acceptButton,
  invitationState,
  type AcceptGates,
} from "@/features/agent-invites/invitation-state";
import type { AgentInvite } from "@/lib/api/agent-invite-controller";

const invite = (over: Partial<AgentInvite> = {}): AgentInvite =>
  ({
    status: "INVITED",
    expiresAt: "2026-10-06T10:00:00Z",
    expired: false,
    agent: { firstName: "Jean" },
    applicationId: null,
    job: {} as AgentInvite["job"],
    ...over,
  }) as AgentInvite;

describe("invitationState", () => {
  it("is open while invited and valid", () => {
    expect(invitationState(invite())).toEqual({ kind: "open" });
  });

  it("is expired once the link has lapsed, even if still invited", () => {
    expect(invitationState(invite({ expired: true }))).toEqual({
      kind: "expired",
    });
  });

  it("points to the application once accepted", () => {
    expect(
      invitationState(invite({ status: "CONFIRMED", applicationId: "app-1" })),
    ).toEqual({ kind: "accepted", applicationId: "app-1" });
  });

  it("stays declined, and treats anything else as withdrawn", () => {
    expect(invitationState(invite({ status: "DECLINED" }))).toEqual({
      kind: "declined",
    });
    expect(invitationState(invite({ status: "UNREACHABLE" }))).toEqual({
      kind: "closed",
    });
  });
});

describe("acceptButton", () => {
  const open: AcceptGates = {
    offerClosed: false,
    accountBlockedLabel: null,
    kycBlockedLabel: null,
    dailyExhausted: false,
    tooManyActive: false,
  };

  it("lets the worker accept when nothing stands in the way", () => {
    expect(acceptButton(open)).toEqual({
      label: "Accepter et postuler",
      disabled: false,
    });
  });

  it("says why it cannot, offer first", () => {
    expect(
      acceptButton({
        ...open,
        offerClosed: true,
        kycBlockedLabel: "Vérifiez votre identité",
      }),
    ).toEqual({ label: "Plus de place disponible", disabled: true });
    expect(
      acceptButton({ ...open, kycBlockedLabel: "Vérifiez votre identité" }),
    ).toEqual({ label: "Vérifiez votre identité", disabled: true });
    expect(acceptButton({ ...open, dailyExhausted: true }).label).toBe(
      "Limite quotidienne atteinte",
    );
  });
});
