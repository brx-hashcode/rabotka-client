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
import { FileText, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useCreateClaim } from "@/hooks/use-create-claim";
import { useUploadClaimFiles } from "@/hooks/use-upload-claim-files";
import {
  createClaimSchema,
  type CreateClaimFormData,
} from "@/lib/validations/claims";

const MAX_FILES = 3;
const ACCEPT = "image/*,.pdf,.doc,.docx";

export const CreateClaimForm = () => {
  const navigate = useNavigate();
  const { mutate: createClaim, isPending } = useCreateClaim();
  const { mutate: uploadClaimFiles, isPending: isUploading } =
    useUploadClaimFiles();

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
    accept: ACCEPT,
  });

  const form = useForm<CreateClaimFormData>({
    resolver: zodResolver(createClaimSchema),
    defaultValues: {
      title: "",
      description: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: CreateClaimFormData) => {
    if (files.length === 0) {
      // No files to upload, create claim directly
      createClaim(
        {
          title: data.title,
          description: data.description,
        },
        {
          onSuccess: (claim) => {
            navigate(`/claims/${claim.id}`);
          },
        },
      );
    } else {
      // Upload files first
      uploadClaimFiles(
        files.map((f) => f.file),
        {
          onSuccess: (attachmentUrls) => {
            createClaim(
              {
                title: data.title,
                description: data.description,
                attachment_urls: attachmentUrls,
              },
              {
                onSuccess: (claim) => {
                  navigate(`/claims/${claim.id}`);
                },
              },
            );
          },
        },
      );
    }
  };

  const isSubmitting = isPending || isUploading;

  return (
    <div className="bg-white rounded-lg lg:p-8 p-4 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Créer une Réclamation</h2>

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
            <p className="block text-sm font-medium">
              Pièces Jointes (Optionnel)
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum {MAX_FILES} fichiers (images, PDF, DOC — max 5 Mo). Vous
              en avez {files.length}/{MAX_FILES}
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
                  {f.file.type.startsWith("image/") ? (
                    <img
                      src={f.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
                      <FileText className="text-muted-foreground size-6" />
                      <span className="text-muted-foreground w-full truncate text-[10px]">
                        {f.file.name}
                      </span>
                    </div>
                  )}
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
                  {files.length === 0 ? "Ajouter un fichier" : "Ajouter"}
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

            <Button
              type="button"
              variant="outline"
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
