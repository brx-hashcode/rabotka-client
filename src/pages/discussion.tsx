import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { discussionsContent } from "@/content/discussions";
import { MessageBubble } from "@/features/discussions/components/message-bubble";
import { mergeThread } from "@/features/discussions/merge-thread";
import { CounterpartAvatar } from "@/features/discussions/components/counterpart-avatar";
import { serverMessage } from "@/lib/api/errors";
import { tapFeedback } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { DiscussionMessage } from "@/lib/api/discussions-controller";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useWorkerUnlock } from "@/hooks/use-worker-unlock";
import { ContactConfirmDrawer } from "@/features/employer/components/contact-confirm-drawer";
import { WorkerUnlockDrawer } from "@/features/discussions/components/worker-unlock-drawer";
import {
  useDiscussion,
  useDiscussionHistory,
  useDiscussionThread,
  useDiscussionsSocket,
  useMarkDiscussionRead,
  useReportRedaction,
  useSendMessage,
} from "@/hooks/use-discussions";

/** Matches the server's DTO bound, so the counter and the 400 agree. */
const MAX_LENGTH = 2000;

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
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * History is loaded on demand, never on opening: a thread reads from where it
   * was left, and paying for four pages nobody scrolled back to is the kind of
   * request this audience pays for by the megabyte.
   */
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data, isLoading } = useDiscussionThread(id);
  const history = useDiscussionHistory(id, historyOpen);
  const { data: discussion } = useDiscussion(id);
  const send = useSendMessage(id);
  const markRead = useMarkDiscussionRead();
  const report = useReportRedaction();
  useDiscussionsSocket(true);

  const content = discussionsContent.thread;
  const warning = discussionsContent.warning;

  const { data: me } = useProfileMe();
  const location = useLocation();
  const isEmployer = me?.profileType === "EMPLOYER";
  const [unlockOpen, setUnlockOpen] = useState(false);

  /**
   * "Débloquer" opens a SHEET, never a page — the fee and the rules are shown
   * before the tap that costs money, not after a navigation.
   *
   * EMPLOYER: always. The contact sheet, for this worker — the same one the
   * recommended-profile card opens, and it works for any worker, not only
   * recommended ones (the detail endpoint skips eligibility). An employer may
   * unlock as many times as they like: one mission, another, a recommendation.
   *
   * WORKER: only when the thread is about a job AND their share is actually
   * owed. The worker never pays to contact an employer out of the blue — their
   * only unlock is their share of a mission, which exists once the employer
   * has accepted them. Anything else was a button leading to a page with
   * nothing to pay.
   */
  const workerUnlockQuery = useWorkerUnlock(
    !isEmployer && discussion?.applicationId ? discussion.applicationId : undefined,
  );
  const workerUnlock = workerUnlockQuery.data?.unlock ?? null;
  const workerOwes = Boolean(workerUnlock && !workerUnlock.workerPaid);
  const showUnlock = isEmployer ? Boolean(discussion) : workerOwes;

  /**
   * Back goes where the person came FROM — a job card, a candidate, the bell —
   * not always to the list. `location.key` is "default" only for the first
   * entry of the session: a thread opened from a WhatsApp nudge or a pasted
   * link has nothing behind it, and going back there would leave the app, so
   * that case falls back to the conversation list.
   */
  const goBack = () =>
    location.key === "default" ? navigate("/discussions") : navigate(-1);

  // The live page and whatever history has been opened, as one thread. The API
  // returns newest-first for pagination; a thread reads oldest-first.
  const messages = useMemo<DiscussionMessage[]>(
    () =>
      mergeThread(
        (history.data?.pages ?? []).map((page) => page.data),
        data?.data ?? [],
      ),
    [data?.data, history.data],
  );

  /**
   * Before history is open, `total` — every message this side may see, loaded
   * or not — answers it. Once it is open, the query does.
   *
   * Not `messages.length < total` throughout: duplicates across pages mean the
   * merged thread can stay short of `total` with no page left to ask for, and
   * that left a button that did nothing.
   */
  const hasOlder = historyOpen
    ? Boolean(history.hasNextPage)
    : messages.length < (data?.total ?? 0);
  const loadingOlder = history.isFetching;

  /**
   * Older messages are PREPENDED, so without an anchor the thread jumps: the
   * content above the viewport grows and what the person was reading slides
   * down the screen. Measured from the BOTTOM, which is the edge that does not
   * move, and restored in a layout effect — before the browser paints, so no
   * jump is ever visible.
   */
  const anchor = useRef<number | null>(null);

  const loadOlder = () => {
    if (loadingOlder) return;
    const el = scrollRef.current;
    anchor.current = el ? el.scrollHeight - el.scrollTop : null;
    tapFeedback();
    // The first tap turns the query on, which fetches page 2 by itself; every
    // tap after that asks for the next one.
    if (!historyOpen) setHistoryOpen(true);
    else void history.fetchNextPage();
  };

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || anchor.current === null) return;
    el.scrollTop = el.scrollHeight - anchor.current;
    anchor.current = null;
  }, [messages]);

  /**
   * The FIRST hole the other party sent carries the "this is a rule, not a
   * bug" line, and only that one. Repeating it under every masked message
   * turns an explanation into wallpaper.
   */
  const firstRedactedFromOther = useMemo(
    () => messages.find((m) => !m.mine && m.status === "REDACTED")?.id ?? null,
    [messages],
  );

  /**
   * The newest message from the other party that this profile has not read yet,
   * or null when there is nothing to mark.
   *
   * `readAt` on an INCOMING message is the moment this reader read it — the
   * server sets it in markRead for every message they did not send — so the
   * last incoming one answers for the whole thread: markRead clears them all at
   * once, and an earlier unread message behind a read one cannot exist.
   */
  const unreadFromOther = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.mine) continue;
      return message.readAt === null ? message.id : null;
    }
    return null;
  }, [messages]);

  /**
   * Marked read on opening AND on arrival, not once per opening.
   *
   * Keyed on `id` alone, this fired once and never again: a message that landed
   * while the thread was open was fetched and displayed but stayed unread, so
   * the tab badge went on counting a conversation being read right then, and
   * the sender's second tick waited for the reader to leave and come back.
   *
   * No loop: markRead does not invalidate the thread, so `unreadFromOther` holds
   * its value until the thread refetches — at which point `readAt` is set and
   * this settles on null.
   */
  useEffect(() => {
    if (id && unreadFromOther) markRead.mutate(id);
    // `markRead` is a stable mutation object, but including it would re-fire on
    // every render it produces.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, unreadFromOther]);

  const last = messages[messages.length - 1];
  const lastMessageId = last?.id ?? null;

  /**
   * Reset when the route moves to another thread: react-router keeps this
   * component mounted across a param change, so without this the next thread
   * opens with the previous one's history already expanding and no jump to the
   * bottom.
   */
  const opened = useRef(false);
  useEffect(() => {
    opened.current = false;
    anchor.current = null;
    setHistoryOpen(false);
  }, [id]);

  /**
   * Keyed on the NEWEST message, not on how many there are: loading older ones
   * changes the count too, and scrolling to the bottom is the opposite of what
   * somebody who just asked for history wants.
   *
   * On opening, jump. After that, follow only when the person is already at the
   * bottom — or when the new message is theirs, since sending is a request to
   * see it land. Yanking somebody out of the history they scrolled back to is
   * how a thread loses an address they were re-reading.
   */
  useEffect(() => {
    if (!lastMessageId) return;

    if (!opened.current) {
      opened.current = true;
      bottomRef.current?.scrollIntoView();
      return;
    }

    const el = scrollRef.current;
    const nearBottom = el
      ? el.scrollHeight - el.scrollTop - el.clientHeight < 120
      : true;
    if (nearBottom || last?.mine) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // `last` is only read for `mine`, which is fixed for a given id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessageId]);

  const closed = discussion?.closed ?? false;
  // Empty rather than a placeholder word: the header shows a skeleton until
  // the counterpart is known, instead of "Discussion" and a "D" avatar.
  const name = discussion?.counterpartName ?? "";

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
      // The server's own words when it has any — the refusal that matters here
      // is « Cette discussion est close », which staff can trigger at any
      // moment. A generic failure would have the person retry a thread that is
      // never going to accept another message. Transport failures return null
      // rather than the SDK's untranslated English, so those keep our copy.
      onError: (error) =>
        toast.error(serverMessage(error) ?? "Le message n’a pas pu être envoyé"),
    });
  };

  return (
    <div className="flex h-dvh flex-col">
      {/* ── Header: who you are talking to, and whether they are there. ── */}
      <header className="z-10 flex shrink-0 items-center gap-2 bg-card px-2 py-2 shadow-soft">
        <button
          type="button"
          aria-label="Retour"
          onClick={goBack}
          className="flex h-10 w-9 shrink-0 items-center justify-center rounded-md active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {discussion ? (
          <CounterpartAvatar
            name={name}
            avatarUrl={discussion.counterpartAvatarUrl}
            online={discussion.counterpartOnline}
            className="h-10 w-10"
          />
        ) : (
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        )}

        <div className="min-w-0 flex-1 pl-1">
          {discussion ? (
            <p className="truncate text-[15px] font-semibold leading-tight">{name}</p>
          ) : (
            <Skeleton className="mb-1 h-4 w-32" />
          )}
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
            button for a "débloquées" badge cut that path off. It opens a sheet
            that then continues into the EXISTING payment flow — not a second
            payment path. See `showUnlock` for who sees it, by role. */}
        {showUnlock && (
          <button
            type="button"
            onClick={() => setUnlockOpen(true)}
            aria-label={content.unlockCta}
            className="flex shrink-0 items-center gap-1 rounded-full bg-linear-to-b from-whatsapp to-whatsapp-dark px-3 py-1.5 text-[11px] font-semibold text-white shadow-nav-selected inset-shadow-[0_1px_rgb(255_255_255/0.18)] transition active:translate-y-px active:shadow-none motion-reduce:transition-none"
          >
            <Lock className="h-3.5 w-3.5" />
            Débloquer
          </button>
        )}
      </header>

      {/* ── Thread, on the wallpaper. ── */}
      <div
        ref={scrollRef}
        className="chat-wallpaper flex-1 overflow-y-auto px-3 pb-2 pt-3"
      >
        {/* The standing rule, as a system notice at the head of the thread —
            the same place and shape WhatsApp uses for its encryption notice,
            so it reads as part of the conversation's ground rules rather than
            as an ad in the header.

            ALWAYS shown. It used to disappear once the pair had unlocked,
            because masking stopped there too; masking never stops now, so a
            notice that vanished would leave the rule unexplained exactly
            where people most expect to be able to type a number. */}
        <div className="mb-3 flex items-start gap-1.5 rounded-lg bg-chat-notice px-3 py-2 text-[11px] leading-snug text-chat-notice-foreground shadow-[0_1px_0.5px_rgb(0_0_0/0.1)]">
          <Lock className="mt-px h-3 w-3 shrink-0" />
          {/* Left-aligned and full width of the thread: centred inside 88% made
              every line break in a different place, which reads as a paragraph
              to parse rather than a rule to glance at. */}
          <span>{warning.header}</span>
        </div>

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

        {/* The way back into a long thread. A button rather than a fetch on
            scrolling up: on a slow connection an accidental flick would start
            a request nobody asked for, and this audience pays for it. */}
        {!isLoading && hasOlder && (
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={loadOlder}
              disabled={loadingOlder}
              className="flex items-center gap-1.5 rounded-full bg-chat-bubble-in px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-[0_1px_0.5px_rgb(0_0_0/0.1)] transition active:translate-y-px disabled:opacity-60 motion-reduce:transition-none"
            >
              {loadingOlder && (
                <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" />
              )}
              {loadingOlder ? content.olderLoading : content.older}
            </button>
          </div>
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
                // The server's flag, with the just-tapped ones layered on top:
                // `reported` here is only the optimistic half, for the gap
                // between the tap and the refetch.
                reported={message.reported || reported.includes(message.id)}
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
      {/* `+1rem` on top of the inset, the same as BottomNav: half of it left
          the composer hugging the home indicator on a phone. `pt-2` keeps it
          off the last bubble. */}
      <footer className="chat-wallpaper shrink-0 px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2">
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

      {discussion && isEmployer && (
        <ContactConfirmDrawer
          open={unlockOpen}
          onOpenChange={setUnlockOpen}
          workerId={discussion.counterpartId}
          workerName={discussion.counterpartName}
          onConfirm={() =>
            navigate(`/recommandations/${discussion.counterpartId}/contact`)
          }
        />
      )}

      {discussion && !isEmployer && workerUnlock && discussion.applicationId && (
        <WorkerUnlockDrawer
          open={unlockOpen}
          onOpenChange={setUnlockOpen}
          employerName={discussion.counterpartName}
          unlock={workerUnlock}
          onConfirm={() =>
            navigate(`/applications/${discussion.applicationId}/paiement`)
          }
        />
      )}
    </div>
  );
}
