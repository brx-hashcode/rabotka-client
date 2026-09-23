/**
 * The three bouncing dots, in an incoming bubble at the foot of the thread.
 *
 * Shaped exactly like a real incoming message — same background, same tail,
 * same left offset — so the thread does not shift when the message it is
 * announcing arrives and takes its place.
 *
 * The header says the same thing in words at the same moment. Both, because
 * they answer different questions: the header is what somebody scrolled up the
 * thread can see, the dots are where the reply is about to appear.
 */
export function TypingBubble() {
  return (
    <div className="mt-1 flex w-full items-start" aria-live="polite">
      <span className="sr-only">En train d’écrire</span>
      <div
        aria-hidden
        className="relative flex items-center gap-1 rounded-lg bg-chat-bubble-in px-3 py-2.5 shadow-[0_1px_0.5px_rgb(0_0_0/0.13)]"
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            // Staggered by a third of the cycle each, which is what reads as a
            // wave rather than three dots pulsing together.
            style={{ animationDelay: `${delay}ms` }}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
