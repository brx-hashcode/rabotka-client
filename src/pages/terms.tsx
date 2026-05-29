import ReactMarkdown from "react-markdown";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Seo } from "@/hooks/use-seo";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPolicyContent,
  policyQueryKey,
  POLICY_GC_TIME,
  POLICY_STALE_TIME,
} from "@/features/terms/policy-query";

export default function Terms() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof globalThis !== "undefined") {
      globalThis.scrollTo(0, 0);
    }
  }, []);

  const {
    data: content,
    isLoading,
    isError,
  } = useQuery({
    queryKey: policyQueryKey,
    queryFn: getPolicyContent,
    retry: 1,
    staleTime: POLICY_STALE_TIME,
    gcTime: POLICY_GC_TIME,
  });

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-14 pt-24 sm:px-6 lg:px-8 lg:pt-28">
      <Seo
        title="Conditions d'utilisation – Rabotka"
        description="Consultez les conditions générales d'utilisation de Rabotka, la plateforme WhatsApp de mise en relation entre travailleurs informels et employeurs au Congo."
        canonical="/terms"
      />
      <div className="mb-5 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (globalThis.history.length > 1) navigate(-1);
            else navigate("/");
          }}
          className="h-8 w-8 p-0"
          aria-label="Retour"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Document légal
        </span>
      </div>

      <section className="p-0 sm:px-6">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {isError && (
          <p className="py-16 text-center text-muted-foreground">
            Impossible de charger les conditions d'utilisation. Veuillez réessayer
            plus tard.
          </p>
        )}
        {content && (
          <article
            className="prose prose-gray max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:mb-2 prose-h1:text-3xl
            prose-h2:mb-3 prose-h2:mt-8 prose-h2:text-xl
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-li:text-gray-700
            prose-hr:border-gray-200
            prose-strong:text-gray-900
            prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline"
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        )}
      </section>
    </main>
  );
}
