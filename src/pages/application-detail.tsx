import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Ban, Calendar, MapPin, Coins, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/features/portfolio/components/confirm-dialog";
import { useApplication, useRejectApplication } from "@/hooks/use-application";
import {
  ScreenHeader,
  APPLICATION_STATUS_LABELS,
  getApplicationStatusVariant,
} from "@/features/employer";
import type { ApplicationDetailApplication } from "@/lib/api/application-controller";
import { formatAmount, formatDate } from "@/lib/utils";

export default function ApplicationDetail() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useApplication(id);

  const reject = useRejectApplication(id);
  const [confirmReject, setConfirmReject] = useState(false);

  const goToPayment = () => navigate(`/candidatures/${id}/paiement`);

  // Always open the detail scrolled to the top (window scroll persists across
  // route changes inside the app shell).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Candidature" onBack={() => navigate(-1)} />

      {isLoading && <DetailSkeleton />}

      {!isLoading && (isError || !data) && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Impossible de charger cette candidature.
          </p>
        </div>
      )}

      {!isLoading && data && (
        <div className="space-y-4 px-4 py-4">
          <WorkerCard app={data.application} />

          {data.workerSlug && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/p/${data.workerSlug}?back=1`)}
            >
              Voir le profil du candidat
            </Button>
          )}

          <OfferCard app={data.application} />

          {(data.application.status === "PENDING" ||
            data.application.status === "VIEWED") && (
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-whatsapp text-white hover:bg-whatsapp-dark"
                onClick={goToPayment}
              >
                Accepter
              </Button>
              <Button
                variant="destructive-soft"
                className="flex-1"
                onClick={() => setConfirmReject(true)}
              >
                Refuser
              </Button>
            </div>
          )}

          {data.application.status === "WAITING_PAYMENT" &&
            !data.unlock?.employerPaid && (
              <Button
                className="w-full bg-whatsapp text-white hover:bg-whatsapp-dark"
                onClick={goToPayment}
              >
                Finaliser le paiement
              </Button>
            )}

          {data.application.status === "WAITING_PAYMENT" &&
            data.unlock?.employerPaid && (
              <div className="rounded-xl bg-whatsapp/10 p-4 text-center text-sm text-muted-foreground">
                Vous avez réglé votre part. Les coordonnées vous seront envoyées
                par WhatsApp dès que le travailleur aura payé sa part.
              </div>
            )}

          {data.application.status === "ACCEPTED" && (
            <div className="rounded-xl bg-whatsapp/10 p-4 text-center text-sm text-muted-foreground">
              Candidature acceptée. Les coordonnées sont partagées par WhatsApp
              une fois les deux parties payées.
            </div>
          )}

          {data.application.status === "REJECTED" && (
            <div className="rounded-xl bg-muted/60 p-4 text-center text-sm text-muted-foreground">
              Vous avez refusé cette candidature.
            </div>
          )}

          {data.application.status === "CANCELLED" && (
            <CancellationCard app={data.application} />
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title="Refuser la candidature ?"
        description="Le travailleur sera notifié. Cette action est définitive."
        actionLabel="Refuser"
        isPending={reject.isPending}
        onConfirm={() =>
          reject.mutate(undefined, {
            onSuccess: () => setConfirmReject(false),
          })
        }
      />
    </div>
  );
}

const WorkerCard = ({
  app,
}: Readonly<{ app: ApplicationDetailApplication }>) => {
  const { worker, status } = app;
  const initials =
    `${worker.firstName?.[0] ?? ""}${worker.lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <div className="rounded-xl shadow-soft bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 shrink-0">
          {worker.avatarUrl && (
            <AvatarImage
              src={worker.avatarUrl}
              alt={`${worker.firstName} ${worker.lastName}`}
              className="object-cover"
            />
          )}
          <AvatarFallback className="bg-muted font-semibold text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-foreground">
            {worker.firstName} {worker.lastName}
          </p>
          {worker.reliabilityScore !== null && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-whatsapp" />
              Fiabilité : {worker.reliabilityScore}%
            </p>
          )}
        </div>
        <Badge
          variant={getApplicationStatusVariant(status)}
          className="shrink-0 text-xs"
        >
          {APPLICATION_STATUS_LABELS[status] ?? status}
        </Badge>
      </div>
      {worker.description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {worker.description}
        </p>
      )}
    </div>
  );
};

/**
 * Why the worker withdrew. The motive is optional, so the card still explains
 * what happened when there is none — otherwise a cancelled application shows an
 * "Annulée" chip and nothing else, leaving the employer to guess.
 */
const CancellationCard = ({
  app,
}: Readonly<{ app: ApplicationDetailApplication }>) => (
  <div className="rounded-xl bg-destructive/10 p-4">
    <div className="flex items-center gap-2">
      <Ban className="h-4 w-4 shrink-0 text-destructive" />
      <p className="text-sm font-medium text-destructive">
        Candidature annulée par le travailleur
      </p>
    </div>

    {app.cancelledAt && (
      <p className="mt-1 pl-6 text-xs text-muted-foreground">
        Le {formatDate(app.cancelledAt)}
      </p>
    )}

    <p className="mt-3 pl-6 text-sm text-muted-foreground">
      {app.cancellationReason ? (
        <>
          <span className="font-medium text-foreground">Motif :</span>{" "}
          {app.cancellationReason}
        </>
      ) : (
        "Aucun motif n'a été indiqué."
      )}
    </p>
  </div>
);

const OfferCard = ({ app }: Readonly<{ app: ApplicationDetailApplication }>) => (
  <div className="rounded-xl shadow-soft bg-card p-4">
    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      Offre
    </p>
    <p className="font-semibold text-foreground">{app.jobOffer.title}</p>
    <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
      <p className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-whatsapp" />
        <span className="font-medium text-foreground">
          {formatAmount(app.jobOffer.amount)}
        </span>
      </p>
      <p className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        {formatDate(app.jobOffer.scheduledAt)}
      </p>
      <p className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        <span className="truncate">{app.jobOffer.address}</span>
      </p>
    </div>
  </div>
);

const DetailSkeleton = () => (
  <div className="space-y-4 px-4 py-4">
    <Skeleton className="h-24 w-full rounded-xl" />
    <Skeleton className="h-32 w-full rounded-xl" />
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
);
