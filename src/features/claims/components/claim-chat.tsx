import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Send, Trash2, ArrowLeft } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useProfileMe } from "@/hooks/use-profile-me";
import {
  useClaimComments,
  useAddClaimComment,
  useDeleteClaimComment,
} from "@/hooks/use-claim-comments";
import type { ClaimItem, ClaimCommentItem } from "@/lib/api/claims-controller";

const getStatusColor = (status: string) => {
  return cn(
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
    {
      "bg-yellow-100 text-yellow-800": status === "CREATED",
      "bg-blue-100 text-blue-800": status === "IN_PROGRESS",
      "bg-green-100 text-green-800": status === "COMPLETED",
      "bg-red-100 text-red-800": status === "REJECTED",
    },
  );
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    CREATED: "Créée",
    IN_PROGRESS: "En Cours",
    COMPLETED: "Complétée",
    REJECTED: "Rejetée",
  };
  return labels[status] || status;
};

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
  if (isFromCurrentProfile) {
    return "Vous";
  }
  if (comment.createdByType === "profile") {
    return comment.profileName || "Profile";
  }
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
        "flex gap-2 items-start",
        isFromCurrentProfile && "flex-row-reverse",
      )}
    >
      {isFromCurrentProfile && (
        <button
          onClick={() => onDelete(comment.id)}
          disabled={isDeletingComment}
          className="shrink-0 flex items-center justify-center h-6 w-6 rounded text-red-600 hover:bg-red-100 disabled:opacity-50 mt-1"
          title="Delete comment"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <div
        className={cn(
          "flex-1 max-w-xs px-4 py-2 rounded-lg border",
          isFromCurrentProfile
            ? "bg-green-50 border-green-200 text-gray-900"
            : "bg-gray-50 border-gray-200 text-gray-900",
        )}
      >
        <p className="text-xs font-semibold mb-1">
          {getCommentAuthorName(comment, isFromCurrentProfile)}
        </p>
        <p className="text-sm mb-1">{comment.content}</p>
        <p className="text-xs text-gray-500">
          {formatDateTime(comment.createdAt)}
        </p>
      </div>
    </div>
  );
}

export const ClaimChat = ({ claim }: ClaimChatProps) => {
  const navigate = useNavigate();
  const { data: currentUser } = useProfileMe();
  const { data: comments, isLoading: commentsLoading } = useClaimComments(
    claim.id,
  );
  const { mutate: addComment, isPending: isAddingComment } = useAddClaimComment(
    claim.id,
  );
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteClaimComment(claim.id);

  const [message, setMessage] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const MAX_DESCRIPTION_LENGTH = 150;
  const isDescriptionTruncated =
    claim.description.length > MAX_DESCRIPTION_LENGTH;

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) return;

    addComment(
      { content: message.trim() },
      {
        onSuccess: () => {
          setMessage("");
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      const form = (e.target as HTMLTextAreaElement).closest("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  const isClaimClosed = useMemo(() => {
    return claim.status === "COMPLETED" || claim.status === "REJECTED";
  }, [claim.status]);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  size="icon"
                  onClick={() => navigate("/claims")}
                  className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <span className={cn("text-sm font-medium", getStatusColor(claim.status))}>
                  {getStatusLabel(claim.status)}
                </span>
              </div>
              <h2 className="md:text-2xl text-lg font-medium">{claim.title}</h2>
            </div>
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isDescriptionExpanded || !isDescriptionTruncated
                  ? claim.description
                  : claim.description.slice(0, MAX_DESCRIPTION_LENGTH) + "..."}
              </p>
              {isDescriptionTruncated && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="text-xs text-green-600 hover:text-green-700 font-medium mt-2"
                >
                  {isDescriptionExpanded ? "Voir moins" : "Voir plus"}
                </button>
              )}
            </div>
          </div>
        </div>

        {claim.attachmentUrls.length > 0 && (
          <div className="pt-4">
            <p className="text-sm font-medium mb-3">Pièces Jointes</p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {claim.attachmentUrls.map((url, idx) => (
                <a
                  key={`${url}-${idx}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img
                    src={url}
                    alt={`Pièce jointe ${idx}`}
                    className="h-16 w-full md:h-24 object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground pt-4">
          Créée {formatDateTime(claim.createdAt)}
        </p>
      </Card>

      <Card className="p-6 min-h-96 flex flex-col">
        <div
          ref={messagesContainerRef}
          className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-72 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {commentsLoading && (
            <div className="space-y-3">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-12 w-4/5" />
            </div>
          )}
          {!commentsLoading && (!comments || comments.length === 0) && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Aucun message pour le moment. Commencez la conversation!</p>
            </div>
          )}
          {!commentsLoading && comments && comments.length > 0 && (
            <>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUser?.id}
                  onDelete={deleteComment}
                  isDeletingComment={isDeletingComment || isClaimClosed}
                />
              ))}
            </>
          )}
        </div>

        {isClaimClosed && (
          <div className="mb-4 flex gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              Cette réclamation est{" "}
              {claim.status === "COMPLETED" ? "complétée" : "rejetée"}. Vous ne
              pouvez plus commenter.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t pt-4">
          <div className="flex items-end gap-2 rounded-lg border bg-white px-3 py-2">
            <Textarea
              placeholder={
                isClaimClosed
                  ? "Cette réclamation est fermée"
                  : "Tapez votre message... (Ctrl+Entrée pour envoyer)"
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isClaimClosed || isAddingComment}
              className="resize-none placeholder:text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 min-h-[80px] p-1 text-sm placeholder:text-gray-400"
            />
            <Button
              type="submit"
              disabled={isClaimClosed || isAddingComment || !message.trim()}
              className="shrink-0  bg-green-500 hover:bg-green-600 text-white"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
