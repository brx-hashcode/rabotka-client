import { FileText, Download } from "lucide-react";
import { DownloadLink } from "@/components/common/download-link";
import { cn } from "@/lib/utils";

type Props = {
  /** Absolute file URL (server sets Content-Disposition: attachment). */
  readonly href: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly className?: string;
};

/**
 * A borderless PDF "file card" download: red PDF glyph + label + download icon.
 * Wraps DownloadLink so it stays adaptive inside the WhatsApp WebView.
 */
export function PdfDownloadLink({
  href,
  title,
  subtitle = "Document PDF",
  className,
}: Props) {
  return (
    <DownloadLink
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl bg-card p-3 text-foreground no-underline shadow-soft hover:no-underline active:bg-secondary/40",
        className,
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
        <FileText className="h-5 w-5 text-red-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Download className="h-5 w-5 shrink-0 text-whatsapp" />
    </DownloadLink>
  );
}
