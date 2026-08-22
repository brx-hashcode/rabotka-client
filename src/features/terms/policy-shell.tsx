import { useEffect } from "react";
import { Seo } from "@/hooks/use-seo";

type PolicyShellProps = {
  title: string;
  description: string;
  canonical: string;
  children: React.ReactNode;
};

/**
 * Shared layout for legal pages (terms, privacy, cookies): the eyebrow label,
 * SEO tags and the prose styling for rendered markdown content.
 *
 * No back button: these pages are reached from the footer and from the signup
 * checkbox, and the landing header above already carries the way out. The
 * label sits on the left so it reads as an eyebrow to the title beneath it
 * rather than as something floating in the opposite corner.
 */
export function PolicyShell({
  title,
  description,
  canonical,
  children,
}: Readonly<PolicyShellProps>) {
  useEffect(() => {
    if (typeof globalThis !== "undefined") {
      globalThis.scrollTo(0, 0);
    }
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-14 pt-24 sm:px-6 lg:px-8 lg:pt-28">
      <Seo title={title} description={description} canonical={canonical} />
      <div className="mb-5 sm:px-6">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Document légal
        </span>
      </div>

      <section className="p-0 sm:px-6">{children}</section>
    </main>
  );
}

/** Tailwind Typography classes shared by all rendered legal markdown. */
export const policyProseClassName = `prose prose-gray max-w-none
  prose-headings:font-bold prose-headings:text-gray-900
  prose-h1:mb-2 prose-h1:text-3xl
  prose-h2:mb-3 prose-h2:mt-8 prose-h2:text-xl
  prose-p:text-gray-700 prose-p:leading-relaxed
  prose-li:text-gray-700
  prose-hr:border-gray-200
  prose-strong:text-gray-900
  prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline`;
