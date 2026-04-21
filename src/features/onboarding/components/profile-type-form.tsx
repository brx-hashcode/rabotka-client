import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryState } from "nuqs";
import { step2Schema, type Step2FormData } from "@/lib/validations/onboarding";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { Button } from "@/components/ui/button";
import {
  Form,
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
import {
  getCategories,
  type JobCategory,
} from "@/lib/api/job-category-controller";

const MAX_CATEGORIES = 5;
const INITIAL_VISIBLE = 10;

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
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const [profileTypeParam, setProfileTypeParam] = useQueryState<
    "WORKER" | "EMPLOYER" | ""
  >("profileType", {
    defaultValue: "",
    parse: (v) => (v === "WORKER" || v === "EMPLOYER" ? v : ""),
    serialize: (v) => v,
  });

  useEffect(() => {
    getCategories()
      .then((cats) => {
        setCategories(cats);
        // If user has pre-selected categories beyond the initial slice, expand to show them
        const preSelected = kycData.categoryIds;
        if (preSelected.length > 0) {
          const lastSelectedIndex = Math.max(
            ...preSelected.map((id) => cats.findIndex((c) => c.id === id)),
          );
          if (lastSelectedIndex >= INITIAL_VISIBLE) {
            setVisibleCount(
              Math.min(lastSelectedIndex + 1, cats.length),
            );
          }
        }
      })
      .catch(() => setCategories([]));
  }, []);

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      profileType: profileTypeParam || undefined,
      categoryIds: kycData.categoryIds.length > 0 ? kycData.categoryIds : [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (profileTypeParam) {
      form.setValue("profileType", profileTypeParam, { shouldValidate: true });
    }
  }, [profileTypeParam, form]);

  const onSubmit = useCallback(
    (data: Step2FormData) => {
      const selectedCategories = categories.filter((c) =>
        data.categoryIds.includes(c.id),
      );
      setKycData({
        profileType: data.profileType,
        categoryIds: data.categoryIds,
        categoryNames: selectedCategories.map((c) => c.name),
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
                    void setProfileTypeParam(value);
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={content.profileType.placeholder}
                    />
                  </SelectTrigger>
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

          <Controller
            control={form.control}
            name="categoryIds"
            render={({ field, fieldState }) => {
              const selected: string[] = field.value ?? [];
              const atMax = selected.length >= MAX_CATEGORIES;

              const toggle = (id: string) => {
                if (selected.includes(id)) {
                  field.onChange(selected.filter((s) => s !== id));
                } else if (!atMax) {
                  field.onChange([...selected, id]);
                }
              };

              return (
                <FormItem className="flex flex-col gap-2">
                  <div className="flex items-baseline flex-wrap gap-2 justify-between">
                    <FormLabel>{content.categories.label}</FormLabel>
                    <span className="text-xs text-gray-400">
                      {selected.length}/{MAX_CATEGORIES} —{" "}
                      {content.categories.hint}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories
                      .slice(0, visibleCount)
                      .map((cat) => {
                        const isSelected = selected.includes(cat.id);
                        const isDisabled = !isSelected && atMax;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => toggle(cat.id)}
                            className={[
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                              isSelected
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                              isDisabled
                                ? "cursor-not-allowed opacity-40"
                                : "cursor-pointer",
                            ].join(" ")}
                          >
                            {cat.icon && (
                              <span aria-hidden="true">{cat.icon}</span>
                            )}
                            {cat.name}
                          </button>
                        );
                      })}
                  </div>
                  {visibleCount < categories.length && (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((v) =>
                          Math.min(v + INITIAL_VISIBLE, categories.length),
                        )
                      }
                      className="mt-1 text-xs text-green-600 font-medium hover:underline self-start"
                    >
                      Voir plus ({categories.length - visibleCount} restants)
                    </button>
                  )}
                  {visibleCount > INITIAL_VISIBLE && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount(INITIAL_VISIBLE)}
                      className="mt-1 text-xs text-gray-400 font-medium hover:underline self-start"
                    >
                      Voir moins
                    </button>
                  )}
                  {fieldState.error && (
                    <p className="text-sm font-medium text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              );
            }}
          />

          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
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
