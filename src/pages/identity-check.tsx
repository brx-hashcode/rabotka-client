import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, Check, Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppIdentityRow } from "@/features/oauth/components/app-identity-row";
import { ConsentCard } from "@/features/oauth/components/consent-card";
import { claimedRows } from "@/features/identity-check/lib/claimed-rows";
import { identityCheckContent as content } from "@/content/identity-check/consent";
import { isNetworkError } from "@/lib/api/errors";
import {
  decideIdentityCheck,
  getIdentityCheck,
  type IdentityCheckRequest,
} from "@/lib/api/identity-check-controller";


export default function IdentityCheckPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const queryKey = ["identity-check", id];

  const query = useQuery({
    queryKey,
    queryFn: () => getIdentityCheck(id),
    enabled: id.length > 0,
    retry: false,
  });

  const decision = useMutation({
    mutationFn: (approve: boolean) => decideIdentityCheck(id, approve),
    onSuccess: (updated) => queryClient.setQueryData(queryKey, updated),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  if (query.isPending) {
    return (
      <ConsentCard title={content.title}>
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          {content.loading}
        </div>
      </ConsentCard>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ConsentCard title={content.title}>
        <ErrorBlock
          message={
            isNetworkError(query.error)
              ? content.errors.network
              : content.errors.notFound
          }
          onRetry={isNetworkError(query.error) ? () => query.refetch() : undefined}
        />
      </ConsentCard>
    );
  }

  const request = query.data;

  return (
    <ConsentCard
      title={content.title}
      subtitle={content.subtitle(request.app.name)}
    >
      <div className="space-y-6">
        <AppIdentityRow
          name={request.app.name}
          description={request.app.description}
          logoUrl={request.app.logoUrl}
        />

        {request.status === "pending" ? (
          <PendingBody
            request={request}
            isDeciding={decision.isPending}
            failed={decision.isError}
            onDecide={(approve) => decision.mutate(approve)}
          />
        ) : (
          <Outcome request={request} />
        )}
      </div>
    </ConsentCard>
  );
}

function PendingBody({
  request,
  isDeciding,
  failed,
  onDecide,
}: Readonly<{
  request: IdentityCheckRequest;
  isDeciding: boolean;
  failed: boolean;
  onDecide: (approve: boolean) => void;
}>) {
  const rows = claimedRows(request.claimed);

  return (
    <>
      <section className="space-y-2.5">
        <p className="text-sm font-medium">{content.claimed.heading}</p>
        {rows.length > 0 ? (
          <dl className="bg-muted/60 space-y-1.5 rounded-xl p-3.5 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">{row.label}</dt>
                <dd className="truncate text-right font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-muted-foreground text-sm">
            {content.claimed.erased}
          </p>
        )}
      </section>

      <section className="space-y-2.5">
        <p className="text-sm font-medium">{content.willShare.heading}</p>
        <ul className="space-y-2">
          {content.willShare.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <ShieldCheck
                aria-hidden
                className="text-primary mt-0.5 size-4 shrink-0"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {content.willShare.never}
        </p>
      </section>

      {failed && (
        <p role="alert" className="text-destructive text-center text-sm">
          {content.errors.decision}
        </p>
      )}

      {/* Same weight for both answers, refuse first — as on the login consent. */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          onClick={() => onDecide(false)}
          disabled={isDeciding}
        >
          {content.decline}
        </Button>
        <Button onClick={() => onDecide(true)} disabled={isDeciding}>
          {isDeciding ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            content.approve
          )}
        </Button>
      </div>

      <div className="text-muted-foreground space-y-1.5 text-center text-xs leading-relaxed">
        <p>{content.notMe}</p>
        <p>
          {content.expiresAt(
            format(new Date(request.expiresAt), "d MMMM 'à' HH:mm", {
              locale: fr,
            }),
          )}
        </p>
      </div>
    </>
  );
}

function Outcome({ request }: Readonly<{ request: IdentityCheckRequest }>) {
  const key = request.status;
  if (key === "pending") return null;
  const outcome = content.outcome[key];
  const Icon = key === "approved" ? Check : X;

  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
        <Icon aria-hidden className="size-5" />
      </div>
      <p className="font-medium">{outcome.title}</p>
      <p className="text-muted-foreground text-sm">
        {outcome.body(request.app.name)}
      </p>
      <Button asChild variant="secondary" className="mt-2">
        <Link to="/home">{content.backHome}</Link>
      </Button>
    </div>
  );
}

function ErrorBlock({
  message,
  onRetry,
}: Readonly<{ message: string; onRetry?: () => void }>) {
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <AlertTriangle aria-hidden className="text-muted-foreground size-6" />
      <p className="text-muted-foreground text-sm">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          {content.errors.retry}
        </Button>
      ) : (
        <Button asChild variant="secondary">
          <Link to="/home">{content.backHome}</Link>
        </Button>
      )}
    </div>
  );
}
