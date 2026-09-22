import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { tapFeedback } from "@/lib/haptics";
import {
  openDiscussion,
  openDiscussionWithProfile,
} from "@/lib/api/discussions-controller";

/**
 * Two ways in, and the card picks one.
 *
 * `application` is the ordinary case: a thread about a specific application.
 * `profile` is an employer writing to a recommended worker with no application
 * between them — capped server-side, because it reaches somebody who never
 * asked to be reached.
 *
 * A discriminated union rather than two optional ids, so a card cannot pass
 * both and leave the button guessing which one it meant.
 */
type Target =
  | { readonly kind: "application"; readonly id: string | null }
  | { readonly kind: "profile"; readonly id: string };

type Props = {
  /**
   * What to open. An `application` target with a null id renders NOTHING
   * rather than a disabled button: a greyed-out control invites a tap and then
   * explains itself, and on a card that repeats down a feed that is a dozen
   * invitations to be told no.
   */
  readonly target: Target;
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
export function StartChatButton({ target, className }: Props) {
  const navigate = useNavigate();

  const open = useMutation({
    mutationFn: (id: string) =>
      target.kind === "application"
        ? openDiscussion(id)
        : openDiscussionWithProfile(id),
    onSuccess: ({ conversation }) => navigate(`/discussions/${conversation.id}`),
    onError: (error: unknown) => {
      // The profile path has a daily cap and says so in French. Showing the
      // server's sentence beats a generic failure that leaves somebody
      // retrying a button that will not work again today.
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "";
      toast.error(message || "La discussion n’a pas pu être ouverte");
    },
  });

  if (!target.id) return null;

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
        open.mutate(target.id as string);
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
