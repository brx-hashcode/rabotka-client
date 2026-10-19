import {
  getPushKey,
  subscribePush,
  unsubscribePush,
} from "@/lib/api/notification-controller";

/**
 * - `unsupported`: no Push API (old browser, private mode).
 * - `needs-install`: iPhone/iPad Safari, where Web Push only works once the
 *   site is added to the home screen and opened from there.
 * - `denied`: they blocked notifications for this site.
 * - `off` / `on`: whether this device receives them.
 */
export type PushState = "unsupported" | "needs-install" | "denied" | "off" | "on";

const SW_URL = "/sw.js";

function isIos(): boolean {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac with touch.
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return (
    globalThis.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function supported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in globalThis && "Notification" in globalThis;
}

/** The base64url VAPID key as the bytes `pushManager.subscribe` wants. */
export function urlBase64ToBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const padded = base64url + "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function sameKey(subscription: PushSubscription, key: Uint8Array): boolean {
  const current = subscription.options.applicationServerKey;
  if (!current) return false;
  const a = new Uint8Array(current);
  return a.length === key.length && a.every((b, i) => b === key[i]);
}

async function registration(): Promise<ServiceWorkerRegistration> {
  return (
    (await navigator.serviceWorker.getRegistration(SW_URL)) ??
    navigator.serviceWorker.register(SW_URL)
  );
}

export async function getPushState(): Promise<PushState> {
  if (typeof window === "undefined") return "unsupported";
  if (!supported()) return isIos() && !isStandalone() ? "needs-install" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = await navigator.serviceWorker.getRegistration(SW_URL);
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

/** Subscribes this device with the backend's key and registers it. */
async function subscribe(): Promise<void> {
  const reg = await registration();
  await navigator.serviceWorker.ready;
  const key = urlBase64ToBytes((await getPushKey()).publicKey);
  let sub = await reg.pushManager.getSubscription();
  // A subscription made with another key (the backend's pair changed) is dead.
  if (sub && !sameKey(sub, key)) {
    await sub.unsubscribe().catch(() => undefined);
    sub = null;
  }
  sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("Abonnement incomplet");
  }
  await subscribePush({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  });
}

/** Asks permission (must run from a tap) and subscribes. Returns the new state. */
export async function enablePush(): Promise<PushState> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";
  await subscribe();
  return "on";
}

/** Stops push on this device, here and on the backend. Best-effort on the backend. */
export async function disablePush(): Promise<void> {
  if (!supported()) return;
  const reg = await navigator.serviceWorker.getRegistration(SW_URL);
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await unsubscribePush(sub.endpoint).catch(() => undefined);
  await sub.unsubscribe().catch(() => undefined);
}

/**
 * On each signed-in visit where permission is already granted: make sure the
 * subscription exists, matches the backend's current key and belongs to this
 * profile (someone else may have signed in on this phone before).
 */
let synced: Promise<void> | null = null;

export function syncPush(): Promise<void> {
  if (!supported() || Notification.permission !== "granted") return Promise.resolve();
  // Once per page load: React's dev double effects (and remounts) must not
  // re-register the device each time.
  synced ??= subscribe().catch((err: unknown) => {
    synced = null;
    throw err;
  });
  return synced;
}
