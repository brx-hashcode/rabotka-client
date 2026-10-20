import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, ChevronDown, Loader2, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useKeyboardFrame } from "@/hooks/use-keyboard-frame";
import { useIsOnline } from "@/hooks/use-is-online";
import { discussionsContent } from "@/content/discussions";
import { MessageBubble } from "@/features/discussions/components/message-bubble";
import { DeleteMessageSheet } from "@/features/discussions/components/delete-message-sheet";
import { mergeThread } from "@/features/discussions/merge-thread";
import { CounterpartAvatar } from "@/features/discussions/components/counterpart-avatar";
import { TypingBubble } from "@/features/discussions/components/typing-bubble";
import { useDiscussionTyping } from "@/features/discussions/use-discussion-typing";
import { serverMessage } from "@/lib/api/errors";
import { tapFeedback } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { DiscussionMessage } from "@/lib/api/discussions-controller";
import { useAutoGrowTextarea } from "@/hooks/use-auto-grow-textarea";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useWorkerUnlock } from "@/hooks/use-worker-unlock";
import { ContactConfirmDrawer } from "@/features/employer/components/contact-confirm-drawer";
import { WorkerUnlockDrawer } from "@/features/discussions/components/worker-unlock-drawer";
import {
  useDiscussion,
  useDiscussionHistory,
  useDiscussionThread,
  useDeleteDiscussionMessage,
  useDiscussionsSocket,
  useMarkDiscussionRead,
  useReportRedaction,
  useSendMessage,
} from "@/hooks/use-discussions";

/** Matches the server's DTO bound, so the counter and the 400 agree. */
const MAX_LENGTH = 2000;

/**
 * The ceiling the composer grows to — about five lines. Mirrored by
 * `max-h-33` on the textarea so the measure and the class cannot drift.
 */
const COMPOSER_MAX_PX = 132;

/** Past this far from the bottom, the way back stops being a flick. */
const SCROLL_PILL_PX = 240;

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

/**
 * The line under the counterpart's name.
 *
 * Typing wins over "en ligne": it is the more specific of the two, and it is
 * what somebody scrolled up the thread — who cannot see the dots at the bottom
 * — is waiting to read. Never "hors ligne": the server fails closed, so false
 * also means "could not tell", and saying offline would claim a certainty
 * nobody has. No "vu à" either — last-seen is a privacy setting everywhere it
 * exists, and that decision has not been made here.
 */
function headerSubtitle(
  typing: boolean,
  online: boolean,
  jobTitle: string | null | undefined,
): string {
  if (typing) return discussionsContent.thread.typing;
  if (online) return "en ligne";
  return jobTitle ?? "";
}

/**
 * The avatar-and-name block of the header, tappable or not.
 *
 * One component rather than a ternary around the whole block, so the two
 * branches cannot drift apart — and so the inert case is a plain `div` rather
 * than a disabled button, which would still announce itself to a screen reader
 * as something that ought to do something.
 */
function ProfileLink({
  enabled,
  name,
  onOpen,
  children,
}: Readonly<{
  enabled: boolean;
  name: string;
  onOpen: () => void;
  children: React.ReactNode;
}>) {
  const shared = "flex min-w-0 flex-1 items-center gap-2";

  if (!enabled) return <div className={shared}>{children}</div>;

  return (
    <button
      type="button"
      aria-label={name ? `Voir le profil de ${name}` : "Voir le profil"}
      onClick={() => {
        tapFeedback();
        onOpen();
      }}
      className={cn(shared, "rounded-md transition active:opacity-60 motion-reduce:transition-none")}
    >
      {children}
    </button>
  );
}

