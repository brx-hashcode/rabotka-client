import { useCallback, useEffect, useState } from "react";
import { Seo } from "@/hooks/use-seo";
import { useQueryState } from "nuqs";
import { useSearchParams } from "react-router";
import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  PersonalInfoForm,
  KycDocumentsForm,
  ConfirmationView,
  SuccessModal,
  ErrorModal,
} from "@/features/onboarding/components";

type OnboardingStep =
  | "personal-informations"
  | "kyc-documents"
  | "confirmation"
  | "success"
  | "error";

export default function Onboarding() {
  const [step, setStep] = useQueryState<OnboardingStep>("step", {
    defaultValue: "personal-informations",
    parse: (value) => value as OnboardingStep,
    serialize: (value) => value,
  });

  const [searchParams] = useSearchParams();
  const hydrateFromStorage = useOnboardingStore(
    (state) => state.hydrateFromStorage,
  );
  const setKycData = useOnboardingStore((state) => state.setKycData);
  const profileTypeParam = searchParams.get("profileType");

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  useEffect(() => {
    void hydrateFromStorage().then(() => {
      if (profileTypeParam === "WORKER" || profileTypeParam === "EMPLOYER") {
        setKycData({ profileType: profileTypeParam });
      }
    });
  }, [hydrateFromStorage, profileTypeParam, setKycData]);

  useEffect(() => {
    if (typeof globalThis !== "undefined") {
      globalThis.history.scrollRestoration = "manual";
      globalThis.scrollTo(0, 0);
    }
  }, []);

  const renderStep = useCallback(() => {
    switch (step) {
      case "personal-informations":
        return (
          <PersonalInfoForm
            currentStep="personal-informations"
            onNext={() => setStep("kyc-documents")}
          />
        );
      case "kyc-documents":
        return (
          <KycDocumentsForm
            currentStep="kyc-documents"
            onBack={() => setStep("personal-informations")}
            onNext={() => setStep("confirmation")}
          />
        );
      case "confirmation":
        return (
          <ConfirmationView
            currentStep="confirmation"
            onBack={() => setStep("kyc-documents")}
            onSuccess={(email) => {
              setSubmittedEmail(email);
              setIsSuccessModalOpen(true);
            }}
            onError={() => setIsErrorModalOpen(true)}
          />
        );
      default:
        return null;
    }
  }, [step, setStep]);

  return (
    <>
      <Seo
        title="Créer un compte - Rabotka"
        description="Rejoignez Rabotka et créez votre profil vérifié en quelques étapes. Travailleurs et employeurs, connectez-vous via WhatsApp sans télécharger d'application."
        canonical="/onboarding"
        noIndex={false}
      />
    <div className="pt-24 lg:pt-28 pb-8 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto p-4 lg:p-0">
        <div className="bg-white rounded-lg lg:p-8 p-4">{renderStep()}</div>
      </div>

      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        email={submittedEmail}
      />
      <ErrorModal open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen} />
    </div>
    </>
  );
}
