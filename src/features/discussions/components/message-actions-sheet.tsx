import { Copy, Flag, Trash2 } from "lucide-react";
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

type Props = Readonly<{
  /** The message being acted on, or null when the sheet is closed. */
  message: DiscussionMessage | null;
  /** Supprimer has been tapped once and is waiting for the second tap. */
  confirmingDelete: boolean;
  deleting: boolean;
  onClose: () => void;
  onCopy: (message: DiscussionMessage) => void;
  onDelete: () => void;
  onReport: (messageId: string) => void;
}>;

/**
 * What a long press on a bubble opens.
 *
 * A bottom sheet rather than a menu anchored to the bubble: it is the shape
 * every other long press in the app opens, and it stays thumb-reachable
 * whichever end of a tall thread the message sits at.
 *
 * Deleting takes two taps, like "Supprimer la discussion" on the list — and
 * unlike it, the explanation has to say that this one reaches the other
 * person's screen. Somebody who has learned the first rule would otherwise
 * assume the same here.
 */
export function MessageActionsSheet({
  message,
  confirmingDelete,
  deleting,
  onClose,
  onCopy,
  onDelete,
  onReport,
}: Props) {
  const content = discussionsContent.thread;
  const warning = discussionsContent.warning;

  const mine = message?.mine ?? false;
  // Reporting is the author's alone — only they know what they meant — and
  // only where something was actually withheld.
  const canReport =
    mine &&
    !message?.reported &&
    (message?.status !== "CLEAN" || (message?.redactions.length ?? 0) > 0);

  return (
    <Drawer open={message !== null} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-center">
            <DrawerTitle className="line-clamp-2 text-base font-medium">
              {message?.body}
            </DrawerTitle>
            {confirmingDelete && (
              <DrawerDescription>
                {content.actionsDeleteExplain}
              </DrawerDescription>
            )}
          </DrawerHeader>

          <DrawerFooter>
            {/* Everything but the confirmation disappears once Supprimer is
                armed: the sheet then asks one question, and the rest is noise
                around it. */}
            {!confirmingDelete && message && (
              <Button variant="outline" onClick={() => onCopy(message)}>
                <Copy className="mr-2 h-4 w-4" />
                {content.actionsCopy}
              </Button>
            )}

            {!confirmingDelete && canReport && message && (
              <Button
                variant="outline"
                onClick={() => onReport(message.id)}
              >
                <Flag className="mr-2 h-4 w-4" />
                {warning.reportCta}
              </Button>
            )}

            {mine && (
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {confirmingDelete
                  ? content.actionsDeleteConfirm
                  : content.actionsDelete}
              </Button>
            )}

            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
