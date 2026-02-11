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
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

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

  const descriptionValue = form.watch("description");
  const charCount = descriptionValue?.length || 0;
  const isOverLimit = charCount > 500;

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
        variant={isMobile ? "default" : "outline"}
        size={isMobile ? "icon" : "sm"}
        onClick={handleOpen}
        className={
          isMobile
            ? "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-whatsapp text-primary-foreground shadow-lg hover:bg-whatsapp-dark transition-colors duration-300 ease-in-out flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            : "gap-2"
        }
        aria-label={isMobile ? content.buttons.edit : undefined}
      >
        <Pencil className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
        {!isMobile && content.buttons.edit}
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
                      <div className="relative">
                        <Textarea
                          placeholder={content.fields.description.placeholder}
                          rows={8}
                          className="min-h-[140px] pr-16 resize-none overflow-hidden"
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

              <SheetFooter>
                <Button type="submit" disabled={isSaving} className="w-full">
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
