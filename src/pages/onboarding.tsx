import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Seo } from "@/hooks/use-seo";
import { useQueryState } from "nuqs";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { isSignupVerified } from "@/lib/signup-verification";
import { scrollToTop } from "@/lib/app-scroll";
import {
  PersonalInfoForm,
  ProfileTypeForm,
  KycDocumentsForm,
  ConfirmationView,
} from "@/features/onboarding/components";

type OnboardingStep =
  | "personal-informations"
  | "profile-type"
  | "kyc-documents"
  | "confirmation";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useQueryState<OnboardingStep>("step", {
    defaultValue: "personal-informations",
    parse: (value) => value as OnboardingStep,
    serialize: (value) => value,
  });

  const hydrateFromStorage = useOnboardingStore(
    (state) => state.hydrateFromStorage,
  );

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void hydrateFromStorage().finally(() => setHydrated(true));
  }, [hydrateFromStorage]);

  // The document upload and the account creation need a verified phone
  // number. Reaching them without one — a link to a later step, a token that
  // expired or was refused — goes back to step 1, whose « Suivant » asks for
  // the WhatsApp code. Only once the store is hydrated, or every reload would
  // bounce back before the saved verification is read.
  const signupVerification = useOnboardingStore(
    (state) => state.signupVerification,
  );
  const phone = useOnboardingStore((state) => state.personalInfo.phone);
  useEffect(() => {
    if (!hydrated) return;
    if (step !== "kyc-documents" && step !== "confirmation") return;
    if (!isSignupVerified(signupVerification, phone)) {
      void setStep("personal-informations");
    }
  }, [hydrated, step, signupVerification, phone, setStep]);

  useEffect(() => {
    if (typeof globalThis !== "undefined") {
      globalThis.history.scrollRestoration = "manual";
      scrollToTop();
    }
  }, [step]);

  const handleSuccess = useCallback(
    (email: string, creditedBalance: number) => {
      const params = new URLSearchParams({ email, credit: String(creditedBalance) });
      navigate(`/onboarding/success?${params.toString()}`);
    },
    [navigate],
  );

  const handleError = useCallback(() => {
    const { error } = useOnboardingStore.getState();
    const params = new URLSearchParams({
      message: error ?? "",
    });
    navigate(`/onboarding/error?${params.toString()}`);
  }, [navigate]);

  const renderStep = useCallback(() => {
    switch (step) {
      case "personal-informations":
        return (
          <PersonalInfoForm onNext={() => setStep("profile-type")} />
        );
      case "profile-type":
        return (
          <ProfileTypeForm
            currentStep="profile-type"
            onBack={() => setStep("personal-informations")}
            onNext={() => setStep("kyc-documents")}
          />
        );
      case "kyc-documents":
        return (
          <KycDocumentsForm
            onBack={() => setStep("profile-type")}
            onNext={() => setStep("confirmation")}
          />
        );
      case "confirmation":
        return (
          <ConfirmationView
            currentStep="confirmation"
            onBack={() => setStep("kyc-documents")}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        );
      default:
        return null;
    }
  }, [step, setStep, handleSuccess, handleError]);

  return (
    <>
      <Seo
        title="Créer un compte - Rabotka"
        description="Rejoignez Rabotka et créez votre profil vérifié en quelques étapes. Travailleurs et recruteurs, connectez-vous via WhatsApp sans télécharger d'application."
        canonical="/onboarding"
        noIndex={false}
      />
      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        {/* No max-width of its own: PublicShell caps the column at 512px, and
            a wider constraint here would only be dead weight that misleads. */}
        {/* One 16px gutter, on the card, once. This was `p-4` out here AND
            `p-4 lg:p-8` on the card, so the most important form in the product
            paid 32px a side on a phone — on the screen where every pixel of
            field width matters most. */}
        <div className="w-full">
          <div className="bg-white p-4">{renderStep()}</div>
        </div>
      </div>
    </>
  );
}
