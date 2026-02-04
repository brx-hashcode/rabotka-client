import { useState } from "react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useOnboardingMutation } from "@/hooks/use-onboarding-mutation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Eye } from "lucide-react";
import { DocumentPreview } from "./document-preview";

interface ConfirmationViewProps {
  onBack: () => void;
  onSuccess: () => void;
  onError: () => void;
}

export function ConfirmationView({
  onBack,
  onSuccess,
  onError,
}: ConfirmationViewProps) {
  const { personalInfo, kycData, isSubmitting } = useOnboardingStore();
  const mutation = useOnboardingMutation();
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync();
      onSuccess();
    } catch (error) {
      onError();
    }
  };

  const handleViewFile = (fileUrl: string | null, fileName: string) => {
    if (fileUrl) {
      setPreviewFileUrl(fileUrl);
      setPreviewFileName(fileName);
      setPreviewSheetOpen(true);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Récapitulatif</h2>
          <p className="text-sm text-gray-600 mt-1">
            Vérifiez vos informations avant de confirmer
          </p>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations personnelles
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-gray-700 w-24">Prénom:</span>
                <span className="text-gray-900">{personalInfo.firstName}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-24">Nom:</span>
                <span className="text-gray-900">{personalInfo.lastName}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-24">Email:</span>
                <span className="text-gray-900">{personalInfo.email}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-24">
                  Téléphone:
                </span>
                <span className="text-gray-900">{personalInfo.phone}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-24">Adresse:</span>
                <span className="text-gray-900">{personalInfo.address}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-700 mb-1">
                  Description:
                </span>
                <span className="text-gray-900">
                  {personalInfo.description}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Type de profil
            </h3>
            <Badge variant="default">
              {kycData.profileType === "worker" ? "Worker" : "Employer"}
            </Badge>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleViewFile(
                          kycData.kycDocumentPreview,
                          kycData.kycDocument?.name || "Document"
                        )
                      }
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir le fichier
                    </Button>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleViewFile(
                          kycData.kycSelfiePreview,
                          kycData.kycSelfie?.name || "Selfie"
                        )
                      }
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir le fichier
                    </Button>
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

      <Sheet open={previewSheetOpen} onOpenChange={setPreviewSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{previewFileName}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100vh-120px)]">
            {previewFileUrl && (
              <DocumentPreview
                fileUrl={previewFileUrl}
                fileName={previewFileName}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
