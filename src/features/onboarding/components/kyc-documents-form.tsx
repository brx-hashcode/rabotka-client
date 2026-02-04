import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2Schema, type Step2FormData } from "@/lib/validations/onboarding";
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

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      profileType: kycData.profileType || "worker",
    },
    mode: "onChange",
  });

  const handleFileSelect = (
    file: File,
    fieldName: "kycDocument" | "kycSelfie"
  ) => {
    const fieldSchema = step2Schema.shape[fieldName];
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
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    }
    setKycData({
      [fieldName]: null,
      [`${fieldName}Preview`]: null,
    });
  };

  const onSubmit = (data: Step2FormData) => {
    const fullData = {
      ...data,
      kycDocument: kycData.kycDocument!,
      kycSelfie: kycData.kycSelfie!,
    };
    setKycData(fullData);
    onNext();
  };

  const kycDocumentError = form.formState.errors.kycDocument?.message;
  const kycSelfieError = form.formState.errors.kycSelfie?.message;
  const content = kycDocumentsContent;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{content.subtitle}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="profileType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.profileType.label}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={content.profileType.placeholder}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="worker">
                      {content.profileType.options.worker}
                    </SelectItem>
                    <SelectItem value="employer">
                      {content.profileType.options.employer}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {content.profileType.helperText}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kycDocument"
            render={() => (
              <FormItem>
                <FileUploadZone
                  onFileSelect={(file) => handleFileSelect(file, "kycDocument")}
                  preview={kycData.kycDocumentPreview}
                  fileName={kycData.kycDocument?.name || null}
                  onRemove={() => handleRemoveFile("kycDocument")}
                  accept="image/*,application/pdf"
                  maxSize={5 * 1024 * 1024}
                  label={content.documents.kycDocument.label}
                  helperText={content.documents.kycDocument.helperText}
                  error={kycDocumentError}
                  type="document"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kycSelfie"
            render={() => (
              <FormItem>
                <FileUploadZone
                  onFileSelect={(file) => handleFileSelect(file, "kycSelfie")}
                  preview={kycData.kycSelfiePreview}
                  fileName={kycData.kycSelfie?.name || null}
                  onRemove={() => handleRemoveFile("kycSelfie")}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  label={content.documents.kycSelfie.label}
                  helperText={content.documents.kycSelfie.helperText}
                  error={kycSelfieError}
                  type="selfie"
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
              className="flex-1"
            >
              {content.buttons.back}
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {content.buttons.confirm}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
