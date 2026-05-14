/// <reference types="vite/client" />
/// <reference types="vite-imagetools/client" />

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
