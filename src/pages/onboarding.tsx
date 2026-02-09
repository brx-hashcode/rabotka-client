import { useCallback, useEffect, useState } from "react";
import { useQueryState } from "nuqs";
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

  const hydrateFromStorage = useOnboardingStore(
    (state) => state.hydrateFromStorage,
  );
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof globalThis !== "undefined") {
      globalThis.history.scrollRestoration = "manual";
      globalThis.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    return () => {
      useOnboardingStore.getState().resetStore();
    };
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
  );
}
