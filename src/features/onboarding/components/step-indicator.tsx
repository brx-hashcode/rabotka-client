type OnboardingStep =
  | "personal-informations"
  | "kyc-documents"
  | "confirmation";

interface StepIndicatorProps {
  currentStep: OnboardingStep;
}

const stepMap: Record<OnboardingStep, number> = {
  "personal-informations": 1,
  "kyc-documents": 2,
  confirmation: 3,
};

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentStepNumber = stepMap[currentStep];
  const totalSteps = 3;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Étape {currentStepNumber}/{totalSteps}
        </span>
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
