import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useUpdateAvatar } from "@/hooks/use-update-avatar";
import { editProfileContent } from "@/content/profile";

const content = editProfileContent.avatar;

type AvatarUploadProps = Readonly<{
  readonly maxSize?: number;
  readonly className?: string;
  readonly defaultAvatar?: string | null;
  readonly onAvatarChange?: (avatarUrl: string) => void;
}>;

export function AvatarUpload({
  maxSize = 2 * 1024 * 1024,
  className,
  defaultAvatar,
  onAvatarChange,
}: AvatarUploadProps) {
  const { mutate: uploadAvatar, isPending: isUploading } = useUpdateAvatar();

  const [
    { files, isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept: "image/png,image/jpeg,image/jpg",
    multiple: false,
    onFilesChange: (newFiles) => {
      if (newFiles.length > 0) {
        const file = newFiles[0].file;
        uploadAvatar(file, {
          onSuccess: (data) => {
            onAvatarChange?.(data.avatarUrl);
          },
        });
      }
    },
  });

  const currentFile = files[0];
  const previewUrl = currentFile?.preview || defaultAvatar;

  const handleRemove = () => {
    if (currentFile) {
      removeFile(currentFile.id);
    }
  };

  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [files]);

  const renderAvatarContent = () => {
    if (isUploading) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (previewUrl) {
      return (
        <img
          src={previewUrl}
          alt="Avatar"
          className="h-full w-full object-cover"
        />
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <User className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        <button
          type="button"
          className={cn(
            "group/avatar relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-dashed transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            previewUrl && "border-solid border-primary/20",
            isUploading && "pointer-events-none opacity-70",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
          aria-label={content.upload}
        >
          <input {...getInputProps()} className="sr-only" />

          {renderAvatarContent()}
        </button>

        {currentFile && !isUploading && (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute top-1 right-0.5 h-6 w-6 rounded-full"
            aria-label="Remove avatar"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {errors.length > 0 && (
        <div className="text-center">
          {errors.map((error) => (
            <p key={error} className="text-xs text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
