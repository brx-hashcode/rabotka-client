import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X, FileText, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  preview: string | null;
  fileName: string | null;
  onRemove: () => void;
  accept: string;
  maxSize: number;
  label: string;
  helperText: string;
  error?: string;
  type?: "document" | "selfie";
}

export function FileUploadZone({
  onFileSelect,
  preview,
  fileName,
  onRemove,
  accept,
  maxSize,
  label,
  helperText,
  error,
  type = "document",
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(",").reduce((acc, mime) => {
      acc[mime.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
  });

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const isImage = preview && /\.(jpg|jpeg|png)$/i.test(fileName || "");
  const isPDF = fileName && /\.pdf$/i.test(fileName);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {preview && fileName ? (
        <div className="relative border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-4">
            {isImage ? (
              <img
                src={preview}
                alt={label}
                className="w-20 h-20 object-cover rounded"
              />
            ) : isPDF ? (
              <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
            ) : null}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-500">{helperText}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-green-500",
            error && "border-red-500"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            {type === "document" ? (
              <User className="w-12 h-12 text-gray-400" />
            ) : (
              <Camera className="w-12 h-12 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragActive
                  ? "Déposez le fichier ici"
                  : "Cliquez ou glissez votre fichier"}
              </p>
              <p className="text-xs text-gray-500 mt-1">{helperText}</p>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
