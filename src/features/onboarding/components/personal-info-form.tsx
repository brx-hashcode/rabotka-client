import { useEffect, useRef, useState } from "react";
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
import type { Country as PhoneCountry } from "react-phone-number-input";
import {
  countryFromPhone,
  offeredCountry,
  OFFERED_PHONE_COUNTRIES,
} from "@/lib/geo-fields";
import { Textarea } from "@/components/ui/textarea";
import { personalInfoContent } from "@/content/onboarding";
import { CountryCityFields } from "@/components/common/country-city-fields";
import { isSignupVerified } from "@/lib/signup-verification";
import { PhoneVerificationDrawer } from "./phone-verification-drawer";

/** The flag the WhatsApp field opens on. */
const PHONE_DEFAULT_COUNTRY: PhoneCountry = "CG";

type PersonalInfoFormProps = {
  onNext: () => void;
};

export function PersonalInfoForm({
  onNext,
}: Readonly<PersonalInfoFormProps>) {
  const personalInfo = useOnboardingStore((state) => state.personalInfo);
  const setPersonalInfo = useOnboardingStore((state) => state.setPersonalInfo);
  const signupVerification = useOnboardingStore(
    (state) => state.signupVerification,
  );
  const setSignupVerification = useOnboardingStore(
    (state) => state.setSignupVerification,
  );
  const [verifyPhone, setVerifyPhone] = useState<string | null>(null);

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


  useEffect(() => {
    const hasStoredValues = Object.values(personalInfo).some(Boolean);
    if (hasStoredValues && !form.formState.isDirty) {
      form.reset(personalInfo);
    }
  }, [personalInfo, form]);

  // The country follows the phone field: its flag from the start (Congo by
  // default), then the number once typed (+243 → Congo-Kinshasa). Until the
  // person picks a country themselves — or one was restored — which it never
  // overwrites: `autoCountry` remembers what this effect set, and anything
  // else in the field is someone's choice.
  const [phoneCountry, setPhoneCountry] = useState<string | undefined>(
    PHONE_DEFAULT_COUNTRY,
  );
  const autoCountry = useRef<string | null>(null);
  const phone = form.watch("phone");
  // Watched too: restoring a saved form can empty the field after it was
  // filled, and it must fill again.
  const countryCode = form.watch("countryCode");
  useEffect(() => {
    const current = countryCode;
    if (current && current !== autoCountry.current) return;
    const country = countryFromPhone(phone) ?? offeredCountry(phoneCountry);
    if (!country || country.code === current) return;
    autoCountry.current = country.code;
    form.setValue("countryCode", country.code, { shouldValidate: true });
    form.setValue("countryName", country.name, { shouldValidate: true });
    form.setValue("city", "", { shouldValidate: false });
  }, [phone, phoneCountry, countryCode, form]);

  const description = form.watch("description");
  const charCount = description?.length || 0;
  const isOverLimit = charCount > 500;

  // The number is checked by WhatsApp code before going on — once, unless it
  // changes or the check expires. The API refuses the documents and the
  // account without it.
  const onSubmit = (data: Step1FormData) => {
    setPersonalInfo(data);
    if (isSignupVerified(signupVerification, data.phone)) {
      onNext();
      return;
    }
    setVerifyPhone(data.phone);
  };

  const content = personalInfoContent;

  return (
    <div className="space-y-6">
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
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {content.fields.email.hint}
                    </p>
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
                      defaultCountry={PHONE_DEFAULT_COUNTRY}
                      onCountryChange={(country) => setPhoneCountry(country)}
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

            {/* Directly under the WhatsApp number, because it only makes sense
                as "and if that one isn't the one you answer calls on". */}
            <FormField
              control={form.control}
              name="directPhone"
              render={({ field }) => (
                <FormItem className="flex min-h-12 min-w-0 flex-col gap-1">
                  <FormLabel>{content.fields.directPhone.label}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      // Opens on the WhatsApp number's flag when it is one of
                      // the 13: the direct line is usually in the same country.
                      defaultCountry={
                        (offeredCountry(phoneCountry)?.code ??
                          PHONE_DEFAULT_COUNTRY) as PhoneCountry
                      }
                      // The 13 countries the schema accepts, and no others: offering
                      // a flag the field would refuse is an invitation to be told no.
                      countries={OFFERED_PHONE_COUNTRIES as PhoneCountry[]}
                      placeholder={content.fields.directPhone.placeholder}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {content.fields.directPhone.hint}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Country → city → address, in that order: the city list depends on
              the country, and the street line only makes sense once both are
              known. */}
          <CountryCityFields
            form={form}
            countryHint={content.fields.country.hint}
          />

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
                      className="min-h-35 pr-16 resize-none"
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
      <PhoneVerificationDrawer
        open={verifyPhone !== null}
        onOpenChange={(open) => {
          if (!open) setVerifyPhone(null);
        }}
        phone={verifyPhone ?? ""}
        firstName={personalInfo.firstName}
        lastName={personalInfo.lastName}
        profileType={profileType}
        onVerified={(verification) => {
          setSignupVerification(verification);
          setVerifyPhone(null);
          onNext();
        }}
      />
    </div>
  );
}
