import { Loader2 } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** ReactNode so callers can emphasise an amount or a name inline. */
  description: React.ReactNode;
  actionLabel: string;
  /**
   * Most confirmations here guard a destructive act, so that stays the default.
   * Pass "whatsapp" when the confirmed action is a commitment rather than a
   * deletion (accepting a candidate), where a red button misreads as danger.
   */
  confirmVariant?: "destructive" | "whatsapp";
  onConfirm: () => void;
  isPending?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  confirmVariant = "destructive",
  onConfirm,
  isPending,
}: Readonly<Props>) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-center">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {actionLabel}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isPending}>
                Annuler
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
