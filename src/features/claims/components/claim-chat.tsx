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
import { ChatDoodleBg } from "./chat-doodle-bg";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  CREATED: {
    label: "Créée",
    className: "bg-yellow-100 text-yellow-800",
  },
  IN_PROGRESS: {
    label: "En cours",
    className: "bg-blue-100 text-blue-800",
  },
  COMPLETED: {
    label: "Complétée",
    className: "bg-green-100 text-green-800",
  },
  REJECTED: {
    label: "Rejetée",
    className: "bg-red-100 text-red-800",
  },
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
  const isFromCurrentProfile =
    comment.createdByType === "profile" && comment.profileId === currentUserId;

  return (
    <div
      className={cn(
        "flex gap-2 items-end group",
        isFromCurrentProfile ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "max-w-[78%] rounded-lg px-3 py-2 text-sm",
          isFromCurrentProfile
            ? "bg-[#dcf8c6] text-foreground rounded-br-sm"
            : "bg-white text-foreground rounded-bl-sm",
        )}
      >
        {!isFromCurrentProfile && (
          <p className="text-[11px] font-semibold mb-0.5 text-whatsapp">
            {getCommentAuthorName(comment, isFromCurrentProfile)}
          </p>
        )}
        <p className="leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>
        <p className="text-[10px] mt-1 text-right text-muted-foreground">
          {formatDateTime(comment.createdAt)}
        </p>
      </div>
      {isFromCurrentProfile && (
        <button
          onClick={() => onDelete(comment.id)}
          disabled={isDeletingComment}
          className="shrink-0 mb-1 hidden group-hover:flex items-center justify-center h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
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
    <div
      className="absolute inset-0 z-20 bg-black/40 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl max-h-[80%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Détails de la réclamation</h3>
          <StatusBadge status={claim.status} />
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Titre
            </p>
            <p className="text-sm font-medium">{claim.title}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Description
            </p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {claim.description}
            </p>
          </div>
          {claim.attachmentUrls.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Pièces jointes ({claim.attachmentUrls.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {claim.attachmentUrls.map((url, idx) => (
                  <a
                    key={`${url}-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-lg border border-border overflow-hidden bg-muted hover:shadow-md transition-shadow"
                  >
                    <img
                      src={url}
                      alt={`Pièce jointe ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                      <Download className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">
              Créée le {formatDateTime(claim.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
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

  // Auto-grow textarea up to ~5 lines.
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
    <div className="relative flex flex-col bg-[#efeae2] h-[calc(100dvh-6rem)] lg:h-[calc(100dvh-7rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-white border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate("/claims")}
            className="shrink-0 p-1.5 -ml-1.5 rounded-full hover:bg-muted text-foreground transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground truncate leading-tight">
              {claim.title}
            </h2>
            <p className="text-[11px] text-muted-foreground truncate">
              Créée le {formatDateTime(claim.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={claim.status} />
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Détails"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 min-h-0 overflow-hidden text-foreground">
      <ChatDoodleBg />
      <div
        ref={messagesContainerRef}
        className="absolute inset-0 overflow-y-auto px-3 sm:px-5 py-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {commentsLoading && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-3/4 rounded-2xl" />
            <Skeleton className="h-12 w-2/3 ml-auto rounded-2xl" />
            <Skeleton className="h-12 w-4/5 rounded-2xl" />
          </div>
        )}
        {!commentsLoading && (!comments || comments.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full min-h-64 gap-2 text-muted-foreground text-center px-4">
            <div className="bg-white rounded-full p-4 shadow-sm">
              <Send className="h-6 w-6 text-whatsapp" />
            </div>
            <p className="text-sm font-medium">Aucun message pour le moment.</p>
            <p className="text-xs">
              Envoyez un message au support pour démarrer la conversation.
            </p>
          </div>
        )}
        {!commentsLoading &&
          comments &&
          comments.length > 0 &&
          comments.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              currentUserId={currentUser?.id}
              onDelete={deleteComment}
              isDeletingComment={isDeletingComment || isClaimClosed}
            />
          ))}
      </div>
      </div>

      {/* Closed banner */}
      {isClaimClosed && (
        <div className="px-3 sm:px-4 pt-2 shrink-0">
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
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
        className="shrink-0 bg-white border-t border-border px-2 sm:px-3 py-2"
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
            className="flex-1 resize-none rounded-2xl bg-muted/60 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-whatsapp/40 disabled:opacity-60 max-h-[140px] leading-snug"
          />
          <button
            type="submit"
            disabled={isClaimClosed || isAddingComment || !message.trim()}
            className="shrink-0 mb-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-whatsapp text-white disabled:opacity-40 hover:bg-whatsapp/90 transition-colors shadow-sm"
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
