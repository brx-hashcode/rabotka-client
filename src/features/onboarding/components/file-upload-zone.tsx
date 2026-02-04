import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, FileText, User, Camera, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fileUploadContent } from "@/content/onboarding";

type FileUploadZoneProps = {
  readonly onFileSelect: (file: File) => void;
  readonly preview: string | null;
  readonly fileName: string | null;
  readonly onRemove: () => void;
  readonly accept: string;
  readonly maxSize: number;
  readonly label: string;
  readonly description?: string;
  readonly helperText: string;
  readonly error?: string;
  readonly type?: "document" | "selfie";
};

export function FileUploadZone({
  onFileSelect,
  preview,
  fileName,
  onRemove,
  accept,
  maxSize,
  label,
  description,
  helperText,
  error,
  type = "document",
}: Readonly<FileUploadZoneProps>) {
  const isImage = preview && /\.(jpg|jpeg|png)$/i.test(fileName || "");
  const isPDF = fileName && /\.pdf$/i.test(fileName);
  const hasPreview = !!(preview && fileName);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: accept.split(",").reduce((acc, mime) => {
      acc[mime.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
    noClick: hasPreview,
  });

  const openFileDialog = () => {
    open();
  };

  const getContainerClasses = () => {
    if (isDragActive) {
      return "border-dashed border-green-500 bg-green-50";
    }
    if (hasPreview) {
      return "border border-gray-300 bg-background hover:border-green-500/50";
    }
    return "border-dashed border-gray-300 bg-gray-50/50 hover:border-green-500 hover:bg-green-50/30";
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border transition-all duration-200",
          getContainerClasses(),
          error && "border-red-500"
        )}
        {...(hasPreview ? {} : getRootProps())}
      >
        <input {...getInputProps()} className="sr-only" />

        {hasPreview ? (
          <div className="relative h-[200px] w-full">
            {isImage && (
              <img
                src={preview}
                alt={label}
                className="h-full w-full object-cover"
                onError={() => {}}
              />
            )}
            {!isImage && isPDF && (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <FileText className="size-16 text-gray-400" />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3">
              <p className="text-sm font-medium text-white truncate">
                {fileName}
              </p>
              <p className="text-xs text-white/80 mt-0.5">{helperText}</p>
            </div>

            <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                  }}
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 text-gray-900 hover:bg-white"
                >
                  <Upload className="h-4 w-4" />
                  {fileUploadContent.buttons.change}
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  variant="destructive"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                  {fileUploadContent.buttons.remove}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-3 py-6 px-4 text-center">
            {type === "document" && (
              <div className="rounded-full bg-green-100 p-3">
                <User className="size-6 text-green-600" />
              </div>
            )}
            {type === "selfie" && (
              <div className="rounded-full bg-green-100 p-3">
                <Camera className="size-6 text-green-600" />
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-gray-900">
                {isDragActive
                  ? fileUploadContent.dropzone.dropHere
                  : fileUploadContent.dropzone.clickOrDrag}
              </h3>
              <p className="text-xs text-gray-500">{helperText}</p>
            </div>

            <Button variant="outline" size="sm" type="button" className="mt-1">
              <Upload className="h-4 w-4" />
              {fileUploadContent.dropzone.browseFiles}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
