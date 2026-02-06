import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { emailOrPhoneSchema } from "@/lib/validations/auth";
import { loginContent } from "@/content/landing/login";

type Step1EmailPhoneFormProps = {
  onSubmit: (data: { emailOrPhone: string }) => Promise<void>;
  isLoading: boolean;
  serverError: string | null;
};

export function Step1EmailPhoneForm({
  onSubmit,
  isLoading,
  serverError,
}: Readonly<Step1EmailPhoneFormProps>) {
  const form = useForm<{ emailOrPhone: string }>({
    resolver: zodResolver(z.object({ emailOrPhone: emailOrPhoneSchema })),
    defaultValues: {
      emailOrPhone: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (serverError) {
      form.setError("emailOrPhone", {
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
          name="emailOrPhone"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>{loginContent.step1.label}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  placeholder={loginContent.step1.placeholder}
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
