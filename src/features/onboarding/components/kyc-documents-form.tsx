import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  step2Schema,
  step2SchemaBase,
  type Step2FormData,
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
import { StepIndicator } from "./step-indicator";
import kycDocumentExample from "@/assets/kyc_document.png";
import kycSelfieExample from "@/assets/kyc_selfie.png";

const kycExampleImages: Record<"document" | "selfie", string> = {
  document: kycDocumentExample,
  selfie: kycSelfieExample,
};

type OnboardingStep =
  | "personal-informations"
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

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      profileType: kycData.profileType || "WORKER",
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

  const handleFileSelect = (
    file: File,
    fieldName: "kycDocument" | "kycSelfie",
  ) => {
    const fieldSchema = step2SchemaBase.shape[fieldName];
    const result = fieldSchema.safeParse(file);

    if (result.success) {
      form.setValue(fieldName, file, { shouldValidate: true });
      const preview = URL.createObjectURL(file);
      setKycData({
        [fieldName]: file,
        [`${fieldName}Preview`]: preview,
      });
    } else {
      form.setError(fieldName, {
        message: result.error.errors[0]?.message || "Fichier invalide",
      });
    }
  };

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
    });
  };

  const onSubmit = useCallback(
    (data: Step2FormData) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="profileType"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>{content.profileType.label}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={content.profileType.placeholder}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="WORKER">
                        {content.profileType.options.worker}
                      </SelectItem>
                      <SelectItem value="EMPLOYER">
                        {content.profileType.options.employer}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectItem value="IDENTITY_CARD">
                        {content.documentType.options.identityCard}
                      </SelectItem>
                      <SelectItem value="PASSPORT">
                        {content.documentType.options.passport}
                      </SelectItem>
                      <SelectItem value="DRIVER_LICENSE">
                        {content.documentType.options.driverLicense}
                      </SelectItem>
                      <SelectItem value="BIRTH_CERTIFICATE">
                        {content.documentType.options.birthCertificate}
                      </SelectItem>
                      <SelectItem value="STUDENT_CARD">
                        {content.documentType.options.studentCard}
                      </SelectItem>
                      <SelectItem value="NIU_CARD">
                        {content.documentType.options.niuCard}
                      </SelectItem>
                      <SelectItem value="OTHER">
                        {content.documentType.options.other}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 hover:bg-transparent hover:text-primary/70 hover:border-primary/70"
            >
              {content.buttons.back}
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {content.buttons.next}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
