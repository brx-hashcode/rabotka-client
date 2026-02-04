import { useEffect, useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Loader2 } from "lucide-react";

interface DocumentPreviewProps {
  readonly fileUrl: string;
  readonly fileName?: string;
}

export function DocumentPreview({
  fileUrl,
  fileName = "Document",
}: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [fileUrl]);

  const docs = [
    {
      uri: fileUrl,
      fileName: fileName,
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          config={{
            header: {
              disableHeader: false,
              disableFileName: false,
              retainContentHeight: false,
            },
          }}
          onDocumentLoad={() => {
            setIsLoading(false);
          }}
          onDocumentError={(error) => {
            setIsLoading(false);
            setError("Impossible de charger le document");
            console.error("Document load error:", error);
          }}
        />
      </div>
    </div>
  );
}
