import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Loader2, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
  useCreatePortfolioItem,
  useUpdatePortfolioItem,
  useAddPortfolioImages,
  useRemovePortfolioImage,
} from "@/hooks/use-portfolio";
import type { PortfolioItem } from "../types";

/**
 * Per publication. Three reads as a set of photos rather than an album, and
 * the feed tile only previews one with a "+n" badge anyway. Older items may
 * already hold more — editing one just offers no way to add another.
 */
const MAX_IMAGES = 3;
const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Only a ceiling. "Text or images, at least one" is NOT expressible here:
 * the files never enter form state, so a cross-field refine would not re-run
 * when an image is added or removed. `canSubmit` below owns that rule.
 */
const schema = z.object({
  description: z
    .string()
    .trim()
    .max(1000, "Le texte ne doit pas dépasser 1000 caractères"),
});
type FormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Provided = edit mode; omitted = create mode. */
  item?: PortfolioItem | null;
};

export function RealizationFormSheet({
  open,
  onOpenChange,
  item,
}: Readonly<Props>) {
  const isEdit = !!item;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { description: "" },
    mode: "onChange",
  });

  const [imageError, setImageError] = useState<string | null>(null);
  const [
    { files, errors: fileErrors },
    { removeFile, clearFiles, openFileDialog, getInputProps },
  ] =
    useFileUpload({
      multiple: true,
      maxFiles: MAX_IMAGES,
      accept: ACCEPT,
      maxSize: MAX_SIZE,
    });

  const createMutation = useCreatePortfolioItem();
  const updateMutation = useUpdatePortfolioItem();
  const addImagesMutation = useAddPortfolioImages();
  const removeImageMutation = useRemovePortfolioImage();

  // Seed / reset the form each time the sheet opens.
  useEffect(() => {
    if (open) {
      form.reset({ description: item?.description ?? "" });
      clearFiles();
      setImageError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.id]);

  useEffect(() => {
    return () => files.forEach((f) => URL.revokeObjectURL(f.preview));
  }, [files]);

  const existingCount = item?.images.length ?? 0;
  const remainingSlots = MAX_IMAGES - existingCount;

  // A publication is text, images, or both — never neither. Derived rather
  // than validated, because `files` lives outside the form: a zod refine would
  // only re-run on a keystroke, leaving the button stale the moment someone
  // adds a photo without typing.
  const text = form.watch("description")?.trim() ?? "";
  const canSubmit = isEdit
    ? // Editing only ever touches the text here; images have their own
      // buttons. Clearing it is allowed as long as photos remain.
      !!text || existingCount > 0
    : !!text || files.length > 0;

  const onSubmit = (data: FormData) => {
    if (isEdit && item) {
      updateMutation.mutate(
        { id: item.id, payload: { description: data.description } },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }
    if (!data.description.trim() && files.length === 0) {
      setImageError("Écrivez quelque chose ou ajoutez une image.");
      return;
    }
    createMutation.mutate(
      {
        description: data.description,
        images: files.map((f) => f.file),
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const handleAddImages = () => {
    if (!item || files.length === 0) return;
    if (files.length > remainingSlots) {
      setImageError(`Maximum ${MAX_IMAGES} images par publication.`);
      return;
    }
    addImagesMutation.mutate(
      { id: item.id, images: files.map((f) => f.file) },
      { onSuccess: () => clearFiles() },
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-2xl"
      >
        <SheetHeader className="text-left">
          <SheetTitle>
            {isEdit ? "Modifier la publication" : "Nouvelle publication"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez votre texte ou vos photos."
              : "Écrivez quelque chose, ajoutez des photos, ou les deux."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4 pb-6"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  {/* No label: the placeholder asks the question, the way a
                      composer does. A field called "Description" invites a
                      paragraph about a mission; this invites a sentence.

                      The surrounding box owns the surface and the focus
                      ring so the thumbnails inside it read as part of what you
                      are writing, not as a separate list underneath. */}
                  <div className="bg-card shadow-soft focus-within:ring-whatsapp/30 rounded-lg focus-within:ring-2">
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Racontez votre travail, ou dites que vous êtes disponible…"
                        autoFocus={!isEdit}
                        className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field}
                      />
                    </FormControl>

                    {/* Attachments sit in the corner of the box they belong
                        to, the way a composer holds them — and the picker is
                        the next tile in that same row, so adding a photo means
                        reaching for the place the photos already are.

                        No counter: the tiles are the count, and the trigger
                        leaving when the row is full says the rest. */}
                    <input {...getInputProps()} className="sr-only" />
                    <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
                      {files.map((f) => (
                        <div
                          key={f.id}
                          className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md"
                        >
                          <img
                            src={f.preview}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(f.id)}
                            aria-label="Retirer l'image"
                            className="bg-foreground/60 text-background absolute right-1 top-1 rounded-full p-0.5"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}

                      {/* Gone once full, not greyed out: a dead tile in the
                          middle of the composer reads as something broken. */}
                      {remainingSlots - files.length > 0 && (
                        <button
                          type="button"
                          onClick={openFileDialog}
                          title="JPG, PNG ou WEBP — 5 Mo maximum"
                          aria-label="Ajouter des photos"
                          className="bg-muted text-muted-foreground hover:bg-muted/70 flex size-16 shrink-0 items-center justify-center rounded-md transition-colors"
                        >
                          <ImagePlus className="text-whatsapp size-6" />
                        </button>
                      )}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Existing images (edit mode). Kept out of the composer above:
                removing one of these hits the server immediately, while the
                thumbnails in the box are still only local files. */}
            {isEdit && item && item.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">Images actuelles</p>
                <div className="flex flex-wrap gap-2">
                  {item.images.map((img) => (
                    <div
                      key={img.id}
                      className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md"
                    >
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeImageMutation.mutate({
                            id: item.id,
                            imageId: img.id,
                          })
                        }
                        disabled={
                          removeImageMutation.isPending ||
                          (item.images.length === 1 && !text)
                        }
                        title={
                          item.images.length === 1 && !text
                            ? "Écrivez un texte pour pouvoir retirer la dernière image"
                            : "Supprimer l'image"
                        }
                        aria-label="Supprimer l'image"
                        className="bg-foreground/60 text-background absolute right-1 top-1 rounded-full p-0.5 disabled:opacity-40"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Whatever the uploader has to report once it has run: the
                trigger itself lives in the composer above. */}
            <div className="space-y-2">
              {/* A file the hook rejected — too large, or not an image —
                  used to disappear without a word. Survivable when a photo was
                  mandatory and the form blocked; now it would quietly publish
                  text alone and look like the photo simply vanished. */}
              {fileErrors.map((message) => (
                <p key={message} className="text-destructive text-sm">
                  {message}
                </p>
              ))}

              {imageError && (
                <p className="text-destructive text-sm">{imageError}</p>
              )}

              {isEdit && files.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAddImages}
                  disabled={addImagesMutation.isPending}
                >
                  {addImagesMutation.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Ajouter {files.length} image{files.length > 1 ? "s" : ""}
                </Button>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSaving || !canSubmit}
            >
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Publier"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
