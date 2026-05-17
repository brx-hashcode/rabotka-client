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
import { StepIndicator } from "./step-indicator";

type OnboardingStep =
  | "personal-informations"
  | "kyc-documents"
  | "confirmation";

type PersonalInfoFormProps = {
  currentStep: OnboardingStep;
  onNext: () => void;
};

export function PersonalInfoForm({
  currentStep,
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            {content.button.continue}
          </Button>
        </form>
      </Form>
    </div>
  );
}
