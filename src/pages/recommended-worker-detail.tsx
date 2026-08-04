import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Star, ShieldCheck, CheckCircle2, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScreenHeader } from "@/features/employer";
import { useRecommendedWorker } from "@/hooks/use-recommendations";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycNotice, kycShortLabel } from "@/features/kyc";
import { ContactConfirmDrawer } from "@/features/employer/components/contact-confirm-drawer";

export default function RecommendedWorkerDetail() {
  const navigate = useNavigate();
  const { workerId = "" } = useParams<{ workerId: string }>();
  const { data, isLoading, isError } = useRecommendedWorker(workerId);
  const { blocked, reason } = useKycGate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [workerId]);

  const worker = data?.worker;
  const initials = worker
    ? `${worker.firstName?.[0] ?? ""}${worker.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Profil" onBack={() => navigate(-1)} />

      {isLoading && (
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && (isError || !worker) && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Impossible de charger ce profil.
          </p>
        </div>
      )}

      {!isLoading && worker && (
        <div className="space-y-4 px-4 py-4">
          <div className="rounded-xl bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16 shrink-0">
                {worker.avatarUrl && (
                  <AvatarImage
                    src={worker.avatarUrl}
                    alt={`${worker.firstName} ${worker.lastName}`}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-muted text-lg font-semibold text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-foreground">
                  {worker.firstName} {worker.lastName}
                </p>
                {worker.categoryName && (
                  <Badge className="mt-1 w-fit border-whatsapp/40 bg-whatsapp/10 text-whatsapp">
                    {worker.categoryName}
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {worker.ratingAvg !== null && worker.ratingCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {worker.ratingAvg.toFixed(1)} ({worker.ratingCount})
                </span>
              )}
              {worker.reliabilityScore !== null && (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-whatsapp" />
                  Fiabilité {worker.reliabilityScore}%
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-whatsapp" />
                {worker.completedMissions} mission
                {worker.completedMissions > 1 ? "s" : ""}
              </span>
            </div>

            {worker.description && (
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                {worker.description}
              </p>
            )}
          </div>

          {/* Contacting costs a fee and needs a verified identity — the same
              gate the worker's apply button carries. Without this the employer
              tapped Contacter and was bounced to a KYC screen with no warning. */}
          {blocked && reason && <KycNotice reason={reason} />}

          <Button
            className="w-full bg-whatsapp text-white hover:bg-whatsapp-dark"
            disabled={blocked}
            onClick={() => setConfirmOpen(true)}
          >
            {blocked && reason ? kycShortLabel(reason) : "Contacter"}
          </Button>

          <ContactConfirmDrawer
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            workerId={worker.id}
            workerName={`${worker.firstName} ${worker.lastName}`.trim()}
            onConfirm={() => navigate(`/recommandations/${worker.id}/contact`)}
          />

          {worker.portfolioSlug && (
            <Button
              className="w-full bg-whatsapp/10 text-whatsapp shadow-none hover:bg-whatsapp/20"
              onClick={() => navigate(`/p/${worker.portfolioSlug}?back=1`)}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Voir le portfolio
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
