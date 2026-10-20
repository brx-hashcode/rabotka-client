import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useCreateClaim } from "@/hooks/use-create-claim";
import { useUploadClaimFiles } from "@/hooks/use-upload-claim-files";
import {
  createClaimSchema,
  type CreateClaimFormData,
} from "@/lib/validations/claims";
import { compressImage } from "@/lib/image-compress";
import {
  IMAGE_ACCEPT,
  IMAGE_FORMATS_LABEL,
  MAX_CLAIM_ATTACHMENTS,
  MAX_IMAGE_BYTES,
} from "@/lib/image-upload";

const MAX_FILES = MAX_CLAIM_ATTACHMENTS;

export const CreateClaimForm = () => {
  const navigate = useNavigate();
  const { mutate: createClaim, isPending } = useCreateClaim();
  const { mutate: uploadClaimFiles, isPending: isUploading } =
    useUploadClaimFiles();
  // Compression happens between the click and the upload mutation, so without
  // its own flag the submit button re-enables for that whole stretch.
  const [isCompressing, setIsCompressing] = useState(false);

  const [{ files, isDragging, errors }, {
    removeFile,
    openFileDialog,
    getInputProps,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  }] = useFileUpload({
    maxFiles: MAX_FILES,
    multiple: true,
    // Images only. Not `image/*`: that offers SVG and HEIC in the file dialog,
    // both of which the server refuses — turning a refusal the user sees
    // immediately into a 400 after an upload they waited for.
    accept: IMAGE_ACCEPT,
    maxSize: MAX_IMAGE_BYTES,
  });

  const form = useForm<CreateClaimFormData>({
    resolver: zodResolver(createClaimSchema),
    defaultValues: {
      title: "",
      description: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: CreateClaimFormData) => {
    const goToClaim = (claim: { id: string }) => navigate(`/claims/${claim.id}`);

    if (files.length === 0) {
      createClaim(
        { title: data.title, description: data.description },
        { onSuccess: goToClaim },
      );
      return;
    }

    // Compressed before upload, as the KYC step already does. A phone photo is
    // routinely 4-8 MB, which is at or past the 5 MB limit; resizing to 1920px
    // keeps the picture legible and keeps the upload from failing on a mobile
    // connection.
    setIsCompressing(true);
    let compressed: File[];
    try {
      compressed = await Promise.all(files.map((f) => compressImage(f.file)));
    } finally {
      setIsCompressing(false);
    }

    uploadClaimFiles(compressed, {
      onSuccess: (attachmentUrls) => {
        createClaim(
          {
            title: data.title,
            description: data.description,
            attachment_urls: attachmentUrls,
          },
          { onSuccess: goToClaim },
        );
      },
    });
  };

  const isSubmitting = isPending || isUploading || isCompressing;

  return (
    // Square and edge to edge, at every width. It fills `AppShell`'s column,
    // which is 512px on a desktop just as on a phone — so rounding it drew a
    // card floating inside a card, and `lg:p-8` doubled the gutter the page
    // was already paying. One 16px padding, once. `max-w-2xl` was dead.
    <div className="bg-card p-4">
      <h2 className="mb-6 text-2xl font-bold">Créer une Réclamation</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Titre court de votre réclamation"
                    {...field}
                    disabled={isSubmitting}
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
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description détaillée de votre réclamation"
                    rows={5}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <p className="block text-sm font-medium">Photos (optionnel)</p>
            <p className="text-xs text-muted-foreground">
              Maximum {MAX_FILES} images ({IMAGE_FORMATS_LABEL} — max 5 Mo).
              Vous en avez {files.length}/{MAX_FILES}
            </p>

            <input {...getInputProps()} className="sr-only" />

            {/* One grid for previews and the picker: the dashed tile is the
                same square as a thumbnail, so the block lines up with the
                fields above instead of leaving dead space beside a lone file. */}
            <div className="grid grid-cols-3 gap-2">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="bg-muted relative aspect-square overflow-hidden rounded-md"
                >
                  {/* No non-image branch: `accept` admits images only now. */}
                  <img
                    src={f.preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(f.id)}
                    disabled={isSubmitting}
                    aria-label={`Retirer ${f.file.name}`}
                    className="bg-destructive/90 absolute right-1 top-1 rounded-full p-1 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {files.length < MAX_FILES && (
                <button
                  type="button"
                  onClick={openFileDialog}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  disabled={isSubmitting}
                  className={cn(
                    "border-input text-muted-foreground hover:bg-muted/50 flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed px-2 text-center text-xs transition-colors",
                    isDragging && "border-whatsapp bg-whatsapp/5",
                    isSubmitting && "cursor-not-allowed opacity-50",
                  )}
                >
                  <ImagePlus className="size-5" />
                  {files.length === 0 ? "Ajouter une image" : "Ajouter"}
                </button>
              )}
            </div>

            {errors.map((message) => (
              <p key={message} className="text-destructive text-sm">
                {message}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer la Réclamation"}
            </Button>

            {/* Neutral, not the green tint `outline` carries in this app.
                Cancelling is the way OUT of the form — dressing it in the
                submit button's colour gives the two equal weight, on a screen
                where only one of them is the point. */}
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => navigate("/claims")}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
