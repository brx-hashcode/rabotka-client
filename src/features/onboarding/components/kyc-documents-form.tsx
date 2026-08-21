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
import {
  KYC_DOCUMENT_TYPE_OPTIONS,
  requiresBackSide,
} from "@/lib/kyc-document-types";
import kycDocumentExample from "@/assets/kyc_document.png?format=webp";
import kycSelfieExample from "@/assets/kyc_selfie.png?format=webp";

const kycExampleImages: Record<"document" | "selfie", string> = {
  document: kycDocumentExample,
  selfie: kycSelfieExample,
};

/** The upload zones this form owns. */
type KycFileField = "kycDocument" | "kycDocumentBack" | "kycSelfie";

const KYC_FILE_FIELDS: readonly KycFileField[] = [
  "kycDocument",
  "kycDocumentBack",
  "kycSelfie",
];

type KycDocumentsFormProps = {
  onBack: () => void;
  onNext: () => void;
};

export function KycDocumentsForm({
  onBack,
  onNext,
}: Readonly<KycDocumentsFormProps>) {
  const kycData = useOnboardingStore((state) => state.kycData);
  const setKycData = useOnboardingStore((state) => state.setKycData);
  const uploadKyc = useUploadKycFile();

  const [uploading, setUploading] = useState<Record<KycFileField, boolean>>({
    kycDocument: false,
    kycDocumentBack: false,
    kycSelfie: false,
  });

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      documentType: kycData.documentType || "",
    },
    mode: "onChange",
  });

  // Destructured so both effects below can depend on the exact values they
  // read; indexing kycData by a loop variable would force the whole object into
  // the dependency array, and the preview effect writes back to it.
  const {
    kycDocument,
    kycDocumentBack,
    kycSelfie,
    kycDocumentPreview,
    kycDocumentBackPreview,
    kycSelfiePreview,
  } = kycData;

  useEffect(() => {
    const stored: Record<KycFileField, File | null> = {
      kycDocument,
      kycDocumentBack,
      kycSelfie,
    };
    for (const field of KYC_FILE_FIELDS) {
      const file = stored[field];
      if (file && !form.getValues(field)) {
        form.setValue(field, file, { shouldValidate: true });
      }
    }
  }, [kycDocument, kycDocumentBack, kycSelfie, form]);

  useEffect(() => {
    const zones: [KycFileField, File | null, string | null][] = [
      ["kycDocument", kycDocument, kycDocumentPreview],
      ["kycDocumentBack", kycDocumentBack, kycDocumentBackPreview],
      ["kycSelfie", kycSelfie, kycSelfiePreview],
    ];
    const updates: Partial<typeof kycData> = {};
    for (const [field, file, preview] of zones) {
      if (file && !preview) {
        updates[`${field}Preview`] = URL.createObjectURL(file);
      }
    }
    if (Object.keys(updates).length > 0) {
      setKycData(updates);
    }
  }, [
    kycDocument,
    kycDocumentBack,
    kycSelfie,
    kycDocumentPreview,
    kycDocumentBackPreview,
    kycSelfiePreview,
    setKycData,
  ]);

  const handleFileSelect = useCallback(
    async (file: File, fieldName: KycFileField) => {
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

  const handleRemoveFile = useCallback(
    (fieldName: KycFileField) => {
      form.setValue(fieldName, null as unknown as File, {
        shouldValidate: true,
      });
      // Read through the store rather than closing over kycData: this callback
      // feeds an effect below, and a new identity on every file change would
      // make that effect re-run constantly.
      const preview =
        useOnboardingStore.getState().kycData[`${fieldName}Preview`];
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      setKycData({
        [fieldName]: null,
        [`${fieldName}Preview`]: null,
        [`${fieldName}Url`]: null,
      });
    },
    [form, setKycData],
  );

  const onSubmit = useCallback(
    (data: Step3FormData) => {
      const fullData = {
        ...data,
        kycDocument: kycData.kycDocument,
        kycDocumentBack: kycData.kycDocumentBack,
        kycSelfie: kycData.kycSelfie,
      };
      setKycData(fullData);
      onNext();
    },
    [
      kycData.kycDocument,
      kycData.kycDocumentBack,
      kycData.kycSelfie,
      onNext,
      setKycData,
    ],
  );

  const documentType = form.watch("documentType");
  const needsBackSide = requiresBackSide(documentType);

  // Switching to a type with no back (i.e. PASSPORT) must drop anything already
  // uploaded to the verso zone. Left in place it would be an invisible file the
  // user cannot remove -- the zone is gone -- and the submit guard would keep
  // blocking on a field nobody can see.
  useEffect(() => {
    if (!needsBackSide && kycDocumentBack) {
      handleRemoveFile("kycDocumentBack");
    }
  }, [needsBackSide, kycDocumentBack, handleRemoveFile]);

  const kycDocumentError = form.formState.errors.kycDocument?.message;
  const kycDocumentBackError = form.formState.errors.kycDocumentBack?.message;
  const kycSelfieError = form.formState.errors.kycSelfie?.message;
  const content = kycDocumentsContent;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{content.subtitle}</p>
        </div>
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
                    {KYC_DOCUMENT_TYPE_OPTIONS.map((option) => (
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

          {needsBackSide && (
            <FormField
              control={form.control}
              name="kycDocumentBack"
              render={() => (
                <FormItem className="flex flex-col gap-1">
                  <FileUploadZone
                    onFileSelect={(file) =>
                      handleFileSelect(file, "kycDocumentBack")
                    }
                    preview={kycData.kycDocumentBackPreview}
                    fileName={kycData.kycDocumentBack?.name || null}
                    onRemove={() => handleRemoveFile("kycDocumentBack")}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024}
                    label={content.documents.kycDocumentBack.label}
                    description={content.documents.kycDocumentBack.description}
                    helperText={content.documents.kycDocumentBack.helperText}
                    error={kycDocumentBackError}
                    type="document"
                    uploading={uploading.kycDocumentBack}
                    infoTooltip={content.documents.kycDocumentBack.infoTooltip}
                    infoImage={
                      kycExampleImages[
                        content.documents.kycDocumentBack.infoImageKey
                      ]
                    }
                    infoImageAlt={content.documents.kycDocumentBack.infoImageAlt}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
                uploading.kycDocumentBack ||
                uploading.kycSelfie ||
                !kycData.kycDocumentUrl ||
                !kycData.kycSelfieUrl ||
                (needsBackSide && !kycData.kycDocumentBackUrl)
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
