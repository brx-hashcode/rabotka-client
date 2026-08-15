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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

const MAX_IMAGES = 10;
const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_SIZE = 5 * 1024 * 1024;

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit faire au moins 3 caractères")
    .max(120, "Le titre ne doit pas dépasser 120 caractères"),
  description: z
    .string()
    .trim()
    .min(3, "La description doit faire au moins 3 caractères")
    .max(1000, "La description ne doit pas dépasser 1000 caractères"),
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
    defaultValues: { title: "", description: "" },
    mode: "onChange",
  });

  const [imageError, setImageError] = useState<string | null>(null);
  const [{ files }, { removeFile, clearFiles, openFileDialog, getInputProps }] =
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
      form.reset({
        title: item?.title ?? "",
        description: item?.description ?? "",
      });
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

  const onSubmit = (data: FormData) => {
    if (isEdit && item) {
      updateMutation.mutate(
        { id: item.id, payload: data },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }
    if (files.length === 0) {
      setImageError("Ajoutez au moins une image.");
      return;
    }
    createMutation.mutate(
      {
        title: data.title,
        description: data.description,
        images: files.map((f) => f.file),
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const handleAddImages = () => {
    if (!item || files.length === 0) return;
    if (files.length > remainingSlots) {
      setImageError(`Maximum ${MAX_IMAGES} images par réalisation.`);
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
            {isEdit ? "Modifier la réalisation" : "Nouvelle réalisation"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez le titre, la description et les images."
              : "Ajoutez un titre, une description et au moins une image."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4 pb-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex : Rénovation peinture" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Décrivez la mission réalisée." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Existing images (edit mode) */}
            {isEdit && item && item.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Images actuelles</p>
                <div className="grid grid-cols-3 gap-2">
                  {item.images.map((img) => (
                    <div
                      key={img.id}
                      className="bg-muted relative aspect-square overflow-hidden rounded-md"
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
                          item.images.length === 1
                        }
                        title={
                          item.images.length === 1
                            ? "Une réalisation doit garder au moins une image"
                            : "Supprimer l'image"
                        }
                        className="bg-destructive/90 absolute right-1 top-1 rounded-full p-1 text-white disabled:opacity-40"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploader */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isEdit ? "Ajouter des images" : "Images"}
              </p>
              <input {...getInputProps()} className="sr-only" />
              <button
                type="button"
                onClick={openFileDialog}
                className="border-input text-muted-foreground hover:bg-muted/50 flex w-full flex-col items-center gap-1 rounded-lg border border-dashed py-6 text-sm"
              >
                <ImagePlus className="size-5" />
                Choisir des images (JPG, PNG, WEBP — max 5 Mo)
              </button>

              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="bg-muted relative aspect-square overflow-hidden rounded-md"
                    >
                      <img
                        src={f.preview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="bg-destructive/90 absolute right-1 top-1 rounded-full p-1 text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

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

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer la réalisation"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
