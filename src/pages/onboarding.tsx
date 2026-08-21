import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { Seo } from "@/hooks/use-seo";
import { useQueryState } from "nuqs";
import { useOnboardingStore } from "@/stores/onboardingStore";
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

  useEffect(() => {
    void hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof globalThis !== "undefined") {
      globalThis.history.scrollRestoration = "manual";
      globalThis.scrollTo(0, 0);
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
        <div className="w-full max-w-3xl mx-auto p-4 lg:p-0">
          <div className="bg-white rounded-lg lg:p-8 p-4">{renderStep()}</div>
        </div>
      </div>
    </>
  );
}
