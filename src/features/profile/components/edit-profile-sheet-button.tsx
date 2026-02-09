import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import type { ProfileMeResponse } from "@/lib/api/profile-controller";

const content = editProfileContent;

interface EditProfileSheetButtonProps {
  readonly profile: ProfileMeResponse;
}

export function EditProfileSheetButton({
  profile,
}: EditProfileSheetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [description, setDescription] = useState(profile.description);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { toast } = useToast();

  const handleOpen = () => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setDescription(profile.description);
    setAvatarUrl(profile.avatarUrl);
    setIsOpen(true);
  };

  const handleSave = () => {
    updateProfile(
      {
        firstName,
        lastName,
        description,
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

          <div className="py-6 space-y-6">
            <AvatarUpload
              defaultAvatar={avatarUrl}
              onAvatarChange={handleAvatarChange}
            />

            <div className="space-y-4">
              <div className="space-y-4">
                <Label htmlFor="firstName">
                  {content.fields.firstName.label}
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={content.fields.firstName.placeholder}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="lastName">
                  {content.fields.lastName.label}
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={content.fields.lastName.placeholder}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="description">
                  {content.fields.description.label}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={content.fields.description.placeholder}
                  rows={8}
                />
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? content.buttons.saving : content.buttons.save}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
