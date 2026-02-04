import { useEffect, useState } from "react";
import { useQueryState } from "nuqs";
import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  StepIndicator,
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
    (state) => state.hydrateFromStorage
  );
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  // Hydrate store from sessionStorage on mount
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const showProgress =
    step === "personal-informations" ||
    step === "kyc-documents" ||
    step === "confirmation";

  const renderStep = () => {
    switch (step) {
      case "personal-informations":
        return <PersonalInfoForm onNext={() => setStep("kyc-documents")} />;
      case "kyc-documents":
        return (
          <KycDocumentsForm
            onBack={() => setStep("personal-informations")}
            onNext={() => setStep("confirmation")}
          />
        );
      case "confirmation":
        return (
          <ConfirmationView
            onBack={() => setStep("kyc-documents")}
            onSuccess={() => setIsSuccessModalOpen(true)}
            onError={() => setIsErrorModalOpen(true)}
          />
        );
      default:
        return <PersonalInfoForm onNext={() => setStep("kyc-documents")} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {showProgress && <StepIndicator currentStep={step} />}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          {renderStep()}
        </div>
      </div>

      {/* Modals */}
      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
      />
      <ErrorModal open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen} />
    </div>
  );
}
