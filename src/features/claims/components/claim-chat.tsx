import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Send,
  Trash2,
  ArrowLeft,
  Info,
  ImagePlus,
  MessageCircle,
  X,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import { useProfileMe } from "@/hooks/use-profile-me";
import {
  useClaimComments,
  useAddClaimComment,
  useDeleteClaimComment,
} from "@/hooks/use-claim-comments";
import { useClaimCommentsSocket } from "@/hooks/use-claim-comments-socket";
import type { ClaimItem, ClaimCommentItem } from "@/lib/api/claims-controller";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useUploadClaimFiles } from "@/hooks/use-upload-claim-files";
import { compressImage } from "@/lib/image-compress";
import {
  IMAGE_ACCEPT,
  MAX_CLAIM_ATTACHMENTS,
  MAX_IMAGE_BYTES,
} from "@/lib/image-upload";
import { AttachmentThumb } from "./attachment-thumb";
import { AttachmentViewer } from "./attachment-viewer";

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
  /** Lifted to the thread so one viewer serves every bubble. */
  onOpenAttachment: (url: string) => void;
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
  onOpenAttachment,
}: CommentItemProps) {
  const mine =
    comment.createdByType === "profile" && comment.profileId === currentUserId;

  // `?? []` is load-bearing: a bundle newer than the backend it talks to gets
  // comments with no such field, and `.map` on undefined blanks the thread.
  const attachments = comment.attachmentUrls ?? [];
  const hasText = comment.content.trim().length > 0;

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
          "max-w-[80%] rounded-xl text-sm text-foreground",
          // Tighter padding around a bare photo, the way WhatsApp does it —
          // a full text bubble's inset around an image reads as a gap.
          hasText ? "px-2.5 py-1.5" : "p-1",
          mine ? "rounded-br-sm bg-whatsapp-light" : "rounded-bl-sm bg-card",
        )}
      >
        {!mine && (
          <p
            className={cn(
              "text-[11px] font-semibold text-whatsapp",
              hasText ? "mb-0.5" : "mb-1 px-1.5 pt-1",
            )}
          >
            {getCommentAuthorName(comment, mine)}
          </p>
        )}

        {attachments.length > 0 && (
          <div
            className={cn(
              "grid gap-1",
              attachments.length === 1 ? "grid-cols-1" : "grid-cols-2",
              hasText && "mb-1.5",
            )}
          >
            {attachments.map((url, idx) => (
              <AttachmentThumb
                key={`${url}-${idx}`}
                url={url}
                index={idx}
                onOpen={onOpenAttachment}
                className={
                  attachments.length === 1
                    ? "aspect-auto max-h-52 w-full"
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {hasText && (
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {comment.content}
          </p>
        )}
        <p
          className={cn(
            "text-right text-[10px] leading-none text-muted-foreground",
            hasText ? "mt-0.5" : "px-1 pb-0.5 pt-1",
          )}
        >
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

/**
 * Claim metadata, as a bottom sheet.
 *
 * A drawer rather than a centred modal so it matches every other sheet in the
 * app (support, apply, cancel) and stays thumb-reachable — this opens from the
 * header of a full-height chat, where a centred card floats over nothing.
 */
function ClaimInfoPanel({
  claim,
  open,
  onOpenChange,
}: Readonly<{
  claim: ClaimItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto flex max-h-[85vh] w-full max-w-md flex-col">
          <DrawerHeader className="text-left">
            <div className="flex items-start justify-between gap-3">
              <DrawerTitle>Détails de la réclamation</DrawerTitle>
              <StatusBadge status={claim.status} />
            </div>
            <DrawerDescription>
              Créée le {formatDateTime(claim.createdAt)}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Titre
              </p>
              <p className="text-sm font-medium text-foreground">
                {claim.title}
              </p>
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
                {/* Claims accepted PDF and DOC until recently, so these rows
                    are not all images — AttachmentThumb says so instead of
                    painting a broken picture. */}
                <div className="grid grid-cols-3 gap-2">
                  {claim.attachmentUrls.map((url, idx) => (
                    <AttachmentThumb
                      key={`${url}-${idx}`}
                      url={url}
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Fermer</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
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
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutateAsync: uploadClaimFiles, isPending: isUploading } =
    useUploadClaimFiles();

  const [
    { files, errors: fileErrors },
    { removeFile, openFileDialog, getInputProps, clearFiles },
  ] = useFileUpload({
    maxFiles: MAX_CLAIM_ATTACHMENTS,
    multiple: true,
    accept: IMAGE_ACCEPT,
    maxSize: MAX_IMAGE_BYTES,
  });

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

  const isSending = isAddingComment || isUploading || isPreparing;
  // Either half is enough: a photo with no caption is the ordinary thing to
  // send in a thread, and the server accepts one.
  const canSend = message.trim().length > 0 || files.length > 0;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = message.trim();
    if (!canSend || isSending) return;

    let attachment_urls: string[] | undefined;
    if (files.length > 0) {
      setIsPreparing(true);
      try {
        // Compressed first, as the KYC step does: a phone photo is routinely
        // past the 5 MB limit, and 1920px keeps it legible.
        const compressed = await Promise.all(
          files.map((f) => compressImage(f.file)),
        );
        attachment_urls = await uploadClaimFiles(compressed);
      } catch {
        // The mutation already raised a toast; leave the draft and the picked
        // files alone so the user can retry rather than retype and re-pick.
        return;
      } finally {
        setIsPreparing(false);
      }
    }

    addComment(
      { content: content || undefined, attachment_urls },
      {
        onSuccess: () => {
          setMessage("");
          clearFiles();
        },
      },
    );
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
              onOpenAttachment={setViewerUrl}
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
        // Lifted off the bottom edge. This screen renders with `withNav={false}`,
        // so unlike everywhere else in the app there is no bottom bar between
        // the send button and the device — on a phone it sat directly against
        // the home indicator. Same `env(safe-area-inset-bottom)` the bottom nav
        // uses, plus a little air so the row does not read as cut off on a
        // handset that reports no inset at all.
        className="shrink-0 bg-background px-3 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.875rem)]"
      >
        <input {...getInputProps()} className="sr-only" />

        {/* Picked-but-unsent photos, above the input the way a phone keyboard
            shows them. Scrolls sideways so three thumbnails never push the
            text field off a small screen. */}
        {files.length > 0 && (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {files.map((f) => (
              <div
                key={f.id}
                className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted"
              >
                <img
                  src={f.preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  disabled={isSending}
                  aria-label={`Retirer ${f.file.name}`}
                  className="absolute right-0.5 top-0.5 rounded-full bg-destructive/90 p-0.5 text-white disabled:opacity-40"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {fileErrors.map((message) => (
          <p key={message} className="mb-1.5 text-xs text-destructive">
            {message}
          </p>
        ))}

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={openFileDialog}
            disabled={
              isClaimClosed ||
              isSending ||
              files.length >= MAX_CLAIM_ATTACHMENTS
            }
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            aria-label="Joindre une image"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
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
            disabled={isClaimClosed || isSending}
            rows={1}
            className="max-h-[140px] flex-1 resize-none rounded-2xl bg-card px-4 py-2.5 text-sm leading-snug placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-whatsapp/40 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isClaimClosed || isSending || !canSend}
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white transition-colors hover:bg-whatsapp-dark disabled:opacity-40"
            aria-label="Envoyer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      <ClaimInfoPanel
        claim={claim}
        open={showInfo}
        onOpenChange={setShowInfo}
      />

      {/* One instance for the whole thread, mounted outside the message list
          so re-rendering a bubble cannot close it. */}
      <AttachmentViewer
        url={viewerUrl}
        onOpenChange={(open) => !open && setViewerUrl(null)}
      />
    </div>
  );
};
