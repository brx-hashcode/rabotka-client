import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Send,
  Trash2,
  ArrowLeft,
  Download,
  ImageIcon,
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

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
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

function StatusBadge({ status }: { status: string }) {
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
  if (comment.createdByType === "profile") return comment.profileName || "Profile";
  return "Support";
}

function CommentItem({
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
        "flex gap-2 items-end",
        isFromCurrentProfile ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
          isFromCurrentProfile
            ? "bg-whatsapp/15 text-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        <p className="text-[11px] font-semibold mb-1 text-muted-foreground">
          {getCommentAuthorName(comment, isFromCurrentProfile)}
        </p>
        <p className="leading-relaxed">{comment.content}</p>
        <p className="text-[10px] text-muted-foreground mt-1 text-right">
          {formatDateTime(comment.createdAt)}
        </p>
      </div>
      {isFromCurrentProfile && (
        <button
          onClick={() => onDelete(comment.id)}
          disabled={isDeletingComment}
          className="shrink-0 mb-1 flex items-center justify-center h-6 w-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export const ClaimChat = ({ claim }: ClaimChatProps) => {
  const navigate = useNavigate();
  const { data: currentUser } = useProfileMe();
  useClaimCommentsSocket(claim.id);
  const { data: comments, isLoading: commentsLoading } = useClaimComments(claim.id);
  const { mutate: addComment, isPending: isAddingComment } = useAddClaimComment(claim.id);
  const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteClaimComment(claim.id);

  const [message, setMessage] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const MAX_DESCRIPTION_LENGTH = 120;
  const isDescriptionTruncated = claim.description.length > MAX_DESCRIPTION_LENGTH;

  const isClaimClosed = useMemo(
    () => claim.status === "COMPLETED" || claim.status === "REJECTED",
    [claim.status],
  );

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => { scrollToBottom(); }, [comments]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;
    addComment({ content: message.trim() }, { onSuccess: () => setMessage("") });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      const form = (e.target as HTMLTextAreaElement).closest("form");
      if (form) form.dispatchEvent(new Event("submit", { bubbles: true }));
    }
  };

  return (
    <div className="flex flex-col gap-0 rounded-2xl border border-border overflow-hidden bg-card shadow-sm">

      {/* ── Sticky top bar ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card">
        <button
          type="button"
          onClick={() => navigate("/claims")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <StatusBadge status={claim.status} />
      </div>

      {/* ── Claim header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-border space-y-3">
        <h2 className="text-lg font-semibold text-foreground leading-snug">
          {claim.title}
        </h2>

        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isDescriptionExpanded || !isDescriptionTruncated
              ? claim.description
              : claim.description.slice(0, MAX_DESCRIPTION_LENGTH) + "…"}
          </p>
          {isDescriptionTruncated && (
            <button
              onClick={() => setIsDescriptionExpanded((v) => !v)}
              className="text-xs text-whatsapp hover:underline font-medium mt-1"
            >
              {isDescriptionExpanded ? "Voir moins" : "Voir plus"}
            </button>
          )}
        </div>

        {claim.attachmentUrls.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pièces jointes
            </p>
            <div className="flex flex-wrap gap-2">
              {claim.attachmentUrls.map((url, idx) => (
                <a
                  key={`${url}-${idx}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative h-20 w-20 rounded-xl border border-border overflow-hidden bg-muted hover:shadow-md transition-shadow"
                >
                  <img
                    src={url}
                    alt={`Pièce jointe ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                    <Download className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 [img+&]:opacity-0">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
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

      {/* ── Chat messages ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-64 max-h-96 overflow-y-auto px-4 py-4 space-y-3"
        style={{ scrollbarWidth: "none" }}
      >
        {commentsLoading && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-2/3 ml-auto" />
            <Skeleton className="h-12 w-4/5" />
          </div>
        )}
        {!commentsLoading && (!comments || comments.length === 0) && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
            <p className="text-sm">Aucun message pour le moment.</p>
            <p className="text-xs">Commencez la conversation !</p>
          </div>
        )}
        {!commentsLoading && comments && comments.length > 0 &&
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUser?.id}
              onDelete={deleteComment}
              isDeletingComment={isDeletingComment || isClaimClosed}
            />
          ))
        }
      </div>

      {/* ── Closed banner ── */}
      {isClaimClosed && (
        <div className="mx-4 mb-3 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Cette réclamation est{" "}
            {claim.status === "COMPLETED" ? "complétée" : "rejetée"}. Vous ne
            pouvez plus commenter.
          </p>
        </div>
      )}

      {/* ── Input bar ── */}
      <form
        onSubmit={handleSubmit}
        className="px-4 pb-4"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-whatsapp/30 transition-shadow">
          <Textarea
            placeholder={
              isClaimClosed
                ? "Cette réclamation est fermée"
                : "Tapez votre message… (Ctrl+Entrée pour envoyer)"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isClaimClosed || isAddingComment}
            className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 min-h-[60px] p-1 text-sm placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={isClaimClosed || isAddingComment || !message.trim()}
            className="shrink-0 mb-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-whatsapp text-white disabled:opacity-40 hover:bg-whatsapp/90 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
