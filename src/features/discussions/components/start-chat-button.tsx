import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { tapFeedback } from "@/lib/haptics";
import { openDiscussion } from "@/lib/api/discussions-controller";

type Props = {
  /**
   * The LIVE application this conversation hangs on.
   *
   * Null renders nothing at all rather than a disabled button. A greyed-out
   * control on a card invites a tap and then explains itself — on a card that
   * appears a dozen times down a feed, that is a dozen invitations to be told
   * no. Absence says the same thing more quietly.
   */
  readonly applicationId: string | null;
  readonly className?: string;
};

/**
 * "Discuter" — opens the conversation for an application, or creates it.
 *
 * Idempotent on the server: a unique index on the application makes a second
 * call return the first result, so this may be tapped from anywhere, as often
 * as anyone likes, without a guard.
 *
 * Sits BESIDE the card's primary action rather than replacing it. Applying and
 * talking are different intents, and a card that swaps its button depending on
 * state makes the user re-read it every time.
 */
export function StartChatButton({ applicationId, className }: Props) {
  const navigate = useNavigate();

  const open = useMutation({
    mutationFn: (id: string) => openDiscussion(id),
    onSuccess: ({ conversation }) => navigate(`/discussions/${conversation.id}`),
    onError: () => toast.error("La discussion n’a pas pu être ouverte"),
  });

  if (!applicationId) return null;

  return (
    <button
      type="button"
      aria-label="Discuter"
      disabled={open.isPending}
      onClick={(e) => {
        // The whole card is a navigation target on most screens; without this
        // the tap opens the offer behind the button.
        e.stopPropagation();
        tapFeedback();
        open.mutate(applicationId);
      }}
      className={cn(
        "flex h-10 w-12 shrink-0 items-center justify-center rounded-md",
        "bg-whatsapp/10 text-whatsapp",
        "transition duration-100 active:scale-90 active:bg-whatsapp/20",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        "disabled:opacity-50",
        className,
      )}
    >
      {open.isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
      )}
    </button>
  );
}