export default function Discussion() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [reported, setReported] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useAutoGrowTextarea(draft, COMPOSER_MAX_PX);
  // The visible area above an iPhone keyboard; null otherwise. See the return.
  const keyboard = useKeyboardFrame();
  const online = useIsOnline();

  /**
   * Scroll the THREAD to its end — never the page.
   *
   * `bottomRef.scrollIntoView()` walks up EVERY scrollable ancestor, and in an
   * iOS in-app webview with the keyboard open the document itself becomes one
   * of them. It scrolled the whole screen away and left a page of white under
   * the composer. Setting the container's own scroll position cannot touch the
   * window, whatever the keyboard has done to the document.
   */
  const scrollThreadToBottom = (smooth = false) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  // The keyboard opening (or the iPhone moving the visible area while
  // typing) shortens the thread: keep the last message above the composer.
  const keyboardHeight = keyboard?.height ?? null;
  useEffect(() => {
    if (keyboardHeight !== null) scrollThreadToBottom();
  }, [keyboardHeight]);

  /**
   * Messages sent but not yet answered for, shown greyed with a clock so the
   * thread reacts to the tap instead of sitting still until the round trip
   * ends. Dropped on success — the server's own version takes their place —
   * and on failure, where the toast explains.
   */
  const [pending, setPending] = useState<{ key: string; body: string }[]>([]);
  const pendingSeq = useRef(0);

  /** Far enough up the thread that the way down should be offered. */
  const [showScrollPill, setShowScrollPill] = useState(false);

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
  const deleteMessage = useDeleteDiscussionMessage(id);
  useDiscussionsSocket(true);

  /**
   * The bubble swiped open, and the one whose deletion is being confirmed.
   *
   * One open at a time, like the notifications list: a thread full of
   * half-open bubbles is a thread nobody can read.
   */
  const [swipeOpenId, setSwipeOpenId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] =
    useState<DiscussionMessage | null>(null);

  const { counterpartTyping, notifyTyping } = useDiscussionTyping(id, true);

  const content = discussionsContent.thread;
  const warning = discussionsContent.warning;

  const { data: me } = useProfileMe();
  const location = useLocation();
  const isEmployer = me?.profileType === "EMPLOYER";
  const [unlockOpen, setUnlockOpen] = useState(false);

  /**
   * The header opens the counterpart's profile — in one direction only.
   *
   * An employer's counterpart is always a worker, and the detail page already
   * exists for them. A worker's counterpart is an employer, whose profile is
   * not a page anyone browses; the endpoint behind it asserts EMPLOYER anyway,
   * so a link there would be a 403 waiting to happen.
   */
  const canOpenProfile = isEmployer && Boolean(discussion?.counterpartId);

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
    setShowScrollPill(false);
    // A bubble left in flight would otherwise reappear at the bottom of the
    // NEXT thread, attributed to the wrong person.
    setPending([]);
    // And a sheet left open would be acting on a message from the thread the
    // person has just left.
    setSwipeOpenId(null);
    setConfirmingDelete(null);
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
      scrollThreadToBottom();
      return;
    }

    const el = scrollRef.current;
    const nearBottom = el
      ? el.scrollHeight - el.scrollTop - el.clientHeight < 120
      : true;
    if (nearBottom || last?.mine) {
      scrollThreadToBottom(true);
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
    if (!body || send.isPending || !online) return;
    tapFeedback();

    // Cleared here rather than in `onSuccess`: the pending bubble already shows
    // what was typed, and leaving the text in the box for the length of the
    // round trip reads as a send that did not take.
    setDraft("");
    pendingSeq.current += 1;
    const key = `pending-${pendingSeq.current}`;
    setPending((queue) => [...queue, { key, body }]);
    const settle = () => setPending((queue) => queue.filter((p) => p.key !== key));

    // The effect that follows the thread is keyed on the newest SERVER message,
    // which has not arrived yet — so the bubble just added would otherwise
    // appear below the fold on a full screen.
    requestAnimationFrame(() => scrollThreadToBottom(true));

    send.mutate(body, {
      onSuccess: ({ message }) => {
        settle();
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
      onError: (error) => {
        settle();
        // Given back rather than lost — but only if nothing new was typed in
        // the meantime, which would otherwise be overwritten.
        setDraft((current) => current || body);
        toast.error(serverMessage(error) ?? "Le message n’a pas pu être envoyé");
      },
    });
  };

  const confirmDelete = () => {
    const message = confirmingDelete;
    if (!message) return;
    tapFeedback();
    setConfirmingDelete(null);
    deleteMessage.mutate(message.id, {
      onSuccess: () => toast.success(content.actionsDeleted),
      onError: (error) =>
        toast.error(serverMessage(error) ?? content.actionsDeleteFailed),
    });
  };

  /**
   * Whether the pill that goes back down should be showing. Coalesced into a
   * frame: this fires on every scroll event, and a `setState` per event on a
   * cheap phone is how a thread starts to stutter under the thumb.
   */
  const pillFrame = useRef<number | null>(null);
  const onThreadScroll = () => {
    if (pillFrame.current !== null) return;
    pillFrame.current = requestAnimationFrame(() => {
      pillFrame.current = null;
      const el = scrollRef.current;
      if (!el) return;
      const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollPill(fromBottom > SCROLL_PILL_PX);
    });
    // Scrolling the thread closes an open bubble, as it does on the
    // notifications list and on WhatsApp. Outside the frame, so it happens on
    // the first event rather than one frame late.
    setSwipeOpenId(null);
  };

  useEffect(
    () => () => {
      if (pillFrame.current !== null) cancelAnimationFrame(pillFrame.current);
    },
    [],
  );

  /**
   * `h-dvh`, and on an iPhone with the keyboard open, the visible area.
   *
   * iOS does not shrink the page for the keyboard; it scrolls it. The column
   * slid up with it: the header left the screen and the composer floated.
   * While a keyboard is open the column is `position: fixed` on the visual
   * viewport — its offset as well as its height. An earlier attempt set the
   * height alone, which squeezed the thread into the top of the screen inside
   * the WhatsApp browser while the document scrolled underneath; following the
   * offset is what keeps the box on the part of the page actually shown.
   *
   * Android needs none of it: the page itself resizes there
   * (`interactive-widget=resizes-content`), and the frame stays null.
   */
  return (
    <div
      className="flex h-dvh flex-col"
      style={
        keyboard
          ? {
              position: "fixed",
              insetInline: 0,
              top: keyboard.top,
              height: keyboard.height,
              zIndex: 40,
            }
          : undefined
      }
    >
      {/* ── Header: who you are talking to, and whether they are there. ── */}
      <header className="z-10 flex shrink-0 items-center gap-2 bg-card px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-soft">
        <button
          type="button"
          aria-label="Retour"
          onClick={goBack}
          className="flex h-10 w-9 shrink-0 items-center justify-center rounded-md active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {/* Tappable ONE WAY ONLY. An employer opens the worker they are talking
            to — the same profile the recommendation card opens. A worker gets a
            plain div: an employer's profile is not theirs to browse, and a
            button that refuses is worse than nothing to press. */}
        <ProfileLink
          enabled={canOpenProfile}
          name={name}
          onOpen={() => navigate(`/recommandations/${discussion?.counterpartId}`)}
        >
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

          <div className="min-w-0 flex-1 pl-1 text-left">
            {discussion ? (
              <p className="truncate text-[15px] font-semibold leading-tight">
                {name}
              </p>
            ) : (
              <Skeleton className="mb-1 h-4 w-32" />
            )}
            {/* See `headerSubtitle` for what this says, and what it never
                says. */}
            <p
              className={cn(
                "truncate text-xs leading-tight",
                counterpartTyping || discussion?.counterpartOnline
                  ? "text-whatsapp"
                  : "text-muted-foreground",
              )}
            >
              {headerSubtitle(
                counterpartTyping,
                discussion?.counterpartOnline ?? false,
                discussion?.jobTitle,
              )}
            </p>
          </div>
        </ProfileLink>

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
      {/* `relative` so the way-down pill can sit over the last bubbles rather
          than take a row of its own in the column. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          onScroll={onThreadScroll}
          // `overscroll-contain`: without it, dragging past the top of the thread
          // rubber-bands the whole page, which is the clearest tell that this is
          // a web page and not an app.
          className="chat-wallpaper flex-1 overflow-y-auto overscroll-contain px-3 pb-2 pt-3"
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
                  swipeOpen={swipeOpenId === message.id}
                  onSwipeOpenChange={(messageId, open) =>
                    setSwipeOpenId((current) => {
                      if (open) return messageId;
                      return current === messageId ? null : current;
                    })
                  }
                  onDelete={(target) => {
                    tapFeedback();
                    setSwipeOpenId(null);
                    setConfirmingDelete(target);
                  }}
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

          {/* Sent, not yet answered for. Rendered as real bubbles so the thread
              does not visibly jump when the server's version replaces them —
              same shape, same place, only the clock becomes a tick. */}
          {pending.map((item) => (
            <MessageBubble
              key={item.key}
              pending
              message={{
                id: item.key,
                conversationId: id,
                // Never read for a pending bubble — `mine` is what the bubble
                // branches on, and grouping is decided above, not from this.
                senderId: "",
                mine: true,
                body: item.body,
                status: "CLEAN",
                redactions: [],
                reported: false,
                deletedAt: null,
                createdAt: new Date().toISOString(),
                readAt: null,
              }}
              // Always its own group: it is the newest thing in the thread, and
              // the tail belongs on it rather than on the bubble above.
              firstOfGroup={!last?.mine}
              showRecipientNotice={false}
              reported={false}
              onReport={() => undefined}
            />
          ))}

          {/* Below everything, including a message still in flight: the reply
              being written is the newest thing in the thread. */}
          {counterpartTyping && <TypingBubble />}

          <div ref={bottomRef} />
        </div>

        {/* The way back down, once the thread has been scrolled away from. */}
        {showScrollPill && (
          <button
            type="button"
            aria-label="Revenir au dernier message"
            onClick={() => {
              tapFeedback();
              scrollThreadToBottom(true);
            }}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground shadow-soft transition active:translate-y-px motion-reduce:transition-none"
          >
            <ChevronDown className="h-5 w-5" strokeWidth={2} />
            {/* The count the list screen already shows, carried here so the pill
                says WHY to go down, not only that you can. */}
            {Boolean(discussion?.unreadCount) && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-whatsapp px-1 text-[10px] font-semibold text-white tabular-nums">
                {discussion?.unreadCount}
              </span>
            )}
          </button>
        )}
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
            <div className="relative flex-1">
              <textarea
                ref={composerRef}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value.slice(0, MAX_LENGTH));
                  // Throttled inside, to one emit every couple of seconds: a
                  // two-line message is a hundred keystrokes, and this
                  // audience pays for the connection by the megabyte.
                  notifyTyping();
                }}
                onFocus={() => {
                  // The keyboard opening shortens the thread under the composer;
                  // without this the last bubble ends up behind it. A frame
                  // later, once the viewport has actually resized.
                  // Wrapped, not passed by reference: rAF hands its callback a
                  // timestamp, which would arrive as `smooth`.
                  requestAnimationFrame(() => scrollThreadToBottom());
                }}
                // Typing works offline; sending waits for the network.
                placeholder={online ? content.placeholder : "Hors ligne · envoi possible une fois connecté"}
                rows={1}
                // Grows with the text up to `COMPOSER_MAX_PX`, then scrolls.
                // The measuring is in `useAutoGrowTextarea`, not in CSS: Safari
                // does not support `field-sizing`, which left this box frozen at
                // its min-height on the iPhones most of this audience uses.
                className="max-h-33 w-full resize-none rounded-3xl bg-card px-4 py-2.5 text-[15px] leading-snug shadow-[0_1px_0.5px_rgb(0_0_0/0.13)] outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  // Enter sends, Shift+Enter breaks the line — the shape people
                  // already have in their fingers from WhatsApp.
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
              {/* Only near the ceiling. `slice(0, MAX_LENGTH)` above is a hard
                  truncation, and without a warning it is a silent one — text
                  simply stops appearing under the thumb. */}
              {draft.length > MAX_LENGTH - 100 && (
                <span className="pointer-events-none absolute -top-5 right-3 rounded-full bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-soft tabular-nums">
                  {draft.length} / {MAX_LENGTH}
                </span>
              )}
            </div>
            <button
              type="button"
              aria-label={content.send}
              onClick={submit}
              disabled={!draft.trim() || send.isPending || !online}
              className={cn(
                "flex h-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-whatsapp text-white shadow-[0_1px_0.5px_rgb(0_0_0/0.13)] transition-all active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100",
                // Slides away when there is nothing to send rather than sitting
                // there greyed out. The width collapses with it: a disabled
                // button holding 44px of empty space is the one thing WhatsApp
                // never shows, because that corner always has something in it —
                // and here there is no microphone to put back.
                draft.trim() ? "w-11 scale-100 opacity-100" : "w-0 scale-0 opacity-0",
              )}
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

      {/* ── "Are you sure?", after the revealed Supprimer is tapped. ── */}
      <DeleteMessageSheet
        message={confirmingDelete}
        deleting={deleteMessage.isPending}
        onClose={() => setConfirmingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
