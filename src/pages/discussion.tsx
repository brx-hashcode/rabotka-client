import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Lock, ShieldCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { discussionsContent } from "@/content/discussions";
import { MessageBubble } from "@/features/discussions/components/message-bubble";
import {
  useDiscussionThread,
  useDiscussions,
  useDiscussionsSocket,
  useMarkDiscussionRead,
  useReportRedaction,
  useSendMessage,
} from "@/hooks/use-discussions";

/** Matches the server's DTO bound, so the counter and the 400 agree. */
const MAX_LENGTH = 2000;

export default function Discussion() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [reported, setReported] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useDiscussionThread(id);
  const { data: list } = useDiscussions();
  const send = useSendMessage(id);
  const markRead = useMarkDiscussionRead();
  const report = useReportRedaction();
  useDiscussionsSocket(true);

  const content = discussionsContent.thread;
  const warning = discussionsContent.warning;

  const discussion = list?.data.find((d) => d.id === id);

  // The API returns newest-first for pagination; a thread reads oldest-first.
  const messages = useMemo(
    () => [...(data?.data ?? [])].reverse(),
    [data?.data],
  );

  /**
   * Which message carries the "this is a rule, not a bug" line.
   *
   * The FIRST hole the other party sent, and only that one. Repeating it under
   * every masked message turns an explanation into wallpaper.
   */
  const firstRedactedFromOther = useMemo(
    () => messages.find((m) => !m.mine && m.status === "REDACTED")?.id ?? null,
    [messages],
  );

  useEffect(() => {
    if (id) markRead.mutate(id);
    // Once per thread opening. `markRead` is a stable mutation object but
    // including it would re-fire on every render it produces.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const closed = discussion?.closed ?? false;
  const unlocked = discussion?.contactsUnlocked ?? false;

  const submit = () => {
    const body = draft.trim();
    if (!body || send.isPending) return;
    send.mutate(body, {
      onSuccess: ({ message }) => {
        setDraft("");
        // Said plainly rather than left to the strike-through alone: the author
        // needs to know the message did not arrive whole before they wait for
        // a reply that is never coming.
        if (message.status === "HELD") toast.error(warning.held);
      },
      onError: () => toast.error("Le message n’a pas pu être envoyé"),
    });
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="shrink-0 bg-card px-4 py-3 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Retour"
            onClick={() => navigate("/discussions")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {discussion?.counterpartName ?? "Discussion"}
            </p>
            {discussion?.jobTitle && (
              <p className="truncate text-xs text-muted-foreground">
                {discussion.jobTitle}
              </p>
            )}
          </div>

          {/* The primary action of the screen, permanently in reach. It routes
              into the EXISTING unlock flow — this is a link, not a second
              payment path. */}
          {unlocked ? (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-whatsapp/10 px-2 py-1 text-[11px] font-medium text-whatsapp-dark">
              <ShieldCheck className="h-3.5 w-3.5" />
              {content.unlocked}
            </span>
          ) : (
            discussion?.applicationId && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/applications/${discussion.applicationId}`)
                }
                className="flex shrink-0 items-center gap-1 rounded-md bg-whatsapp px-2.5 py-1.5 text-[11px] font-semibold text-white"
              >
                <Lock className="h-3.5 w-3.5" />
                {content.unlockCta}
              </button>
            )
          )}
        </div>

        {/* The standing rule. Present before the first attempt, not after it —
            a redaction nobody was warned about reads as a broken app, and the
            next move is to try another way. */}
        {!unlocked && (
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            {warning.header}
          </p>
        )}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {isLoading && (
          <>
            <Skeleton className="h-12 w-3/4 rounded-lg" />
            <Skeleton className="ml-auto h-12 w-2/3 rounded-lg" />
          </>
        )}

        {!isLoading && messages.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {content.empty}
          </p>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            showRecipientNotice={message.id === firstRedactedFromOther}
            reported={reported.includes(message.id)}
            onReport={(messageId) =>
              report.mutate(
                { messageId },
                {
                  onSuccess: () => {
                    setReported((ids) => [...ids, messageId]);
                    toast.success(warning.reportDone);
                  },
                },
              )
            }
          />
        ))}

        <div ref={bottomRef} />
      </div>

      <footer className="shrink-0 bg-card px-4 py-3 shadow-soft">
        {closed ? (
          <p className="text-center text-sm text-muted-foreground">
            {content.closed}
          </p>
        ) : (
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
              placeholder={content.placeholder}
              rows={1}
              className="max-h-32 min-h-10 resize-none"
              onKeyDown={(e) => {
                // Enter sends, Shift+Enter breaks the line — the shape people
                // already have in their fingers from WhatsApp.
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            <button
              type="button"
              aria-label={content.send}
              onClick={submit}
              disabled={!draft.trim() || send.isPending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-whatsapp text-white disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
