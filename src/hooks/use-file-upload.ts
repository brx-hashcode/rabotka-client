import { useState, useCallback, useRef, useId } from "react";

export type FileWithPreview = {
  id: string;
  file: File;
  preview: string;
};

export type UseFileUploadOptions = {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  onFilesChange?: (files: FileWithPreview[]) => void;
};

export type UseFileUploadState = {
  files: FileWithPreview[];
  isDragging: boolean;
  errors: string[];
};

export type UseFileUploadActions = {
  removeFile: (id: string) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  openFileDialog: () => void;
  getInputProps: () => React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  clearFiles: () => void;
  clearErrors: () => void;
};

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

/**
 * Default ceiling for an uploaded file, matching what KYC documents and
 * portfolio realizations already use. A phone camera photo routinely lands
 * between 2 and 4 MB, so the previous 2 MB default rejected ordinary pictures
 * taken on the device the app is used from.
 */
export const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function useFileUpload(
  options: UseFileUploadOptions = {},
): [UseFileUploadState, UseFileUploadActions] {
  const {
    maxFiles = 1,
    maxSize = DEFAULT_MAX_UPLOAD_BYTES,
    accept = "image/*",
    multiple = false,
    onFilesChange,
  } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return `Le fichier "${file.name}" dépasse la taille maximale de ${formatBytes(maxSize)}`;
      }

      if (accept && accept !== "*") {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const isAccepted = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            const baseType = type.replace("/*", "");
            return file.type.startsWith(baseType);
          }
          return file.type === type || file.name.endsWith(type);
        });

        if (!isAccepted) {
          return `Le fichier "${file.name}" n'est pas un format accepté`;
        }
      }

      return null;
    },
    [maxSize, accept],
  );

  const processFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const newErrors: string[] = [];
      const validFiles: FileWithPreview[] = [];

      const remainingSlots = maxFiles - files.length;
      const filesToProcess = multiple
        ? fileArray.slice(0, remainingSlots)
        : fileArray.slice(0, 1);

      filesToProcess.forEach((file, index) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
        } else {
          validFiles.push({
            id: `${uniqueId}-${Date.now()}-${index}`,
            file,
            preview: URL.createObjectURL(file),
          });
        }
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
      }

      if (validFiles.length > 0) {
        const updatedFiles = multiple
          ? [...files, ...validFiles].slice(0, maxFiles)
          : validFiles;
        setFiles(updatedFiles);
        onFilesChange?.(updatedFiles);
      }
    },
    [files, maxFiles, multiple, validateFile, uniqueId, onFilesChange],
  );

  const removeFile = useCallback(
    (id: string) => {
      const fileToRemove = files.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const updatedFiles = files.filter((f) => f.id !== id);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    },
    [files, onFilesChange],
  );

  const clearFiles = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    onFilesChange?.([]);
  }, [files, onFilesChange]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setErrors([]);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    },
    [processFiles],
  );

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setErrors([]);
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        processFiles(selectedFiles);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [processFiles],
  );

  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: "file" as const,
      accept,
      multiple,
      onChange: handleInputChange,
      style: { display: "none" } as React.CSSProperties,
    }),
    [accept, multiple, handleInputChange],
  );

  return [
    { files, isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
      clearFiles,
      clearErrors,
    },
  ];
}
