import ReactMarkdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { config } from "@/config";

async function fetchPolicy(): Promise<string> {
  const res = await fetch(`${config.apiUrl}/public/documents/policy`);
  if (!res.ok) throw new Error("Failed to load policy");
  const contentType = res.headers.get("content-type") ?? "";
  if (
    contentType.includes("text/markdown") ||
    contentType.includes("text/plain")
  ) {
    return res.text();
  }
  throw new Error("Policy is not in markdown format");
}

export default function Terms() {
  const navigate = useNavigate();
  const {
    data: content,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public", "policy"],
    queryFn: fetchPolicy,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            // Prefer browser history; fall back to home when opened directly.
            if (globalThis.history.length > 1) navigate(-1);
            else navigate("/");
          }}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>
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
        <p className="text-muted-foreground text-center py-16">
          Impossible de charger les conditions d'utilisation. Veuillez réessayer
          plus tard.
        </p>
      )}
      {content && (
        <article
          className="prose prose-gray max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h1:text-3xl prose-h1:mb-2
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
          prose-p:text-gray-700 prose-p:leading-relaxed
          prose-li:text-gray-700
          prose-hr:border-gray-200
          prose-strong:text-gray-900
          prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline"
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}
