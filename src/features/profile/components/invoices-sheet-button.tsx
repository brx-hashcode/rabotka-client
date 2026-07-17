import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileText, Download, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDate } from "@/lib/utils";
import { invoicesContent } from "@/content/profile";
import { useProfileInvoices } from "@/hooks/use-profile-invoices";
import { useDownloadHint } from "@/hooks/use-download-hint";
import { invoiceDownloadUrl } from "@/lib/api/profile-controller";

const content = invoicesContent;

const REASON_LABELS: Record<string, string> = {
  CONTACT_UNLOCK: "Déverrouillage de contact",
  PENALTY: "Pénalité",
  OTHER: "Autre",
};

export const InvoicesSheetButton = ({ asRow = false }: { asRow?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleDownloadClick = useDownloadHint();

  const { data: invoices, isLoading } = useProfileInvoices({
    enabled: isOpen,
  });

  const hasInvoices = Boolean(Array.isArray(invoices) && invoices.length > 0);
  const list = hasInvoices ? invoices : [];

  return (
    <>
      {asRow ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 active:bg-muted text-foreground"
        >
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">{content.button}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setIsOpen(true)}
        >
          <FileText className="h-4 w-4" />
          {content.button}
        </Button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>{content.sheet.title}</SheetTitle>
            <SheetDescription>{content.sheet.description}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {isLoading && (
              <div className="space-y-4 py-6">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            )}
            {!isLoading && !hasInvoices && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="bg-muted rounded-full p-6">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  {content.empty}
                </p>
              </div>
            )}
            {!isLoading && hasInvoices && (
              <ul className="space-y-3 py-4">
                {list.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="rounded-lg border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-foreground">
                        {formatAmount(Number(invoice.amount))}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(invoice.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {REASON_LABELS[invoice.reason] ?? invoice.reason}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <a
                        href={invoiceDownloadUrl(invoice.id)}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleDownloadClick}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {content.download}
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
