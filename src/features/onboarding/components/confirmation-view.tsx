import { useCallback } from "react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useOnboardingMutation } from "@/hooks/use-onboarding-mutation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { InfoCard } from "./info-card";
import { confirmationContent } from "@/content/onboarding";
import { StepIndicator } from "./step-indicator";
import { cn } from "@/lib/utils";

type OnboardingStep =
  | "personal-informations"
  | "kyc-documents"
  | "confirmation";

type ConfirmationViewProps = {
  currentStep: OnboardingStep;
  onBack: () => void;
  onSuccess: () => void;
  onError: () => void;
};

export function ConfirmationView({
  currentStep,
  onBack,
  onSuccess,
  onError,
}: Readonly<ConfirmationViewProps>) {
  const { personalInfo, kycData, isSubmitting } = useOnboardingStore();

  const mutation = useOnboardingMutation();

  const handleSubmit = useCallback(async () => {
    try {
      await mutation.mutateAsync();
      onSuccess();
    } catch (error) {
      console.error(error);
      onError();
    }
  }, [mutation, onSuccess, onError]);

  const content = confirmationContent;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <ClipboardList className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {content.pageTitle}
          </h3>
        </div>
        <StepIndicator currentStep={currentStep} variant="compact" />
      </div>
      <div className="space-y-6">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label={content.personalInfo.fields.firstName}
              icon={User}
              value={personalInfo.firstName}
            />
            <InfoCard
              label={content.personalInfo.fields.lastName}
              icon={User}
              value={personalInfo.lastName}
            />
            <InfoCard
              label={content.personalInfo.fields.email}
              icon={Mail}
              value={personalInfo.email}
            />
            <InfoCard
              label={content.personalInfo.fields.phone}
              icon={Phone}
              value={personalInfo.phone}
            />
            <InfoCard
              label={content.personalInfo.fields.address}
              icon={MapPin}
              value={personalInfo.address}
              colSpan={2}
            />
            <InfoCard
              label={content.personalInfo.fields.description}
              icon={FileText}
              value={
                personalInfo.description ||
                content.personalInfo.defaultDescription
              }
              colSpan={2}
            />
            <InfoCard
              label={content.personalInfo.fields.profileType}
              icon={Briefcase}
              value=""
              variant={kycData.profileType === "WORKER" ? "green" : "red"}
            >
              <Badge
                variant="default"
                className={cn(
                  "text-white font-semibold px-3 py-1",
                  kycData.profileType === "WORKER"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                )}
              >
                {kycData.profileType === "WORKER"
                  ? content.profileTypes.worker
                  : content.profileTypes.employer}
              </Badge>
            </InfoCard>
            <InfoCard
              label={content.personalInfo.fields.documentType}
              icon={CreditCard}
              value=""
            >
              <Badge
                variant="outline"
                className="text-gray-700 font-semibold px-3 py-1 border-gray-300"
              >
                {kycData.documentType === "IDENTITY_CARD"
                  ? content.documentTypes.identityCard
                  : kycData.documentType === "PASSPORT"
                    ? content.documentTypes.passport
                    : kycData.documentType === "DRIVER_LICENSE"
                      ? content.documentTypes.driverLicense
                      : "-"}
              </Badge>
            </InfoCard>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {content.kycDocuments.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {content.kycDocuments.documentIdentity}
              </p>
              {kycData.kycDocumentPreview ? (
                <div className="space-y-2">
                  <img
                    src={kycData.kycDocumentPreview}
                    alt="KYC Document"
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-xs text-gray-600 truncate">
                    {kycData.kycDocument?.name}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {content.kycDocuments.noDocument}
                </p>
              )}
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {content.kycDocuments.selfie}
              </p>
              {kycData.kycSelfiePreview ? (
                <div className="space-y-2">
                  <img
                    src={kycData.kycSelfiePreview}
                    alt="KYC Selfie"
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-xs text-gray-600 truncate">
                    {kycData.kycSelfie?.name}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {content.kycDocuments.noSelfie}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 hover:bg-transparent hover:text-primary/70 hover:border-primary/70"
        >
          {content.buttons.back}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || mutation.isPending}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
        >
          {isSubmitting || mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {content.buttons.submitting}
            </>
          ) : (
            content.buttons.confirm
          )}
        </Button>
      </div>
    </div>
  );
}
