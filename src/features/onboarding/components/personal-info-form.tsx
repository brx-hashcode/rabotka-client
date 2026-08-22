import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryState } from "nuqs";
import { step1Schema, type Step1FormData } from "@/lib/validations/onboarding";
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
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { personalInfoContent } from "@/content/onboarding";
import { CountryCityFields } from "@/components/common/country-city-fields";

type PersonalInfoFormProps = {
  onNext: () => void;
};

export function PersonalInfoForm({
  onNext,
}: Readonly<PersonalInfoFormProps>) {
  const personalInfo = useOnboardingStore((state) => state.personalInfo);
  const setPersonalInfo = useOnboardingStore((state) => state.setPersonalInfo);

  const [profileTypeParam] = useQueryState<"WORKER" | "EMPLOYER" | "">(
    "profileType",
    {
      defaultValue: "",
      parse: (v) => (v === "WORKER" || v === "EMPLOYER" ? v : ""),
      serialize: (v) => v,
    },
  );
  const profileType = profileTypeParam || "WORKER";

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: personalInfo,
    mode: "onChange",
  });

  // defaultValues snapshot the store at first render, but hydrateFromStorage is
  // async and resolves after it -- so coming back to step 1 showed an empty
  // form even though the store had every field. Guarded on isDirty so a slow
  // hydration can never overwrite what someone is in the middle of typing.
  useEffect(() => {
    const hasStoredValues = Object.values(personalInfo).some(Boolean);
    if (hasStoredValues && !form.formState.isDirty) {
      form.reset(personalInfo);
    }
  }, [personalInfo, form]);

  const description = form.watch("description");
  const charCount = description?.length || 0;
  const isOverLimit = charCount > 500;

  const onSubmit = (data: Step1FormData) => {
    setPersonalInfo(data);
    onNext();
  };

  const content = personalInfoContent;

  return (
    <div className="space-y-6">
      {/* No step indicator here: it squeezed the title into two lines on a
          phone for a count the user can already see on the surrounding flow. */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{content.subtitle}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => {
                const pt = profileType.toLowerCase() as "worker" | "employer";
                const f = content.fields.firstName[pt];
                return (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>{f.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={f.placeholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => {
                const pt = profileType.toLowerCase() as "worker" | "employer";
                const f = content.fields.lastName[pt];
                return (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>{f.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={f.placeholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                const pt = profileType.toLowerCase() as "worker" | "employer";
                const f = content.fields.email[pt];
                return (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>{f.label}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={f.placeholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex min-h-12 min-w-0 flex-col gap-1">
                  <FormLabel>{content.fields.phone.label}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      defaultCountry="CG"
                      placeholder={content.fields.phone.placeholder}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {content.fields.phone.hint}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Country → city → address, in that order: the city list depends on
              the country, and the street line only makes sense once both are
              known. */}
          <CountryCityFields form={form} />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>{content.fields.address.label}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={content.fields.address.placeholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>{content.fields.description.label}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder={
                        content.fields.description.placeholder[
                          profileType.toLowerCase() as "worker" | "employer"
                        ]
                      }
                      className="min-h-[140px] pr-16 resize-none"
                      {...field}
                    />
                    <div
                      className={`absolute bottom-2 right-2 text-sm ${
                        isOverLimit ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {charCount}
                      {content.fields.description.charCount}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!form.formState.isValid}
            className="w-full"
          >
            {content.button.continue}
          </Button>
        </form>
      </Form>
    </div>
  );
}
