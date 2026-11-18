// @vitest-environment node
// Pure derivation from the profile query — no DOM needed, and the shared jsdom
// environment currently fails to load its native `canvas` binding.
import { describe, expect, it, vi, beforeEach } from "vitest";

const useProfileMe = vi.fn();
vi.mock("@/hooks/use-profile-me", () => ({
  useProfileMe: () => useProfileMe() as unknown,
}));

const { useKycGate, kycBlockReason } = await import("@/hooks/use-kyc-gate");

/** The hook derives everything from the query, so it needs no React runtime. */
function gateFor(
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED" | "NOT_SUBMITTED" | "SOMETHING_NEW",
  isLoading = false,
) {
  useProfileMe.mockReturnValue({
    data: verificationStatus ? { verificationStatus } : undefined,
    isLoading,
  });
  return useKycGate();
}

describe("useKycGate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lets a verified profile act", () => {
    const gate = gateFor("VERIFIED");
    expect(gate.isVerified).toBe(true);
    expect(gate.blocked).toBe(false);
    expect(gate.reason).toBeNull();
  });

  it("blocks a pending profile with the pending reason", () => {
    const gate = gateFor("PENDING");
    expect(gate.blocked).toBe(true);
    expect(gate.reason).toBe("PENDING");
    expect(gate.isPending).toBe(true);
  });

  it("blocks a rejected profile with its own reason", () => {
    // The two must stay distinguishable — rejected users get different copy.
    const gate = gateFor("REJECTED");
    expect(gate.blocked).toBe(true);
    expect(gate.reason).toBe("REJECTED");
    expect(gate.isRejected).toBe(true);
  });

  it("is optimistic while the profile is still loading", () => {
    // Blocking on load would flash a warning at verified users on every screen.
    // Safe to be permissive: the server enforces the same rule.
    const gate = gateFor(undefined, true);
    expect(gate.blocked).toBe(false);
    expect(gate.reason).toBeNull();
  });

  it("does not block when there is no profile at all", () => {
    // Logged out / query failed — AuthGuard owns that case, not this hook.
    const gate = gateFor(undefined, false);
    expect(gate.blocked).toBe(false);
  });
});

describe("documents not sent (« Plus tard »)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks with the MISSING reason, never the pending one", () => {
    const gate = gateFor("NOT_SUBMITTED");
    expect(gate.blocked).toBe(true);
    expect(gate.reason).toBe("MISSING");
    expect(gate.isMissing).toBe(true);
    expect(gate.isPending).toBe(false);
  });

  it("reads an unknown status as pending rather than letting it through", () => {
    const gate = gateFor("SOMETHING_NEW");
    expect(gate.blocked).toBe(true);
    expect(gate.reason).toBe("PENDING");
  });

  it("maps each status to its copy", () => {
    expect(kycBlockReason("NOT_SUBMITTED")).toBe("MISSING");
    expect(kycBlockReason("REJECTED")).toBe("REJECTED");
    expect(kycBlockReason("PENDING")).toBe("PENDING");
    expect(kycBlockReason(null)).toBe("PENDING");
    expect(kycBlockReason(undefined)).toBe("PENDING");
  });
});
