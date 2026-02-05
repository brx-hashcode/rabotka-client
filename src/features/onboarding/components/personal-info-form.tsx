import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{content.fields.firstName.label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={content.fields.firstName.placeholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{content.fields.lastName.label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={content.fields.lastName.placeholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{content.fields.email.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={content.fields.email.placeholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{content.fields.phone.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={content.fields.phone.placeholder}
                      {...field}
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
              <FormItem>
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
              <FormItem>
                <FormLabel>{content.fields.description.label}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder={content.fields.description.placeholder}
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
