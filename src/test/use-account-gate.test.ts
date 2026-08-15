// @vitest-environment node
// Pure derivation from the profile query — no DOM needed, and the shared jsdom
// environment currently fails to load its native `canvas` binding.
import { describe, expect, it, vi, beforeEach } from "vitest";

const useProfileMe = vi.fn();
vi.mock("@/hooks/use-profile-me", () => ({
  useProfileMe: () => useProfileMe() as unknown,
}));

const { useAccountGate } = await import("@/hooks/use-account-gate");

type Status = "PENDING_ACTIVATION" | "ACTIVE" | "SUSPENDED" | "BANNED";

/** The hook derives everything from the query, so it needs no React runtime. */
function useGateFor(status?: Status, isLoading = false) {
  useProfileMe.mockReturnValue({
    data: status ? { status } : undefined,
    isLoading,
  });
  return useAccountGate();
}

describe("useAccountGate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lets an active account apply", () => {
    const gate = useGateFor("ACTIVE");
    expect(gate.isActive).toBe(true);
    expect(gate.blocked).toBe(false);
    expect(gate.reason).toBeNull();
  });

  it("blocks a suspended account", () => {
    // The whole point of the fix: browsing stays open, applying does not.
    const gate = useGateFor("SUSPENDED");
    expect(gate.blocked).toBe(true);
    expect(gate.reason).toBe("SUSPENDED");
    expect(gate.isSuspended).toBe(true);
  });

  it("blocks a banned account with its own reason", () => {
    // Must stay distinguishable from SUSPENDED — different copy, no way back.
    const gate = useGateFor("BANNED");
    expect(gate.blocked).toBe(true);
    expect(gate.reason).toBe("BANNED");
    expect(gate.isBanned).toBe(true);
  });

  it("blocks an account still pending activation", () => {
    const gate = useGateFor("PENDING_ACTIVATION");
    expect(gate.blocked).toBe(true);
    expect(gate.reason).toBe("PENDING_ACTIVATION");
  });

  it("is optimistic while the profile is still loading", () => {
    // Blocking on load would flash a warning at active users on every screen.
    // Safe to be permissive: ApplicationService.create enforces the same rule.
    const gate = useGateFor(undefined, true);
    expect(gate.blocked).toBe(false);
    expect(gate.reason).toBeNull();
  });

  it("does not block when there is no profile at all", () => {
    // Logged out / query failed — AuthGuard owns that case, not this hook.
    const gate = useGateFor(undefined, false);
    expect(gate.blocked).toBe(false);
  });
});
