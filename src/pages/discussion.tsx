import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { discussionsContent } from "@/content/discussions";
import { MessageBubble } from "@/features/discussions/components/message-bubble";
import { CounterpartAvatar } from "@/features/discussions/components/counterpart-avatar";
import { tapFeedback } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type {
  Discussion as DiscussionSummary,
  DiscussionMessage,
} from "@/lib/api/discussions-controller";
import { useProfileMe } from "@/hooks/use-profile-me";
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

/**
 * Where "Débloquer" leads, or null when there is nothing this viewer can pay.
 *
 * Depends on the ROLE, which the first version ignored and so sent employers to
 * the worker's route:
 * - through an application, each side unlocks from its own view of it —
 *   `/applications/:id` for the worker, `/candidatures/:id` for the employer;
 * - in a direct conversation there is no application, and the only unlock is
 *   the recommendation contact, which the EMPLOYER pays alone. A worker there
 *   has nothing to pay, so no button rather than one that leads nowhere.
 */
function unlockPath(
  discussion: DiscussionSummary,
  isEmployer: boolean,
): string | null {
  if (discussion.applicationId) {
    return isEmployer
      ? `/candidatures/${discussion.applicationId}`
      : `/applications/${discussion.applicationId}`;
  }
  return isEmployer ? `/recommandations/${discussion.counterpartId}` : null;
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** "Aujourd'hui", "Hier", then a date — the separators WhatsApp draws. */
function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dayKey(iso) === dayKey(today.toISOString())) return "Aujourd’hui";
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return "Hier";
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

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
  const { data: me } = useProfileMe();
  const unlockTo = discussion
    ? unlockPath(discussion, me?.profileType === "EMPLOYER")
    : null;

  // The API returns newest-first for pagination; a thread reads oldest-first.
  const messages = useMemo<DiscussionMessage[]>(
    () => [...(data?.data ?? [])].reverse(),
    [data?.data],
  );

  /**
   * The FIRST hole the other party sent carries the "this is a rule, not a
   * bug" line, and only that one. Repeating it under every masked message
   * turns an explanation into wallpaper.
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
  const name = discussion?.counterpartName ?? "Discussion";

  const submit = () => {
    const body = draft.trim();
    if (!body || send.isPending) return;
    tapFeedback();
    send.mutate(body, {
      onSuccess: ({ message }) => {
        setDraft("");
        // Said plainly rather than left to the strike-through alone: the author
        // needs to know the message did not arrive whole before they wait for a
        // reply that is never coming.
        if (message.status === "HELD") toast.error(warning.held);
      },
      onError: () => toast.error("Le message n’a pas pu être envoyé"),
    });
  };

  return (
    <div className="flex h-dvh flex-col">
      {/* ── Header: who you are talking to, and whether they are there. ── */}
      <header className="z-10 flex shrink-0 items-center gap-2 bg-card px-2 py-2 shadow-soft">
        <button
          type="button"
          aria-label="Retour"
          onClick={() => navigate("/discussions")}
          className="flex h-10 w-9 shrink-0 items-center justify-center rounded-md active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <CounterpartAvatar
          name={name}
          avatarUrl={discussion?.counterpartAvatarUrl ?? null}
          online={discussion?.counterpartOnline ?? false}
          className="h-10 w-10"
        />

        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate text-[15px] font-semibold leading-tight">{name}</p>
          {/* "en ligne" when connected, the job otherwise. Never "hors ligne":
              the server fails closed, so false also means "could not tell", and
              saying offline would claim a certainty nobody has. There is no
              "vu à" either — last-seen is a privacy setting everywhere it
              exists, and that decision has not been made here. */}
          <p
            className={cn(
              "truncate text-xs leading-tight",
              discussion?.counterpartOnline ? "text-whatsapp" : "text-muted-foreground",
            )}
          >
            {discussion?.counterpartOnline ? "en ligne" : (discussion?.jobTitle ?? "")}
          </p>
        </div>

        {/* The primary action of the screen, and it STAYS even once contacts
            are unlocked. Unlocking is not a one-off: an employer pays again for
            each new mission, or for a recommendation contact, and swapping the
            button for a "débloquées" badge cut that path off. It routes into
            the EXISTING flow — a link, not a second payment path. See
            `unlockPath` for where, by role. */}
        {unlockTo && (
          <button
            type="button"
            onClick={() => navigate(unlockTo)}
            aria-label={content.unlockCta}
            className="flex shrink-0 items-center gap-1 rounded-full bg-linear-to-b from-whatsapp to-whatsapp-dark px-3 py-1.5 text-[11px] font-semibold text-white shadow-nav-selected inset-shadow-[0_1px_rgb(255_255_255/0.18)] transition active:translate-y-px active:shadow-none motion-reduce:transition-none"
          >
            <Lock className="h-3.5 w-3.5" />
            Débloquer
          </button>
        )}
      </header>

      {/* ── Thread, on the wallpaper. ── */}
      <div className="chat-wallpaper flex-1 overflow-y-auto px-3 pb-2 pt-3">
        {/* The standing rule, as a system notice at the head of the thread —
            the same place and shape WhatsApp uses for its encryption notice,
            so it reads as part of the conversation's ground rules rather than
            as an ad in the header. Known before the first attempt; the notice
            under a withheld fragment carries the rest. */}
        {!unlocked && (
          <div className="mx-auto mb-3 flex max-w-[88%] items-start gap-1.5 rounded-lg bg-chat-notice px-3 py-2 text-center text-[12px] leading-snug text-chat-notice-foreground shadow-[0_1px_0.5px_rgb(0_0_0/0.1)]">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{warning.header}</span>
          </div>
        )}

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-3/5 rounded-lg" />
            <Skeleton className="ml-auto h-10 w-1/2 rounded-lg" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <p className="mx-auto mt-6 w-fit rounded-lg bg-chat-bubble-in px-3 py-1.5 text-xs text-muted-foreground shadow-[0_1px_0.5px_rgb(0_0_0/0.1)]">
            {content.empty}
          </p>
        )}

        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
          const firstOfGroup = newDay || previous.senderId !== message.senderId;

          return (
            <Fragment key={message.id}>
              {newDay && (
                <div className="my-3 flex justify-center">
                  <span className="rounded-md bg-chat-bubble-in px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-[0_1px_0.5px_rgb(0_0_0/0.1)]">
                    {dayLabel(message.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={message}
                firstOfGroup={firstOfGroup}
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
            </Fragment>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── Composer: a pill and a round send button, on the wallpaper. ── */}
      <footer className="chat-wallpaper shrink-0 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-1">
        {closed ? (
          <p className="mx-auto w-fit rounded-lg bg-chat-bubble-in px-3 py-2 text-center text-xs text-muted-foreground shadow-[0_1px_0.5px_rgb(0_0_0/0.1)]">
            {content.closed}
          </p>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
              placeholder={content.placeholder}
              rows={1}
              // Grows with the text up to about five lines, then scrolls —
              // `field-sizing` does it natively where supported, and the
              // max-height is the ceiling everywhere else.
              className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl bg-card px-4 py-2.5 text-[15px] leading-snug shadow-[0_1px_0.5px_rgb(0_0_0/0.13)] outline-none field-sizing-content placeholder:text-muted-foreground"
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
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_1px_0.5px_rgb(0_0_0/0.13)] transition active:scale-90 disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <Send className="h-5 w-5 -translate-x-px translate-y-px" strokeWidth={1.75} />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
