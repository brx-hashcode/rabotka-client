import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  step3Schema,
  step3SchemaBase,
  type Step3FormData,
} from "@/lib/validations/onboarding";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploadZone } from "./file-upload-zone";
import { kycDocumentsContent } from "@/content/onboarding";
import { compressImage } from "@/lib/image-compress";
import { useUploadKycFile } from "@/hooks/use-upload-kyc-file";
import { StepIndicator } from "./step-indicator";
import kycDocumentExample from "@/assets/kyc_document.png?format=webp";
import kycSelfieExample from "@/assets/kyc_selfie.png?format=webp";

const kycExampleImages: Record<"document" | "selfie", string> = {
  document: kycDocumentExample,
  selfie: kycSelfieExample,
};

type OnboardingStep =
  | "personal-informations"
  | "profile-type"
  | "kyc-documents"
  | "confirmation";

type KycDocumentsFormProps = {
  currentStep: OnboardingStep;
  onBack: () => void;
  onNext: () => void;
};

export function KycDocumentsForm({
  currentStep,
  onBack,
  onNext,
}: Readonly<KycDocumentsFormProps>) {
  const kycData = useOnboardingStore((state) => state.kycData);
  const setKycData = useOnboardingStore((state) => state.setKycData);
  const uploadKyc = useUploadKycFile();

  const [uploading, setUploading] = useState<{
    kycDocument: boolean;
    kycSelfie: boolean;
  }>({ kycDocument: false, kycSelfie: false });

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      documentType: kycData.documentType || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const docValue = form.getValues("kycDocument");
    const selfieValue = form.getValues("kycSelfie");
    if (kycData.kycDocument && !docValue) {
      form.setValue("kycDocument", kycData.kycDocument, {
        shouldValidate: true,
      });
    }
    if (kycData.kycSelfie && !selfieValue) {
      form.setValue("kycSelfie", kycData.kycSelfie, { shouldValidate: true });
    }
  }, [kycData.kycDocument, kycData.kycSelfie, form]);

  useEffect(() => {
    const updates: Partial<typeof kycData> = {};
    if (kycData.kycDocument && !kycData.kycDocumentPreview) {
      updates.kycDocumentPreview = URL.createObjectURL(kycData.kycDocument);
    }
    if (kycData.kycSelfie && !kycData.kycSelfiePreview) {
      updates.kycSelfiePreview = URL.createObjectURL(kycData.kycSelfie);
    }
    if (Object.keys(updates).length > 0) {
      setKycData(updates);
    }
  }, [
    kycData.kycDocument,
    kycData.kycSelfie,
    kycData.kycDocumentPreview,
    kycData.kycSelfiePreview,
    setKycData,
  ]);

  const handleFileSelect = useCallback(
    async (file: File, fieldName: "kycDocument" | "kycSelfie") => {
      // Validate the raw file first (type + size check)
      const fieldSchema = step3SchemaBase.shape[fieldName];
      const result = fieldSchema.safeParse(file);
      if (!result.success) {
        form.setError(fieldName, {
          message: result.error.errors[0]?.message || "Fichier invalide",
        });
        return;
      }

      // Compress and re-encode via Canvas so the stored File is independent
      // of the original <input> element (prevents iOS Safari GC issues).
      const compressed = await compressImage(file);
      const preview = URL.createObjectURL(compressed);
      form.clearErrors(fieldName);
      form.setValue(fieldName, compressed, { shouldValidate: true });
      // Show the local preview immediately, clear any prior URL while uploading.
      setKycData({
        [fieldName]: compressed,
        [`${fieldName}Preview`]: preview,
        [`${fieldName}Url`]: null,
      });

      // Upload to storage right away so the final create call carries only URLs.
      setUploading((prev) => ({ ...prev, [fieldName]: true }));
      try {
        const { url } = await uploadKyc.mutateAsync(compressed);
        setKycData({ [`${fieldName}Url`]: url });
      } catch {
        form.setError(fieldName, {
          message: "Échec de l'envoi du fichier. Veuillez réessayer.",
        });
      } finally {
        setUploading((prev) => ({ ...prev, [fieldName]: false }));
      }
    },
    [form, setKycData, uploadKyc],
  );

  const handleRemoveFile = (fieldName: "kycDocument" | "kycSelfie") => {
    form.setValue(fieldName, null as unknown as File, { shouldValidate: true });
    if (kycData[`${fieldName}Preview` as keyof typeof kycData]) {
      const preview = kycData[
        `${fieldName}Preview` as keyof typeof kycData
      ] as string;
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    }
    setKycData({
      [fieldName]: null,
      [`${fieldName}Preview`]: null,
      [`${fieldName}Url`]: null,
    });
  };

  const onSubmit = useCallback(
    (data: Step3FormData) => {
      const fullData = {
        ...data,
        kycDocument: kycData.kycDocument,
        kycSelfie: kycData.kycSelfie,
      };
      setKycData(fullData);
      onNext();
    },
    [kycData.kycDocument, kycData.kycSelfie, onNext, setKycData],
  );

  const kycDocumentError = form.formState.errors.kycDocument?.message;
  const kycSelfieError = form.formState.errors.kycSelfie?.message;
  const content = kycDocumentsContent;
  const documentTypeOptions = [
    {
      value: "IDENTITY_CARD",
      label: content.documentType.options.identityCard,
    },
    { value: "PASSPORT", label: content.documentType.options.passport },
    {
      value: "DRIVER_LICENSE",
      label: content.documentType.options.driverLicense,
    },
    {
      value: "BIRTH_CERTIFICATE",
      label: content.documentType.options.birthCertificate,
    },
    { value: "STUDENT_CARD", label: content.documentType.options.studentCard },
    { value: "NIU_CARD", label: content.documentType.options.niuCard },
    { value: "OTHER", label: content.documentType.options.other },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{content.subtitle}</p>
        </div>
        <StepIndicator currentStep={currentStep} variant="compact" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>{content.documentType.label}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={content.documentType.placeholder}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {documentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label.toLocaleUpperCase("fr-FR")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kycDocument"
            render={() => (
              <FormItem className="flex flex-col gap-1">
                <FileUploadZone
                  onFileSelect={(file) => handleFileSelect(file, "kycDocument")}
                  preview={kycData.kycDocumentPreview}
                  fileName={kycData.kycDocument?.name || null}
                  onRemove={() => handleRemoveFile("kycDocument")}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  label={content.documents.kycDocument.label}
                  description={content.documents.kycDocument.description}
                  helperText={content.documents.kycDocument.helperText}
                  error={kycDocumentError}
                  type="document"
                  uploading={uploading.kycDocument}
                  infoTooltip={content.documents.kycDocument.infoTooltip}
                  infoImage={
                    kycExampleImages[content.documents.kycDocument.infoImageKey]
                  }
                  infoImageAlt={content.documents.kycDocument.infoImageAlt}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kycSelfie"
            render={() => (
              <FormItem className="flex flex-col gap-1">
                <FileUploadZone
                  onFileSelect={(file) => handleFileSelect(file, "kycSelfie")}
                  preview={kycData.kycSelfiePreview}
                  fileName={kycData.kycSelfie?.name || null}
                  onRemove={() => handleRemoveFile("kycSelfie")}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  label={content.documents.kycSelfie.label}
                  description={content.documents.kycSelfie.description}
                  helperText={content.documents.kycSelfie.helperText}
                  error={kycSelfieError}
                  type="selfie"
                  uploading={uploading.kycSelfie}
                  infoTooltip={content.documents.kycSelfie.infoTooltip}
                  infoImage={
                    kycExampleImages[content.documents.kycSelfie.infoImageKey]
                  }
                  infoImageAlt={content.documents.kycSelfie.infoImageAlt}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col-reverse gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              {content.buttons.back}
            </Button>
            <Button
              type="submit"
              disabled={
                !form.formState.isValid ||
                uploading.kycDocument ||
                uploading.kycSelfie ||
                !kycData.kycDocumentUrl ||
                !kycData.kycSelfieUrl
              }
              className="w-full"
            >
              {content.buttons.next}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
