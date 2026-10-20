/**
 * The chime for a notification that arrives while the app is open — the same
 * sound as the admin's, re-encoded to AAC (15 KB rather than its 346 KB WAV:
 * this one is downloaded on mobile data).
 *
 * Browsers refuse audio a gesture did not start, and a socket event is not a
 * gesture. So the element is played muted once on the first tap or key press,
 * which unlocks it for the rest of the session — the admin's approach
 * (rabotka-admin use-chat-socket.ts).
 */
let sound: HTMLAudioElement | null = null;

function element(): HTMLAudioElement {
  if (!sound) {
    sound = new Audio("/notification.m4a");
    sound.volume = 0.5;
    sound.preload = "auto";
  }
  return sound;
}

function unlock() {
  window.removeEventListener("pointerdown", unlock);
  window.removeEventListener("keydown", unlock);
  const audio = element();
  audio.muted = true;
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
    })
    .catch(() => undefined)
    .finally(() => {
      audio.muted = false;
    });
}

/** Call once the app is running; harmless to call again. */
export function primeNotificationSound() {
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

export function playNotificationSound() {
  const audio = element();
  try {
    audio.currentTime = 0;
  } catch {
    /* not loaded yet */
  }
  void audio.play().catch(() => undefined);
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
