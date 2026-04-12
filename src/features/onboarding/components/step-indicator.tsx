import { stepIndicatorContent } from "@/content/onboarding";

type OnboardingStep =
  | "personal-informations"
  | "profile-type"
  | "kyc-documents"
  | "confirmation";

type StepIndicatorProps = {
  currentStep: OnboardingStep;
  variant?: "full" | "compact";
};

const stepMap: Record<OnboardingStep, number> = {
  "personal-informations": 1,
  "profile-type": 2,
  "kyc-documents": 3,
  confirmation: 4,
};

export function StepIndicator({
  currentStep,
  variant = "full",
}: Readonly<StepIndicatorProps>) {
  const currentStepNumber = stepMap[currentStep];
  const totalSteps = stepIndicatorContent.totalSteps;
  const stepText = stepIndicatorContent.stepFormat
    .replace("{current}", currentStepNumber.toString())
    .replace("{total}", totalSteps.toString());

  if (variant === "compact") {
    return (
      <span className="text-sm font-medium text-gray-700">{stepText}</span>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{stepText}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
