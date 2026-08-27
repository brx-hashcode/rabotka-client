import { describe, expect, it, vi, beforeEach } from "vitest";
// `fireEvent`, not `user-event`: the latter is not a dependency of this repo,
// and these assertions are about what the screen shows, not about the fidelity
// of the typing.
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import OAuthConsentPage from "@/pages/oauth-consent";
import type { ConsentContext } from "@/lib/api/oauth-controller";

const getConsentContext = vi.fn();
const sendConsentOtp = vi.fn();
const verifyConsentOtp = vi.fn();
const decideConsent = vi.fn();

vi.mock("@/lib/api/oauth-controller", () => ({
  getConsentContext: (...args: unknown[]) => getConsentContext(...args),
  sendConsentOtp: (...args: unknown[]) => sendConsentOtp(...args),
  verifyConsentOtp: (...args: unknown[]) => verifyConsentOtp(...args),
  decideConsent: (...args: unknown[]) => decideConsent(...args),
}));

const CONTEXT: ConsentContext = {
  app: {
    name: "Chantier SARL",
    description: "Plateforme de recrutement pour le BTP.",
    logoUrl: null,
  },
  scopes: ["openid", "profile", "phone", "rabotka:verification"],
  profile: null,
  alreadyGranted: false,
};

const SIGNED_IN: ConsentContext = {
  ...CONTEXT,
  profile: { firstName: "Amina", lastName: "Nkemdirim", phoneHint: "••42" },
};

function renderPage(interaction: string | null = "int-1") {
  const path = interaction
    ? `/oauth/consent?interaction=${interaction}`
    : "/oauth/consent";

  return render(
    <MemoryRouter initialEntries={[path]}>
      <OAuthConsentPage />
    </MemoryRouter>,
  );
}

describe("OAuth consent screen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("names the application, so the decision being made stays on screen", async () => {
    getConsentContext.mockResolvedValue(CONTEXT);
    renderPage();

    expect(await screen.findByText(/Chantier SARL/)).toBeInTheDocument();
    expect(
      screen.getByText("Plateforme de recrutement pour le BTP."),
    ).toBeInTheDocument();
  });

  it("asks for a phone number when there is no live session", async () => {
    getConsentContext.mockResolvedValue(CONTEXT);
    renderPage();

    expect(
      await screen.findByLabelText(/Numéro de téléphone/i),
    ).toBeInTheDocument();
  });

  /** The single-sign-on path: /authorize reused a session, so no OTP. */
  it("goes straight to consent when a session was reused", async () => {
    getConsentContext.mockResolvedValue(SIGNED_IN);
    renderPage();

    expect(
      await screen.findByText(/Amina Nkemdirim · ••42/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Autoriser" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refuser" })).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Numéro de téléphone/i),
    ).not.toBeInTheDocument();
  });

  it("lists each granted scope in plain French, and never openid", async () => {
    getConsentContext.mockResolvedValue(SIGNED_IN);
    renderPage();

    expect(
      await screen.findByText("Votre nom et votre photo de profil"),
    ).toBeInTheDocument();
    expect(screen.getByText("Votre numéro de téléphone")).toBeInTheDocument();
    expect(
      screen.getByText("Votre statut de vérification Rabotka"),
    ).toBeInTheDocument();
    // Not requested here, so it must not appear.
    expect(screen.queryByText("Votre adresse e-mail")).not.toBeInTheDocument();
    expect(screen.queryByText(/openid/i)).not.toBeInTheDocument();
  });

  it("skips a scope it has no wording for rather than printing it raw", async () => {
    getConsentContext.mockResolvedValue({
      ...SIGNED_IN,
      scopes: ["openid", "profile", "rabotka:something_new"],
    });
    renderPage();

    expect(
      await screen.findByText("Votre nom et votre photo de profil"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/something_new/)).not.toBeInTheDocument();
  });

  it("sends the user to signup when the number has no Rabotka account", async () => {
    getConsentContext.mockResolvedValue(CONTEXT);
    sendConsentOtp.mockResolvedValue({ sent: false, reason: "no_account" });
    renderPage();

    const input = await screen.findByLabelText(/Numéro de téléphone/i);
    fireEvent.change(input, { target: { value: "+237690000000" } });
    fireEvent.click(screen.getByRole("button", { name: /Continuer/i }));

    expect(await screen.findByText("Aucun compte Rabotka")).toBeInTheDocument();
    // Opens in a new tab: this page is often a popup, and navigating it away
    // would destroy the login attempt the user is meant to return to.
    expect(
      screen.getByRole("link", { name: /Créer un compte Rabotka/i }),
    ).toHaveAttribute("target", "_blank");
  });

  it("hands the browser to the partner's redirect URI on approval", async () => {
    getConsentContext.mockResolvedValue(SIGNED_IN);
    decideConsent.mockResolvedValue({
      redirectTo: "https://partner.example/callback?code=abc&state=xyz",
    });

    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        set href(value: string) {
          assign(value);
        },
      },
    });

    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Autoriser" }));

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        "https://partner.example/callback?code=abc&state=xyz",
      ),
    );
    expect(decideConsent).toHaveBeenCalledWith("int-1", true);
  });

  it("reports a refusal to the partner too, rather than dead-ending", async () => {
    getConsentContext.mockResolvedValue(SIGNED_IN);
    decideConsent.mockResolvedValue({
      redirectTo: "https://partner.example/callback?error=access_denied",
    });

    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Refuser" }));

    await waitFor(() =>
      expect(decideConsent).toHaveBeenCalledWith("int-1", false),
    );
  });

  it("explains an expired interaction instead of showing an empty screen", async () => {
    getConsentContext.mockRejectedValue(new Error("gone"));
    renderPage();

    expect(await screen.findByText("Connexion impossible")).toBeInTheDocument();
    expect(screen.getByText(/a expiré/)).toBeInTheDocument();
  });

  it("errors rather than calling the API when there is no interaction id", async () => {
    renderPage(null);

    expect(await screen.findByText("Connexion impossible")).toBeInTheDocument();
    expect(getConsentContext).not.toHaveBeenCalled();
  });
});
