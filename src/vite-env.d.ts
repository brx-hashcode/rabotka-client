/// <reference types="vite/client" />
/// <reference types="vite-imagetools/client" />

/** Injected by vite.config.ts from package.json (or VITE_APP_VERSION in CI). */
declare const __APP_VERSION__: string;

declare module "*.md?raw" {
  const content: string;
  export default content;
}

declare module "*?format=webp" {
  const src: string;
  export default src;
}

declare module "*?format=avif" {
  const src: string;
  export default src;
}
