import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { phoneSchema } from "@/lib/validations/auth";
import { loginContent } from "@/content/landing/login";

type Step1PhoneFormProps = {
  onSubmit: (data: { phone: string }) => Promise<void>;
  isLoading: boolean;
  serverError: string | null;
};

export function Step1PhoneForm({
  onSubmit,
  isLoading,
  serverError,
}: Readonly<Step1PhoneFormProps>) {
  const form = useForm<{ phone: string }>({
    resolver: zodResolver(z.object({ phone: phoneSchema })),
    defaultValues: {
      phone: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (serverError) {
      form.setError("phone", {
        type: "server",
        message: serverError,
      });
    }
  }, [serverError, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          onSubmit(data);
        })}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>{loginContent.step1.label}</FormLabel>
              <FormControl>
                <PhoneInput
                  defaultCountry="CG"
                  disabled={isLoading}
                  placeholder={loginContent.step1.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi...
            </>
          ) : (
            loginContent.step1.submitButton
          )}
        </Button>
      </form>
    </Form>
  );
}
