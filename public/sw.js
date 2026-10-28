/*
 * Rabotka service worker: Web Push, and the app shell for offline use.
 *
 * Offline: on install it stores the files listed in /offline-manifest.json
 * (written by the build — see build/offline-manifest.ts), so a phone that has
 * opened the app once can open it again with no network. It only ever serves
 * the app's own files: API calls, sockets and anything cross-origin always go
 * to the network, untouched — their data is the app's business (IndexedDB),
 * not this cache's.
 *
 * Updates: a new version installs alongside the running one and waits. The
 * page offers « Nouvelle version disponible — Recharger », which tells it to
 * take over (SKIP_WAITING); swapping it under a running page would delete the
 * code chunks that page still needs to load.
 *
 * Push payload (from the backend's ProfileWebPushService): { id, title, body, link }.
 */

const SHELL_PREFIX = "rabotka-shell-";
const MANIFEST_URL = "/offline-manifest.json";
/**
 * The app's own images, stored the first time each is shown rather than all
 * up front (they are most of the build's weight). Content-hashed, so a stored
 * one is never stale; capped so old versions' images cannot pile up.
 */
const MEDIA_CACHE = "rabotka-media";
const MEDIA_MAX_ENTRIES = 150;
const MEDIA_PATTERN = /^\/assets\/.+\.(webp|avif|png|jpe?g|gif)$/;
/**
 * Photos from the storage host (profile, portfolio, offers), kept once seen so
 * they show offline. Only when the host allows a CORS read: an opaque
 * response is counted by browsers as several megabytes of quota each, which
 * would fill a phone's storage with a few dozen photos. Until the bucket sends
 * Access-Control-Allow-Origin, remote photos are simply not kept.
 */
const PHOTO_CACHE = "rabotka-photos";
const PHOTO_MAX_ENTRIES = 300;
/** How long a page waits for the network before the stored app is shown. */
const NAVIGATION_TIMEOUT_MS = 4000;

/**
 * Hosts that refused a CORS read. Asked once per worker lifetime, then left
 * alone: retrying would download every photo twice, on data people pay for.
 */
const noCorsHosts = new Set();

/** Other origins' images: photos, kept by `cachePhoto` when allowed. */
async function cachePhoto(request) {
  const cache = await caches.open(PHOTO_CACHE);
  const cached = await cache.match(request.url);
  if (cached) return cached;
  const host = new URL(request.url).host;
  if (noCorsHosts.has(host)) return fetch(request);
  try {
    const response = await fetch(request.url, { mode: "cors", credentials: "omit" });
    if (response.ok && response.type === "cors") {
      await cache.put(request.url, response.clone());
      const keys = await cache.keys();
      const excess = keys.length - PHOTO_MAX_ENTRIES;
      if (excess > 0) await Promise.all(keys.slice(0, excess).map((k) => cache.delete(k)));
    }
    if (response.type !== "cors") noCorsHosts.add(host);
    return response;
  } catch {
    // No CORS on the host (or offline): the page's own request, untouched.
    if (self.navigator.onLine) noCorsHosts.add(host);
    return fetch(request);
  }
}

/** Never served from the shell cache. */
function isBypassed(url) {
  return (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/socket.io") ||
    url.pathname.startsWith("/payment-status") ||
    url.pathname === MANIFEST_URL ||
    url.pathname === "/sw.js"
  );
}

async function readManifest() {
  const res = await fetch(MANIFEST_URL, { cache: "no-store" });
  if (!res.ok) return null; // dev server, or an older build: nothing to store
  return res.json();
}

/** Forget every stored shell (the remote switch, or a broken install). */
async function dropShells() {
  const names = await caches.keys();
  await Promise.all(
    names
      .filter((n) => n.startsWith(SHELL_PREFIX) || n === MEDIA_CACHE || n === PHOTO_CACHE)
      .map((n) => caches.delete(n)),
  );
}

/** Oldest first: Cache keys come back in insertion order. */
async function trimMedia() {
  const cache = await caches.open(MEDIA_CACHE);
  const keys = await cache.keys();
  const excess = keys.length - MEDIA_MAX_ENTRIES;
  if (excess > 0) await Promise.all(keys.slice(0, excess).map((k) => cache.delete(k)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const manifest = await readManifest().catch(() => null);
      if (!manifest || manifest.disabled) return;
      const cache = await caches.open(SHELL_PREFIX + manifest.version);
      // One file at a time, tolerating a missing one: a single 404 must not
      // fail the whole install and leave the user with no offline copy.
      await Promise.all(
        manifest.files.map((file) =>
          cache.add(new Request(file, { cache: "reload" })).catch(() => undefined),
        ),
      );
    })(),
  );
  // No skipWaiting here: the page decides when to switch (see SKIP_WAITING).
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const manifest = await readManifest().catch(() => null);
      if (manifest?.disabled) {
        await dropShells();
      } else if (manifest) {
        // Keep only the version this worker installed.
        const keep = SHELL_PREFIX + manifest.version;
        const names = await caches.keys();
        await Promise.all(
          names
            .filter((n) => n.startsWith(SHELL_PREFIX) && n !== keep)
            .map((n) => caches.delete(n)),
        );
        await trimMedia().catch(() => undefined);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (request.destination === "image" && url.origin !== self.location.origin && url.protocol === "https:") {
    event.respondWith(cachePhoto(request));
    return;
  }
  if (isBypassed(url)) return;

  // Pages: the network first, so a deploy is seen as soon as it is online;
  // the stored app when there is none — or when the network is too slow to
  // answer in a few seconds, which on 2G is the common case, not the edge one.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cached = await caches.match("/", { ignoreSearch: true });
        const network = fetch(request);
        if (!cached) return network;
        const timeout = new Promise((resolve) =>
          setTimeout(() => resolve(cached), NAVIGATION_TIMEOUT_MS),
        );
        return Promise.race([network.catch(() => cached), timeout]);
      })(),
    );
    return;
  }

  // The app's own images: from the store, else fetched and stored.
  if (MEDIA_PATTERN.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(MEDIA_CACHE).then((c) => c.put(request, copy)),
          );
        }
        return response;
      })(),
    );
    return;
  }

  // The app's own files: content-hashed, so a stored copy is never stale.
  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request)),
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Rabotka", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Rabotka", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      // One entry per notification: a re-sent one replaces itself.
      tag: data.id || undefined,
      data: { link: data.link || "/notifications" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.link || "/notifications", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (open) {
        await open.focus();
        if ("navigate" in open) await open.navigate(url).catch(() => undefined);
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
