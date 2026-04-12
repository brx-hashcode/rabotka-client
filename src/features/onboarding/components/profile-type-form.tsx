import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryState } from "nuqs";
import {
  step2Schema,
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
import { profileTypeContent } from "@/content/onboarding";
import { StepIndicator } from "./step-indicator";
import { getCategories, type JobCategory } from "@/lib/api/job-category-controller";

type OnboardingStep =
  | "personal-informations"
  | "profile-type"
  | "kyc-documents"
  | "confirmation";

type ProfileTypeFormProps = {
  currentStep: OnboardingStep;
  onBack: () => void;
  onNext: () => void;
};

export function ProfileTypeForm({
  currentStep,
  onBack,
  onNext,
}: Readonly<ProfileTypeFormProps>) {
  const kycData = useOnboardingStore((state) => state.kycData);
  const setKycData = useOnboardingStore((state) => state.setKycData);
  const [categories, setCategories] = useState<JobCategory[]>([]);

  // profileType lives in the URL — survives navigation and pre-fills from landing CTA
  const [profileTypeParam, setProfileTypeParam] = useQueryState<"WORKER" | "EMPLOYER" | "">(
    "profileType",
    {
      defaultValue: "",
      parse: (v) => (v === "WORKER" || v === "EMPLOYER" ? v : ""),
      serialize: (v) => v,
    },
  );

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      profileType: profileTypeParam || undefined,
      categoryId: kycData.categoryId || undefined,
    },
    mode: "onChange",
  });

  // Keep form in sync with URL param (e.g. user navigates back/forward)
  useEffect(() => {
    if (profileTypeParam) {
      form.setValue("profileType", profileTypeParam, { shouldValidate: true });
      if (profileTypeParam === "EMPLOYER") {
        form.setValue("categoryId", undefined);
      }
    }
  }, [profileTypeParam, form]);

  const profileType = form.watch("profileType");

  const onSubmit = useCallback(
    (data: Step2FormData) => {
      const selectedCategory = categories.find((c) => c.id === data.categoryId);
      setKycData({
        profileType: data.profileType,
        categoryId: data.profileType === "EMPLOYER" ? "" : (data.categoryId ?? ""),
        categoryName: data.profileType === "EMPLOYER" ? "" : (selectedCategory?.name ?? ""),
      });
      onNext();
    },
    [onNext, setKycData, categories],
  );

  const content = profileTypeContent;

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
            name="profileType"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>{content.profileType.label}</FormLabel>
                <Select
                  onValueChange={(value: "WORKER" | "EMPLOYER") => {
                    field.onChange(value);
                    // Persist selection in URL
                    void setProfileTypeParam(value);
                    if (value === "EMPLOYER") {
                      form.setValue("categoryId", undefined);
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={content.profileType.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="WORKER">
                      {content.profileType.options.worker.toUpperCase()}
                    </SelectItem>
                    <SelectItem value="EMPLOYER">
                      {content.profileType.options.employer.toUpperCase()}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {profileType === "WORKER" && (
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>{content.categoryId.label}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={content.categoryId.placeholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon ? `${category.icon} ` : ""}{category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
