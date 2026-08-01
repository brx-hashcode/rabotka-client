import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileWarning, ChevronRight, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDate } from "@/lib/utils";
import { penaltiesContent } from "@/content/profile";
import { useProfilePenalties } from "@/hooks/use-profile-penalties";

const content = penaltiesContent;

export const PenaltiesSheetButton = ({ asRow = false }: { asRow?: boolean }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { data: penalties, isLoading } = useProfilePenalties({
    enabled: isOpen,
  });
  const hasPenalties = Boolean(Array.isArray(penalties) && penalties.length > 0);
  const list = hasPenalties ? penalties : [];
  const unpaid = list.filter((p) => !p.paidAt);
  const unpaidTotal = unpaid.reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      {asRow ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-muted text-foreground"
        >
          <FileWarning className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">{content.button}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setIsOpen(true)}
        >
          <FileWarning className="h-4 w-4" />
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
            {!isLoading && !hasPenalties && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="bg-muted rounded-full p-6">
                  <FileWarning className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  {content.empty}
                </p>
              </div>
            )}
            {!isLoading && hasPenalties && (
              <ul className="space-y-3 py-4">
                {list.map((p) => {
                  const isPaid = Boolean(p.paidAt);
                  return (
                    <li
                      key={p.id}
                      className="rounded-lg shadow-soft bg-card p-4 space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={
                            isPaid
                              ? "font-medium text-muted-foreground line-through"
                              : "font-medium text-destructive"
                          }
                        >
                          {formatAmount(p.amount)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(p.appliedAt)}
                        </span>
                      </div>
                      {p.jobOfferTitle && (
                        <p className="text-sm text-muted-foreground">
                          {p.jobOfferTitle}
                        </p>
                      )}
                      {p.reason && (
                        <p className="text-sm text-foreground">{p.reason}</p>
                      )}
                      {isPaid && (
                        <div className="flex items-center gap-1.5 pt-1 text-sm font-medium text-whatsapp">
                          <Check className="h-4 w-4" />
                          Payée
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {unpaid.length > 0 && (
            <SheetFooter>
              <Button
                className="w-full bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/penalites/paiement");
                }}
              >
                Payer {formatAmount(unpaidTotal)}
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
