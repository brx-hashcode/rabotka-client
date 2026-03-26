import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Send } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useClaimComments, useAddClaimComment } from "@/hooks/use-claim-comments";
import type { ClaimItem, ClaimCommentItem } from "@/lib/api/claims-controller";

const getStatusColor = (status: string) => {
  return cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", {
    "bg-yellow-100 text-yellow-800": status === "CREATED",
    "bg-blue-100 text-blue-800": status === "IN_PROGRESS",
    "bg-green-100 text-green-800": status === "COMPLETED",
    "bg-red-100 text-red-800": status === "REJECTED",
  });
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

export const ClaimChat = ({ claim }: ClaimChatProps) => {
  const { data: currentUser } = useProfileMe();
  const { data: comments, isLoading: commentsLoading } = useClaimComments(
    claim.id,
  );
  const { mutate: addComment, isPending: isAddingComment } = useAddClaimComment(
    claim.id,
  );

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    addComment({ content: message.trim() }, {
      onSuccess: () => {
        setMessage("");
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const isClaimClosed = claim.status === "COMPLETED" || claim.status === "REJECTED";

  return (
    <div className="space-y-4">
      {/* Claim Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{claim.title}</h2>
            <p className="text-muted-foreground">{claim.description}</p>
          </div>
          <span className={getStatusColor(claim.status)}>
            {getStatusLabel(claim.status)}
          </span>
        </div>

        {claim.attachmentUrls.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Pièces Jointes</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {claim.attachmentUrls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img
                    src={url}
                    alt={`Pièce jointe ${idx}`}
                    className="w-full h-24 object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground pt-4 border-t">
          Créée {formatDateTime(claim.createdAt)}
        </p>
      </Card>

      {/* Messages */}
      <Card className="p-6 min-h-96 flex flex-col">
        <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-72">
          {commentsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-12 w-4/5" />
            </div>
          ) : !comments || comments.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Aucun message pour le moment. Commencez la conversation!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isFromUser = comment.profileId === currentUser?.id;
              return (
                <div
                  key={comment.id}
                  className={cn("flex gap-3", isFromUser && "flex-row-reverse")}
                >
                  <div
                    className={cn(
                      "flex-1 max-w-xs",
                      isFromUser
                        ? "bg-blue-100 text-blue-950 rounded-lg rounded-tr-none p-3"
                        : "bg-gray-100 text-gray-950 rounded-lg rounded-tl-none p-3",
                    )}
                  >
                    <p className="text-xs font-medium mb-1">
                      {isFromUser ? "Vous" : comment.profileName || "Support"}
                    </p>
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDateTime(comment.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {isClaimClosed && (
          <div className="mb-4 flex gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              Cette réclamation est {claim.status === "COMPLETED" ? "complétée" : "rejetée"}. Vous ne pouvez plus commenter.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
          <Textarea
            placeholder={isClaimClosed ? "Cette réclamation est fermée" : "Tapez votre message... (Ctrl+Entrée pour envoyer)"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isClaimClosed || isAddingComment}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isClaimClosed || isAddingComment || !message.trim()}
              className="flex-1"
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {isAddingComment ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
