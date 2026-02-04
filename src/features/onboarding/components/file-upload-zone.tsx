import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X, FileText, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  readonly onFileSelect: (file: File) => void;
  readonly preview: string | null;
  readonly fileName: string | null;
  readonly onRemove: () => void;
  readonly accept: string;
  readonly maxSize: number;
  readonly label: string;
  readonly helperText: string;
  readonly error?: string;
  readonly type?: "document" | "selfie";
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
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const isImage = preview && /\.(jpg|jpeg|png)$/i.test(fileName || "");
  const isPDF = fileName && /\.pdf$/i.test(fileName);

  return (
    <div className="space-y-2">
      {preview && fileName ? (
        // Preview remplace complètement la zone d'upload
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-4">
            {/* Miniature */}
            {isImage && (
              <img
                src={preview}
                alt={label}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            {!isImage && isPDF && (
              <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
            )}

            {/* Nom et infos */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-500 mt-1">{helperText}</p>
            </div>

            {/* Bouton x petit */}
            <button
              type="button"
              onClick={onRemove}
              className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
              aria-label="Retirer le fichier"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        // Zone d'upload avec label
        <>
          <label className="text-sm font-medium text-gray-700">{label}</label>
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
              {type === "document" && (
                <User className="w-12 h-12 text-gray-400" />
              )}
              {type === "selfie" && (
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
        </>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
