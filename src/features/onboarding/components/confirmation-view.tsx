import { useCallback, useState } from "react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useOnboardingMutation } from "@/hooks/use-onboarding-mutation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router";
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
  Globe,
  Building2,
} from "lucide-react";
import { InfoCard } from "./info-card";
import { confirmationContent } from "@/content/onboarding";
import {
  documentTypeLabel as documentTypeLabelFor,
  requiresBackSide,
} from "@/lib/kyc-document-types";
import { StepIndicator } from "./step-indicator";
import { cn } from "@/lib/utils";

type OnboardingStep =
  | "personal-informations"
  | "profile-type"
  | "kyc-documents"
  | "confirmation";

type ConfirmationViewProps = {
  currentStep: OnboardingStep;
  onBack: () => void;
  onSuccess: (email: string, creditedBalance: number) => void;
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
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const handleSubmit = useCallback(async () => {
    try {
      const result = await mutation.mutateAsync();
      onSuccess(personalInfo.email, result.creditedBalance);
    } catch (error) {
      console.error(error);
      onError();
    }
  }, [mutation, onSuccess, onError, personalInfo.email]);

  const content = confirmationContent;

  const documentTypeLabel = documentTypeLabelFor(kycData.documentType) ?? "-";

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
              label={content.personalInfo.fields.country}
              icon={Globe}
              value={personalInfo.countryName}
            />
            <InfoCard
              label={content.personalInfo.fields.city}
              icon={Building2}
              value={personalInfo.city}
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
            {kycData.categoryNames.length > 0 && (
              <InfoCard
                label={content.personalInfo.fields.category}
                icon={Briefcase}
                value={kycData.categoryNames.join(", ")}
                colSpan={2}
              />
            )}
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
                    : "bg-red-500 hover:bg-red-600",
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
                variant="secondary"
                className="text-gray-700 font-semibold px-3 py-1 border-transparent"
              >
                {documentTypeLabel}
              </Badge>
            </InfoCard>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {content.kycDocuments.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card shadow-soft rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {content.kycDocuments.documentIdentity}
              </p>
              {kycData.kycDocumentPreview || kycData.kycDocumentUrl ? (
                <div className="space-y-2">
                  <img
                    src={kycData.kycDocumentPreview ?? kycData.kycDocumentUrl ?? ""}
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

            {requiresBackSide(kycData.documentType) && (
              <div className="bg-card shadow-soft rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {content.kycDocuments.documentIdentityBack}
                </p>
                {kycData.kycDocumentBackPreview ||
                kycData.kycDocumentBackUrl ? (
                  <div className="space-y-2">
                    <img
                      src={
                        kycData.kycDocumentBackPreview ??
                        kycData.kycDocumentBackUrl ??
                        ""
                      }
                      alt="KYC Document Back"
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="text-xs text-gray-600 truncate">
                      {kycData.kycDocumentBack?.name}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {content.kycDocuments.noDocument}
                  </p>
                )}
              </div>
            )}

            <div className="bg-card shadow-soft rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {content.kycDocuments.selfie}
              </p>
              {kycData.kycSelfiePreview || kycData.kycSelfieUrl ? (
                <div className="space-y-2">
                  <img
                    src={kycData.kycSelfiePreview ?? kycData.kycSelfieUrl ?? ""}
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

      <div className="flex items-start gap-3 rounded-lg bg-card shadow-soft p-4">
        <Checkbox
          id="policy-accept"
          checked={policyAccepted}
          onCheckedChange={(checked) => setPolicyAccepted(checked === true)}
          className="mt-0.5"
        />
        <label
          htmlFor="policy-accept"
          className="text-sm text-gray-700 leading-snug cursor-pointer"
        >
          J'ai lu et j'accepte les{" "}
          <Link
            to="/terms"
            rel="noopener noreferrer"
            className="text-green-600 underline underline-offset-2 hover:text-green-700"
            onClick={(e) => e.stopPropagation()}
          >
            conditions d'utilisation et la politique de confidentialité
          </Link>{" "}
          de la plateforme.
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full"
        >
          {content.buttons.back}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!policyAccepted || isSubmitting || mutation.isPending}
          className="w-full"
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
