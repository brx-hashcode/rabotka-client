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
import { NativeSelect } from "@/components/ui/native-select";
import { CategoryMultiSelect } from "@/components/common/category-multi-select";
import { profileTypeContent } from "@/content/onboarding";
import {
  getCategories,
  type JobCategory,
} from "@/lib/api/job-category-controller";

const MAX_CATEGORIES = 5;

/**
 * Preselected, rather than making everyone answer a question most of them
 * answer the same way. The overwhelming majority of sign-ups are people
 * offering their work; a recruiter changes it in one tap.
 *
 * It is a DEFAULT, not a decision made for the user: a stored choice and a
 * `?profileType=` link both still win, see the restore effect below.
 */
const DEFAULT_PROFILE_TYPE = "WORKER" as const;

type ProfileTypeFormProps = {
  onBack: () => void;
  onNext: () => void;
};

export function ProfileTypeForm({
  onBack,
  onNext,
}: Readonly<ProfileTypeFormProps>) {
  const kycData = useOnboardingStore((state) => state.kycData);
  const setKycData = useOnboardingStore((state) => state.setKycData);
  const [categories, setCategories] = useState<JobCategory[]>([]);

  const [profileTypeParam, setProfileTypeParam] = useQueryState<
    "WORKER" | "EMPLOYER" | ""
  >("profileType", {
    defaultValue: "",
    parse: (v) => (v === "WORKER" || v === "EMPLOYER" ? v : ""),
    serialize: (v) => v,
  });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      profileType:
        profileTypeParam || kycData.profileType || DEFAULT_PROFILE_TYPE,
      categoryIds: kycData.categoryIds.length > 0 ? kycData.categoryIds : [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (profileTypeParam) {
      form.setValue("profileType", profileTypeParam, { shouldValidate: true });
    }
  }, [profileTypeParam, form]);

  // defaultValues snapshot the store at first render, but hydrateFromStorage is
  // async and resolves after it -- so returning to this step lost the choices
  // the store had already restored. Same gap the KYC step had.
  const storedProfileType = kycData.profileType;
  const storedCategoryIds = kycData.categoryIds;

  // Guarded on `dirtyFields`, not on the field being empty: it is never empty
  // any more, since DEFAULT_PROFILE_TYPE fills it at first render. Checking for
  // emptiness here would silently stop restoring a stored EMPLOYER — the field
  // would already hold "WORKER" and the effect would decline to touch it.
  const profileTypeTouched = Boolean(form.formState.dirtyFields.profileType);

  useEffect(() => {
    if (!storedProfileType || profileTypeTouched || profileTypeParam) return;
    if (form.getValues("profileType") === storedProfileType) return;

    form.setValue("profileType", storedProfileType, { shouldValidate: true });
    // Keep the shareable URL agreeing with what is on screen.
    void setProfileTypeParam(storedProfileType);
  }, [
    storedProfileType,
    profileTypeParam,
    profileTypeTouched,
    setProfileTypeParam,
    form,
  ]);

  useEffect(() => {
    if (
      storedCategoryIds.length > 0 &&
      (form.getValues("categoryIds") ?? []).length === 0
    ) {
      form.setValue("categoryIds", storedCategoryIds, { shouldValidate: true });
    }
  }, [storedCategoryIds, form]);

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

  const selectedProfileType = form.watch("profileType");

  const content = profileTypeContent;

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
            name="profileType"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>{content.profileType.label}</FormLabel>
                <NativeSelect
                  options={[
                    {
                      value: "WORKER",
                      label: content.profileType.options.worker.toUpperCase(),
                    },
                    {
                      value: "EMPLOYER",
                      label: content.profileType.options.employer.toUpperCase(),
                    },
                  ]}
                  value={field.value}
                  placeholder={content.profileType.placeholder}
                  onValueChange={(raw) => {
                    if (raw !== "WORKER" && raw !== "EMPLOYER") return;
                    field.onChange(raw);
                    void setProfileTypeParam(raw);
                    // Persist on pick rather than on submit: leaving the step
                    // without pressing Continue used to discard the choice.
                    setKycData({ profileType: raw });
                  }}
                />
                {/* Both roles, side by side and always visible. Someone who
                    already knows which one they are skims past it; someone who
                    doesn't gets the answer without having to open the list.
                    Upper-cased to match the select's own options, so the line
                    that explains a role is spelled like the role you pick. */}
                <div className="text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">
                      {content.profileType.options.worker.toUpperCase()}
                    </span>{" "}
                    — {content.profileType.hint.worker}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      {content.profileType.options.employer.toUpperCase()}
                    </span>{" "}
                    — {content.profileType.hint.employer}
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Controller
            control={form.control}
            name="categoryIds"
            render={({ field, fieldState }) => {
              const selected: string[] = field.value ?? [];
              // Folded, so "maraichage" finds "Agriculture & Maraîchage" —
              // lower-casing alone left every accented domain unreachable by
              // the spelling people type. Same helper the comboboxes use.
              const update = (next: string[]) => {
                field.onChange(next);
                // Names travel with the ids so the confirmation view never
                // shows a stale label for a domain that was just removed.
                setKycData({
                  categoryIds: next,
                  categoryNames: categories
                    .filter((c) => next.includes(c.id))
                    .map((c) => c.name),
                });
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
                  {/* Worded for the role actually selected: the domains drive
                      offers one way round and candidate profiles the other. */}
                  <p className="text-xs text-muted-foreground">
                    {selectedProfileType === "EMPLOYER"
                      ? content.categories.context.employer
                      : content.categories.context.worker}
                  </p>
                  <CategoryMultiSelect
                    options={categories}
                    value={selected}
                    onChange={update}
                    max={MAX_CATEGORIES}
                    placeholder={content.categories.placeholder}
                    addLabel={content.categories.addLabel}
                  />
                  {fieldState.error && (
                    <p className="text-sm font-medium text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              );
            }}
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
              disabled={!form.formState.isValid}
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
