import ReactMarkdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PolicyShell,
  policyProseClassName,
} from "@/features/terms/policy-shell";
import {
  getPolicyContent,
  policyQueryKey,
  POLICY_GC_TIME,
  POLICY_STALE_TIME,
} from "@/features/terms/policy-query";

export default function Terms() {
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
    <PolicyShell
      title="Conditions d'utilisation – Rabotka"
      description="Consultez les conditions générales d'utilisation de Rabotka, la plateforme WhatsApp de mise en relation entre travailleurs informels et employeurs au Congo."
      canonical="/terms"
    >
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
        <article className={policyProseClassName}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      )}
    </PolicyShell>
  );
}
