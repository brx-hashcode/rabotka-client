import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tapFeedback } from "@/lib/haptics";
import {
  openDiscussion,
  openDiscussionWithProfile,
} from "@/lib/api/discussions-controller";

/**
 * Two ways in, and the card picks one.
 *
 * `application` is the ordinary case. `profile` is an employer writing to a
 * recommended worker with no application between them — capped server-side,
 * because it reaches somebody who never asked to be reached. Either way the
 * server lands in the pair's ONE thread.
 *
 * A discriminated union rather than two optional ids, so a card cannot pass
 * both and leave the button guessing which one it meant.
 */
type Target =
  | { readonly kind: "application"; readonly id: string | null }
  | { readonly kind: "profile"; readonly id: string };

type Props = Readonly<{
  /**
   * What to open. An `application` target with a null id renders NOTHING
   * rather than a disabled button: a greyed-out control invites a tap and then
   * explains itself, and on a card that repeats down a feed that is a dozen
   * invitations to be told no.
   */
  target: Target;
  /**
   * `primary` when talking is the thing left to do on the card — after
   * applying, the apply button is dead and this is the only live action, so it
   * takes the weight. `secondary` beside a live primary, so the two do not
   * compete.
   */
  emphasis?: "primary" | "secondary";
  /** Icon only, for dense list rows where a label does not fit. */
  compact?: boolean;
  className?: string;
}>;

/**
 * "Discuter" — opens the conversation, or creates it.
 *
 * Built on `Button` rather than a hand-drawn square. The first version was a
 * 40px icon beside a 44px button, pale, without a label — it read as an
 * afterthought, and on an applied card it was the only thing left to tap.
 * Same height, same press, same highlight as every other action now, and a
 * word next to the icon: a lone speech bubble is not obviously "talk to the
 * employer about this job".
 */
export function StartChatButton({
  target,
  emphasis = "secondary",
  compact = false,
  className,
}: Props) {
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
  const id = target.id;

  return (
    <Button
      type="button"
      variant={emphasis === "primary" ? "default" : "outline"}
      size={compact ? "icon" : "default"}
      aria-label="Discuter"
      loading={open.isPending}
      onClick={(e) => {
        // The whole card is a navigation target on most screens; without this
        // the tap opens the offer behind the button.
        e.stopPropagation();
        tapFeedback();
        open.mutate(id);
      }}
      className={cn(!compact && "px-5", className)}
    >
      <MessageCircle className="size-5!" strokeWidth={1.75} />
      {!compact && "Discuter"}
    </Button>
  );
}
