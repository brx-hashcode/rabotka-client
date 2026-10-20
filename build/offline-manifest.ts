import { createHash } from "node:crypto";
import type { Plugin } from "vite";

/**
 * Writes `offline-manifest.json` next to the build: the files the service
 * worker stores so the app opens without a network, and a version that changes
 * whenever any of them does.
 *
 * Kept as a few lines here rather than a PWA plugin: the service worker is
 * handwritten (it also does Web Push), and all it needs from the build is
 * this list.
 *
 * `disabled` is the remote switch: a build made with
 * VITE_OFFLINE_DISABLED=true tells every installed service worker to drop its
 * stored copy and step aside — a way out if a cached version ever goes bad.
 */

/** Public files the shell needs. Social-sharing images and the like stay out. */
const PUBLIC_FILES = [
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/rabotka-logo.png",
  "/notification.m4a",
];

/**
 * Built files left out of the first download. Raster images are most of the
 * weight (landing and onboarding illustrations, ~3.6 MB) and none is needed
 * to open the app: the service worker stores each one the first time it is
 * actually shown instead. Users pay for data by the megabyte.
 */
const SKIP =
  /\.(map|txt|xml)$|^stats\.html$|^offline-manifest\.json$|og-image|\.(webp|avif|png|jpe?g|gif)$/;

export function offlineManifest(options: { disabled?: boolean } = {}): Plugin {
  return {
    name: "rabotka-offline-manifest",
    apply: "build",
    generateBundle(_, bundle) {
      const built = Object.keys(bundle)
        .filter((name) => !SKIP.test(name) && name !== "index.html")
        .map((name) => `/${name}`);

      // public/fonts is not listed: the stylesheet uses the bundled copies.
      const files = ["/", ...PUBLIC_FILES, ...built].sort();
      const version = createHash("sha256")
        .update(files.join("\n"))
        .digest("hex")
        .slice(0, 12);

      this.emitFile({
        type: "asset",
        fileName: "offline-manifest.json",
        source: JSON.stringify(
          { version, disabled: options.disabled === true, files },
          null,
          2,
        ),
      });
    },
  };
}
