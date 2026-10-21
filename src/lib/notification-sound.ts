/**
 * The chime for a notification that arrives while the app is open — the same
 * sound as the admin's, re-encoded to AAC (15 KB rather than its 346 KB WAV:
 * this one is downloaded on mobile data).
 *
 * Browsers refuse audio a gesture did not start, and a socket event is not a
 * gesture, so playback has to be unlocked on the first tap or key press. It
 * used to be unlocked by playing the chime itself with `muted` set — the
 * admin's approach — but iOS Safari and in-app webviews do not always honour
 * `muted` on an Audio element, so the chime rang the moment the app was
 * opened and touched. Web Audio unlocks with `resume()`, which plays nothing.
 */
const SRC = "/notification.m4a";
const VOLUME = 0.5;

let context: AudioContext | null = null;
let buffer: Promise<AudioBuffer | null> | null = null;

function audioContext(): AudioContext | null {
  if (context) return context;
  const Ctor =
    globalThis.AudioContext ??
    (globalThis as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
}

/** Fetched and decoded once, on the unlocking gesture. */
function chime(ctx: AudioContext): Promise<AudioBuffer | null> {
  buffer ??= fetch(SRC)
    .then((res) => res.arrayBuffer())
    .then((bytes) => ctx.decodeAudioData(bytes))
    .catch(() => {
      buffer = null; // offline at the time: try again next chime
      return null;
    });
  return buffer;
}

function unlock() {
  window.removeEventListener("pointerdown", unlock);
  window.removeEventListener("keydown", unlock);
  const ctx = audioContext();
  if (!ctx) return;
  // Silent: resuming a context starts its clock, it plays no sound.
  void ctx.resume().catch(() => undefined);
  void chime(ctx);
}

/** Call once the app is running; harmless to call again. */
export function primeNotificationSound() {
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

/**
 * The first message of a thread arrives twice — as `message:new` and as its
 * bell entry — so a second chime this close to the first is the same event.
 */
const SAME_EVENT_MS = 2_000;
let lastPlayedAt = 0;

export function playNotificationSound() {
  const now = Date.now();
  if (now - lastPlayedAt < SAME_EVENT_MS) return;
  lastPlayedAt = now;
  // Not unlocked yet, or suspended again (iOS does so when the app goes to
  // the background): stay quiet, and resume on the next tap.
  const ctx = context;
  if (!ctx || ctx.state !== "running") {
    primeNotificationSound();
    return;
  }
  void chime(ctx).then((decoded) => {
    if (!decoded) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = VOLUME;
    source.buffer = decoded;
    source.connect(gain).connect(ctx.destination);
    source.start();
  });
}

/**
 * Whether a notification should chime. Not when the page is hidden — the
 * phone notification (push) makes its own sound there, and two would be one
 * too many. Not when the person is already on the screen it points to, e.g.
 * reading the very conversation the message landed in.
 */
export function shouldChime(
  notification: { link: string | null } | null | undefined,
  pathname: string,
  pageVisible: boolean,
): boolean {
  if (!pageVisible) return false;
  return notification?.link == null || notification.link !== pathname;
}
