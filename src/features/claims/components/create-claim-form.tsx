import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateClaim } from "@/hooks/use-create-claim";
import { useUploadClaimFiles } from "@/hooks/use-upload-claim-files";
import {
  createClaimSchema,
  type CreateClaimFormData,
} from "@/lib/validations/claims";

type FilePreview = {
  file: File;
  preview: string;
};

export const CreateClaimForm = () => {
  const navigate = useNavigate();
  const { mutate: createClaim, isPending } = useCreateClaim();
  const { mutate: uploadClaimFiles, isPending: isUploading } =
    useUploadClaimFiles();

  const [files, setFiles] = useState<FilePreview[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const maxFiles = 3;

  const form = useForm<CreateClaimFormData>({
    resolver: zodResolver(createClaimSchema),
    defaultValues: {
      title: "",
      description: "",
    },
    mode: "onChange",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const totalFiles = files.length + newFiles.length;

    if (totalFiles > maxFiles) {
      setFileError(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    const previews = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles([...files, ...previews]);
    setFileError(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

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
    <Card className="p-6 max-w-2xl">
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
            <label className="block text-sm font-medium">
              Pièces Jointes (Optionnel)
            </label>
            <p className="text-xs text-muted-foreground">
              Maximum {maxFiles} fichiers. Vous en avez {files.length}/
              {maxFiles}
            </p>

            {fileError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {fileError}
              </div>
            )}

            {files.length < maxFiles && (
              <label
                className={cn(
                  "block p-6 rounded-lg border-2 border-dashed border-border cursor-pointer hover:bg-muted transition-colors",
                  isSubmitting && "opacity-50 cursor-not-allowed",
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">
                    {files.length === 0
                      ? "Cliquez pour télécharger"
                      : "Ajouter plus de fichiers"}
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                  className="hidden"
                />
              </label>
            )}

            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {files.map((fp, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden border border-border bg-muted"
                  >
                    {fp.file.type.startsWith("image/") ? (
                      <img
                        src={fp.preview}
                        alt={`Aperçu ${idx}`}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center bg-muted-foreground/10">
                        <span className="text-xs text-muted-foreground truncate px-2">
                          {fp.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded hover:bg-black/70 transition-colors"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => navigate("/claims")}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer la Réclamation"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};
