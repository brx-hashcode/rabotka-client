import type { ReactNode } from "react";
import { useDownloadHint } from "@/hooks/use-download-hint";
import { cn } from "@/lib/utils";

type DownloadLinkProps = {
  /** Absolute URL of the file. The server sets Content-Disposition: attachment. */
  href: string;
  children: ReactNode;
  className?: string;
};

/**
 * A real anchor to a real file URL — see useDownloadHint for why this is not a
 * button that fetches a Blob.
 *
 * Auth rides on the session cookie: the endpoints are GET, the CSRF guard
 * skips GET, and the cookie is SameSite=None in production.
 */
export function DownloadLink({ href, children, className }: DownloadLinkProps) {
  const onClick = useDownloadHint();

  return (
    <a
      href={href}
      download
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        "text-sm font-medium text-primary underline underline-offset-2 hover:no-underline",
        className,
      )}
    >
      {children}
    </a>
  );
}
