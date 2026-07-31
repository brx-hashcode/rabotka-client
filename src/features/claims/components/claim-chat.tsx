import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Send,
  Trash2,
  ArrowLeft,
  Info,
  Download,
  MessageCircle,
  X,
} from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useProfileMe } from "@/hooks/use-profile-me";
import {
  useClaimComments,
  useAddClaimComment,
  useDeleteClaimComment,
} from "@/hooks/use-claim-comments";
import { useClaimCommentsSocket } from "@/hooks/use-claim-comments-socket";
import type { ClaimItem, ClaimCommentItem } from "@/lib/api/claims-controller";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  CREATED: { label: "Créée", className: "bg-yellow-100 text-yellow-800" },
  IN_PROGRESS: { label: "En cours", className: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Complétée", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejetée", className: "bg-red-100 text-red-800" },
};

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

type ClaimChatProps = {
  claim: ClaimItem;
};

type CommentItemProps = Readonly<{
  comment: ClaimCommentItem;
  currentUserId?: string;
  onDelete: (commentId: string) => void;
  isDeletingComment: boolean;
}>;

function getCommentAuthorName(
  comment: ClaimCommentItem,
  isFromCurrentProfile: boolean,
): string {
  if (isFromCurrentProfile) return "Vous";
  if (comment.createdByType === "profile")
    return comment.profileName || "Profile";
  return "Support";
}

function CommentBubble({
  comment,
  currentUserId,
  onDelete,
  isDeletingComment,
}: CommentItemProps) {
  const mine =
    comment.createdByType === "profile" && comment.profileId === currentUserId;

  return (
    <div
      className={cn(
        "group flex items-end gap-2",
        mine ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          // WhatsApp bubbles: tight radius with a squared-off corner on the
          // sender's side, pale green outgoing / white incoming, dark text on both.
          "max-w-[80%] rounded-xl px-2.5 py-1.5 text-sm text-foreground",
          mine ? "rounded-br-sm bg-whatsapp-light" : "rounded-bl-sm bg-card",
        )}
      >
        {!mine && (
          <p className="mb-0.5 text-[11px] font-semibold text-whatsapp">
            {getCommentAuthorName(comment, mine)}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {comment.content}
        </p>
        <p className="mt-0.5 text-right text-[10px] leading-none text-muted-foreground">
          {formatDateTime(comment.createdAt)}
        </p>
      </div>
      {mine && (
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          disabled={isDeletingComment}
          className="mb-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40 group-hover:flex"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function ClaimInfoPanel({
  claim,
  onClose,
}: Readonly<{ claim: ClaimItem; onClose: () => void }>) {
  return (
    <button
      type="button"
      className="absolute inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
      aria-label="Fermer"
    >
      <div
        className="max-h-[82%] w-full overflow-y-auto rounded-t-2xl bg-card text-left sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="font-semibold text-foreground">
            Détails de la réclamation
          </h3>
          <div className="flex items-center gap-2">
            <StatusBadge status={claim.status} />
            <span className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </span>
          </div>
        </div>
        <div className="space-y-4 px-5 pb-6">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Titre
            </p>
            <p className="text-sm font-medium text-foreground">{claim.title}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {claim.description}
            </p>
          </div>
          {claim.attachmentUrls.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pièces jointes ({claim.attachmentUrls.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {claim.attachmentUrls.map((url, idx) => (
                  <a
                    key={`${url}-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      src={url}
                      alt={`Pièce jointe ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                      <Download className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Créée le {formatDateTime(claim.createdAt)}
          </p>
        </div>
      </div>
    </button>
  );
}

export const ClaimChat = ({ claim }: ClaimChatProps) => {
  const navigate = useNavigate();
  const { data: currentUser } = useProfileMe();
  useClaimCommentsSocket(claim.id);
  const { data: comments, isLoading: commentsLoading } = useClaimComments(
    claim.id,
  );
  const { mutate: addComment, isPending: isAddingComment } = useAddClaimComment(
    claim.id,
  );
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteClaimComment(claim.id);

  const [message, setMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isClaimClosed = useMemo(
    () => claim.status === "COMPLETED" || claim.status === "REJECTED",
    [claim.status],
  );

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [message]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = message.trim();
    if (!content) return;
    addComment({ content }, { onSuccess: () => setMessage("") });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = (e.target as HTMLTextAreaElement).closest("form");
      if (form) form.requestSubmit();
    }
  };

  return (
    <div className="chat-wallpaper relative flex h-dvh flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 bg-background px-3 py-3">
        <button
          type="button"
          onClick={() => navigate("/claims")}
          className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold leading-tight text-foreground">
            {claim.title}
          </h2>
          <p className="truncate text-[11px] text-muted-foreground">
            Créée le {formatDateTime(claim.createdAt)}
          </p>
        </div>
        <StatusBadge status={claim.status} />
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Détails"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-2 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {commentsLoading && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-3/4 rounded-2xl" />
            <Skeleton className="ml-auto h-12 w-2/3 rounded-2xl" />
            <Skeleton className="h-12 w-4/5 rounded-2xl" />
          </div>
        )}
        {!commentsLoading && (!comments || comments.length === 0) && (
          <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground">
            <div className="mb-1 rounded-full bg-whatsapp/10 p-4">
              <MessageCircle className="h-7 w-7 text-whatsapp" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Aucun message pour le moment
            </p>
            <p className="max-w-xs text-xs">
              Envoyez un message au support pour démarrer la conversation.
            </p>
          </div>
        )}
        {!commentsLoading &&
          comments?.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              currentUserId={currentUser?.id}
              onDelete={deleteComment}
              isDeletingComment={isDeletingComment || isClaimClosed}
            />
          ))}
      </div>

      {/* Closed banner */}
      {isClaimClosed && (
        <div className="shrink-0 px-3 pt-2">
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-700">
              Cette réclamation est{" "}
              {claim.status === "COMPLETED" ? "complétée" : "rejetée"}. Vous ne
              pouvez plus envoyer de message.
            </p>
          </div>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 bg-background px-3 py-2.5"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            placeholder={
              isClaimClosed
                ? "Cette réclamation est fermée"
                : "Tapez votre message"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isClaimClosed || isAddingComment}
            rows={1}
            className="max-h-[140px] flex-1 resize-none rounded-2xl bg-card px-4 py-2.5 text-sm leading-snug placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-whatsapp/40 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isClaimClosed || isAddingComment || !message.trim()}
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white transition-colors hover:bg-whatsapp-dark disabled:opacity-40"
            aria-label="Envoyer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      {showInfo && (
        <ClaimInfoPanel claim={claim} onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
};
