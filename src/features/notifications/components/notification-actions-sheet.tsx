import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { notificationsContent as copy } from "@/content/notifications";
import { cn } from "@/lib/utils";

const ROW =
  "flex h-14 w-full items-center justify-center text-sm font-medium transition-colors active:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-whatsapp/40 disabled:opacity-50";

/**
 * The ⋮ menu, as a bottom sheet: the two bulk actions and a way out. Opening
 * the sheet is itself the confirmation step for « Tout effacer ».
 */
export function NotificationActionsSheet({
  open,
  onOpenChange,
  hasUnread,
  hasItems,
  onMarkAllRead,
  onClearAll,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasUnread: boolean;
  hasItems: boolean;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}>) {
  const run = (action: () => void) => () => {
    action();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-0">
        <div className="mx-auto w-full max-w-md px-4 pb-6">
          <DrawerHeader className="text-center">
            <DrawerTitle>{copy.menuTitle}</DrawerTitle>
            <DrawerDescription>{copy.menuDescription}</DrawerDescription>
          </DrawerHeader>

          <div className="overflow-hidden rounded-xl bg-card shadow-soft divide-y divide-border">
            <button
              type="button"
              disabled={!hasItems}
              onClick={run(onClearAll)}
              className={cn(ROW, "text-destructive")}
            >
              {copy.clearAll}
            </button>
            <button
              type="button"
              disabled={!hasUnread}
              onClick={run(onMarkAllRead)}
              className={cn(ROW, "text-foreground")}
            >
              {copy.markAll}
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(ROW, "mt-3 rounded-xl bg-card font-semibold shadow-soft")}
          >
            {copy.cancel}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
