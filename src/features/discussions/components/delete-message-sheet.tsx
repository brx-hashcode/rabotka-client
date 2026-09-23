import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { discussionsContent } from "@/content/discussions";
import type { DiscussionMessage } from "@/lib/api/discussions-controller";

/**
 * "Are you sure?", after the revealed Supprimer is tapped.
 *
 * A confirmation and nothing else — the gesture already chose the message, so
 * this sheet has one question to ask.
 *
 * It asks at all because this delete is not the one people have learned.
 * « Supprimer la discussion » on the list clears a thread for YOU; this one
 * reaches the other person's screen, and somebody who knows the first rule
 * would assume the same here. The description says so before the tap, not
 * after it.
 */
export function DeleteMessageSheet({
  message,
  deleting,
  onClose,
  onConfirm,
}: Readonly<{
  /** The message about to be deleted, or null when the sheet is closed. */
  message: DiscussionMessage | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}>) {
  const content = discussionsContent.thread;

  return (
    <Drawer open={message !== null} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-center">
            {/* The message itself, so there is no doubt which one this is —
                clamped, because a long one would push the buttons off screen. */}
            <DrawerTitle className="line-clamp-3 text-base font-medium">
              {message?.body}
            </DrawerTitle>
            <DrawerDescription>{content.actionsDeleteExplain}</DrawerDescription>
          </DrawerHeader>

          <DrawerFooter>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {content.actionsDeleteConfirm}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
