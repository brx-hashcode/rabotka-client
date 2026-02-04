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
  UserCircle,
} from "lucide-react";
import { InfoCard } from "./info-card";

type ConfirmationViewProps = {
  onBack: () => void;
  onSuccess: () => void;
  onError: () => void;
};

export function ConfirmationView({
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

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Informations personnelles
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label="Prénom"
              icon={User}
              value={personalInfo.firstName}
            />
            <InfoCard label="Nom" icon={User} value={personalInfo.lastName} />
            <InfoCard label="Email" icon={Mail} value={personalInfo.email} />
            <InfoCard
              label="Téléphone"
              icon={Phone}
              value={personalInfo.phone}
            />
            <InfoCard
              label="Adresse"
              icon={MapPin}
              value={personalInfo.address}
              colSpan={2}
            />
            <InfoCard
              label="Description"
              icon={FileText}
              value={personalInfo.description || "Aucune description"}
              colSpan={2}
            />
            <InfoCard
              label="Type de profil"
              icon={Briefcase}
              value=""
              variant="green"
              colSpan={2}
            >
              <Badge
                variant="default"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1"
              >
                {kycData.profileType === "worker" ? "Worker" : "Employer"}
              </Badge>
            </InfoCard>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Documents KYC
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Document d'identité
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
                <p className="text-sm text-gray-500">Aucun document</p>
              )}
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selfie</p>
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
                <p className="text-sm text-gray-500">Aucun selfie</p>
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
          className="flex-1"
        >
          Retour
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
              Envoi en cours...
            </>
          ) : (
            "Confirmer"
          )}
        </Button>
      </div>
    </div>
  );
}
