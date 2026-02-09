import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Pencil } from "lucide-react";
import { useUpdateProfile } from "@/hooks/use-update-profile";
import { useToast } from "@/hooks/use-toast";
import { editProfileContent } from "@/content/profile";
import { AvatarUpload } from "./avatar-upload";
import {
  editProfileSchema,
  type EditProfileFormData,
} from "@/lib/validations/profile";
import type { ProfileMeResponse } from "@/lib/api/profile-controller";

const content = editProfileContent;

interface EditProfileSheetButtonProps {
  readonly profile: ProfileMeResponse;
}

export function EditProfileSheetButton({
  profile,
}: EditProfileSheetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { toast } = useToast();

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      address: profile.address,
      description: profile.description,
    },
    mode: "onChange",
  });

  const handleOpen = () => {
    form.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      address: profile.address,
      description: profile.description,
    });
    setAvatarUrl(profile.avatarUrl);
    setIsOpen(true);
  };

  const onSubmit = (data: EditProfileFormData) => {
    updateProfile(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        description: data.description,
      },
      {
        onSuccess: () => {
          toast({
            description: content.toast.success,
          });
          setIsOpen(false);
        },
        onError: () => {
          toast({
            variant: "destructive",
            description: content.toast.error,
          });
        },
      },
    );
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="gap-2"
      >
        <Pencil className="h-4 w-4" />
        {content.buttons.edit}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>{content.sheet.title}</SheetTitle>
            <SheetDescription>{content.sheet.description}</SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="py-6 space-y-6"
            >
              <AvatarUpload
                defaultAvatar={avatarUrl}
                onAvatarChange={handleAvatarChange}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
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
                  <FormItem className="flex flex-col gap-1">
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
                      <Textarea
                        placeholder={content.fields.description.placeholder}
                        rows={8}
                        className="resize-none overflow-hidden"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter>
                <Button
                  type="submit"
                  disabled={isSaving || !form.formState.isValid}
                  className="w-full"
                >
                  {isSaving ? content.buttons.saving : content.buttons.save}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
}
