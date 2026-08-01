import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import {
  getCategories,
  type JobCategory,
} from "@/lib/api/job-category-controller";

const MAX_CATEGORIES = 5;
const INITIAL_VISIBLE = 10;

const content = editProfileContent;

interface EditProfileSheetButtonProps {
  readonly profile: ProfileMeResponse;
}

export function EditProfileSheetButton({
  profile,
}: EditProfileSheetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [allCategories, setAllCategories] = useState<JobCategory[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const isMobile = useIsMobile();

  useEffect(() => {
    getCategories()
      .then(setAllCategories)
      .catch(() => setAllCategories([]));
  }, []);

  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { toast } = useToast();

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      address: profile.address,
      description: profile.description,
      categoryIds: profile.categoryIds ?? [],
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
      categoryIds: profile.categoryIds ?? [],
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
        categoryIds: data.categoryIds,
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
            ? "fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full bg-whatsapp text-primary-foreground shadow-lg hover:bg-whatsapp-dark transition-colors duration-300 ease-in-out flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            : "gap-2 border-whatsapp text-whatsapp hover:bg-whatsapp/10 hover:text-whatsapp"
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
                          className="min-h-[140px] pr-16 resize-none overflow-hidden text-base"
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
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline flex-wrap gap-2 justify-between">
                        <span className="text-sm font-medium">
                          {content.categories.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selected.length}/{MAX_CATEGORIES} —{" "}
                          {content.categories.hint}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allCategories.slice(0, visibleCount).map((cat) => {
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
                      {visibleCount < allCategories.length && (
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleCount((v) =>
                              Math.min(v + INITIAL_VISIBLE, allCategories.length),
                            )
                          }
                          className="mt-1 text-xs text-green-600 font-medium hover:underline self-start"
                        >
                          Voir plus ({allCategories.length - visibleCount} restants)
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
                    </div>
                  );
                }}
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
