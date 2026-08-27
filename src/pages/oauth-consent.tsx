import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Step1PhoneForm,
  Step2OTPForm,
} from "@/features/landing/components/login-steps";
import { AppIdentityCard } from "@/features/oauth/components/app-identity-card";
import { ConsentStep } from "@/features/oauth/components/consent-step";
import { NoAccountNotice } from "@/features/oauth/components/no-account-notice";
import { consentContent } from "@/content/oauth/consent";
import {
  decideConsent,
  getConsentContext,
  sendConsentOtp,
  verifyConsentOtp,
  type ConsentContext,
} from "@/lib/api/oauth-controller";

type Step = "loading" | "phone" | "otp" | "no-account" | "consent" | "error";

/**
 * The hosted consent screen for "Login with Rabotka".
 *
 * Reached only by a redirect from the API's `/oauth/authorize`, which puts the
 * whole authorization request — application, scopes, redirect URI, PKCE
 * challenge — into a server-side interaction and hands this page nothing but an
 * opaque id. That split is the security model: everything on this page is a
 * display of state the browser cannot edit. A `scopes` array the user could
 * rewrite would let anyone grant themselves any claim.
 *
 * Renders in a ~480×720 popup as often as it renders full-page, so it uses
 * `PublicShell` (a narrow centred column, no nav, no bottom tabs) and never
 * assumes room for anything wider.
 */
export default function OAuthConsentPage() {
  const [searchParams] = useSearchParams();
  const interactionId = searchParams.get("interaction");

  const [step, setStep] = useState<Step>("loading");
  const [context, setContext] = useState<ConsentContext | null>(null);
  const [phone, setPhone] = useState("");
  // Typed as `string` rather than inferred: `consentContent` is `as const`, so
  // inference would pin this to the literal type of the default message and
  // reject every other error string.
  const [errorMessage, setErrorMessage] = useState<string>(
    consentContent.errors.generic,
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const fail = useCallback((message: string) => {
    setErrorMessage(message);
    setStep("error");
  }, []);

  useEffect(() => {
    if (!interactionId) {
      fail(consentContent.errors.generic);
      return;
    }

    let cancelled = false;

    getConsentContext(interactionId)
      .then((ctx) => {
        if (cancelled) return;
        setContext(ctx);
        // A live Rabotka session was reused by /authorize, so the phone and OTP
        // steps are already satisfied — this is the single-sign-on path that
        // makes a second partner application one tap.
        setStep(ctx.profile ? "consent" : "phone");
      })
      .catch(() => {
        if (!cancelled) fail(consentContent.errors.expired);
      });

    return () => {
      cancelled = true;
    };
  }, [interactionId, fail]);

  const handlePhone = useCallback(
    async ({ phone: submitted }: { phone: string }) => {
      if (!interactionId) return;
      setIsBusy(true);
      setServerError(null);

      try {
        const result = await sendConsentOtp(interactionId, submitted);
        setPhone(submitted);
        // `sent: false` is not a failure — see the note in oauth-controller.
        setStep(result.sent ? "otp" : "no-account");
      } catch {
        setServerError(consentContent.errors.generic);
      } finally {
        setIsBusy(false);
      }
    },
    [interactionId],
  );

  const handleOtp = useCallback(
    async ({ otp }: { otp: string }) => {
      if (!interactionId) return;
      setIsBusy(true);
      setServerError(null);

      try {
        const ctx = await verifyConsentOtp(interactionId, phone, otp);
        setContext(ctx);
        setStep("consent");
      } catch (error) {
        // The server counts attempts and says how many are left; when they run
        // out it burns the interaction, and there is nothing to retry against.
        const message = errorDescription(error);
        if (message?.includes("Relancez")) {
          fail(message);
          return;
        }
        setServerError(message ?? consentContent.errors.generic);
      } finally {
        setIsBusy(false);
      }
    },
    [interactionId, phone, fail],
  );

  const handleResend = useCallback(async () => {
    if (!interactionId || !phone) return;
    await sendConsentOtp(interactionId, phone);
  }, [interactionId, phone]);

  const handleDecision = useCallback(
    async (approve: boolean) => {
      if (!interactionId) return;
      setIsBusy(true);

      try {
        const { redirectTo } = await decideConsent(interactionId, approve);
        // A full assignment rather than react-router navigation: the
        // destination belongs to the partner, not to this SPA. The server built
        // it from the registered redirect URI, so it is not attacker-chosen
        // even though it is external.
        window.location.href = redirectTo;
      } catch (error) {
        setIsBusy(false);
        fail(errorDescription(error) ?? consentContent.errors.generic);
      }
    },
    [interactionId, fail],
  );

  const retryPhone = useCallback(() => {
    setServerError(null);
    setStep("phone");
  }, []);

  if (step === "loading" || !context) {
    return (
      <Screen>
        <div className="flex justify-center py-12">
          <Loader2
            aria-label={consentContent.loading}
            className="size-6 animate-spin text-muted-foreground"
          />
        </div>
      </Screen>
    );
  }

  if (step === "error") {
    return (
      <Screen>
        <div className="space-y-4 text-center">
          <AlertTriangle aria-hidden className="mx-auto size-8 text-destructive" />
          <h1 className="text-lg font-semibold">{consentContent.errors.title}</h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppIdentityCard
        name={context.app.name}
        description={context.app.description}
        logoUrl={context.app.logoUrl}
      />

      {step === "phone" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {consentContent.phone.description}
          </p>
          <Step1PhoneForm
            onSubmit={handlePhone}
            isLoading={isBusy}
            serverError={serverError}
          />
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {consentContent.otp.description}
          </p>
          <Step2OTPForm
            onSubmit={handleOtp}
            onResend={handleResend}
            isVerifying={isBusy}
            isResending={false}
            serverError={serverError}
          />
          <Button variant="ghost" className="w-full" onClick={retryPhone}>
            {consentContent.noAccount.retryButton}
          </Button>
        </div>
      )}

      {step === "no-account" && <NoAccountNotice onRetry={retryPhone} />}

      {step === "consent" && context.profile && (
        <ConsentStep
          profile={context.profile}
          scopes={context.scopes}
          isDeciding={isBusy}
          onApprove={() => handleDecision(true)}
          onDeny={() => handleDecision(false)}
        />
      )}
    </Screen>
  );
}

/**
 * The page's own frame, standing in for the app shells it deliberately does not
 * use.
 *
 * `min-h-svh` with vertical centring rather than a top-anchored column: in a
 * short popup the card should sit in the middle of the window, and `svh`
 * (rather than `vh`) is what accounts for mobile browser chrome that appears
 * and disappears as the user scrolls.
 *
 * `max-w-sm` because the widest this ever needs to be is a phone. A popup is
 * typically opened at ~480px, and a consent decision presented across a wide
 * desktop column is harder to read, not easier.
 */
function Screen({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm space-y-6">{children}</div>
    </div>
  );
}

/**
 * The `error_description` out of an OAuth-shaped failure.
 *
 * These endpoints answer `{ error, error_description }` rather than Nest's
 * usual `{ message }`, because that is the wire format OAuth clients require —
 * so the generic error handling elsewhere in this app does not find anything to
 * show, and this page reads it explicitly.
 */
function errorDescription(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const body = (error as { body?: { error_description?: string } }).body;
  return body?.error_description ?? null;
}
