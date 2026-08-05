import { useState } from "react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { kycShortLabel } from "@/features/kyc";
import { ContactConfirmDrawer } from "@/features/employer/components/contact-confirm-drawer";
import type { RecommendedWorker } from "@/lib/api/recommendation-controller";

export function RecommendedWorkerCard({
  worker,
}: Readonly<{ worker: RecommendedWorker }>) {
  const navigate = useNavigate();
  // Read here rather than threaded in as a prop: a free cache read, and the
  // same treatment job-card gives the worker's apply button.
  const { blocked, reason } = useKycGate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const initials =
    `${worker.firstName?.[0] ?? ""}${worker.lastName?.[0] ?? ""}`.toUpperCase();
  const aiScore = Math.round(worker.score * 100);

  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-4 shadow-soft">
      {/*
        The card body is the navigation target, mirroring job-card on the
        worker side: tapping anywhere opens the profile. Contacter stays a
        SIBLING of this button — nesting it would be invalid HTML and the outer
        button would swallow the tap, sending people to the profile instead of
        the confirm sheet.
      */}
      <button
        type="button"
        onClick={() => navigate(`/recommandations/${worker.id}`)}
        className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40 rounded-lg"
      >
      <div className="flex gap-3">
        <Avatar className="h-16 w-16 shrink-0">
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

        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-base font-bold text-foreground">
            {worker.firstName} {worker.lastName}
          </p>
          {worker.reliabilityScore !== null && (
            <p className="text-sm text-muted-foreground">
              Fiabilité : {worker.reliabilityScore}%
            </p>
          )}
          {aiScore > 0 && (
            <p className="text-sm text-muted-foreground">Score IA : {aiScore}%</p>
          )}
          {worker.completedMissions > 0 && (
            <p className="text-sm text-muted-foreground">
              Missions réalisées : {worker.completedMissions}
            </p>
          )}
        </div>
      </div>

      {worker.description && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {worker.description}
        </p>
      )}
      </button>

      {/*
        One button, so the rule is unambiguous: this charges you, everything
        else opens the profile. "Voir profil" went with the card becoming
        tappable — a second route to the same place is just clutter on a phone.
      */}
      <Button
        className="mt-4 w-full bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark"
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
    </div>
  );
}
