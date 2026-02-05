import { useCallback, useEffect, useState } from "react";
import { useQueryState } from "nuqs";
import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  PersonalInfoForm,
  KycDocumentsForm,
  ConfirmationView,
  SuccessModal,
  ErrorModal,
  OnboardingLayout,
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
    (state) => state.hydrateFromStorage
  );
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

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
            onSuccess={() => setIsSuccessModalOpen(true)}
            onError={() => setIsErrorModalOpen(true)}
          />
        );
      default:
        return null;
    }
  }, [step, setStep]);

  return (
    <OnboardingLayout>
      <div className="w-full max-w-3xl mx-auto p-4 lg:p-0">
        <div className="bg-white rounded-lg lg:p-8 p-4 shadow-soft">
          {renderStep()}
        </div>
      </div>

      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
      />
      <ErrorModal open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen} />
    </OnboardingLayout>
  );
}
