import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { FileText, Trash2 } from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { useProfileMe } from "@/hooks/use-profile-me";
import {
  useProfileCv,
  useRemoveProfileCv,
  useSetCvPreference,
} from "@/hooks/use-profile-cv";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadLink } from "@/components/common/download-link";
import { ScreenHeader } from "@/features/employer";
import { CvUploadButton } from "@/features/profile-cv/components/cv-upload-button";
import { ConfirmDialog } from "@/features/portfolio/components/confirm-dialog";
import {
  profileCvFileUrl,
  rabotkaCvUrl,
  type CvChoice,
} from "@/lib/api/profile-cv-controller";
import { formatFileSize } from "@/lib/profile-cv";
import { cn } from "@/lib/utils";

const CHOICES: { value: CvChoice; label: string }[] = [
  { value: "UPLOADED", label: "Mon CV" },
  { value: "RABOTKA", label: "CV Rabotka" },
];

/**
 * « Mon CV »: the worker's own CV, beside the one Rabotka builds. The Rabotka
 * CV only knows missions done here; theirs tells a recruiter the rest.
 */
export default function MyCv() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfileMe();
  const isWorker = profile?.profileType === "WORKER";
  const { data: cv, isLoading } = useProfileCv(isWorker);
  const remove = useRemoveProfileCv();
  const preference = useSetCvPreference();
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!profileLoading && profile && !isWorker) {
    return <Navigate to="/profile" replace />;
  }

  const uploaded = cv?.uploaded ?? null;

  return (
    <div className="flex min-h-full flex-col">
      <Seo title="Mon CV — Rabotka" noIndex />
      <ScreenHeader title="Mon CV" onBack={() => navigate("/profile")} />

      <div className="space-y-4 p-4">
        {isLoading || !cv ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : uploaded ? (
          <section className="space-y-4 rounded-xl bg-card p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-whatsapp/10 text-whatsapp-dark">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {uploaded.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploaded.sizeBytes)} · ajouté le{" "}
                  {new Date(uploaded.uploadedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DownloadLink href={profileCvFileUrl()} className="mr-auto">
                Voir mon CV
              </DownloadLink>
              <CvUploadButton label="Remplacer" variant="outline" />
              <Button
                type="button"
                variant="outline"
                disabled={remove.isPending}
                onClick={() => setConfirmRemove(true)}
                aria-label="Retirer mon CV"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </section>
        ) : (
          <section className="space-y-3 rounded-xl bg-card p-4 text-center shadow-soft">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-whatsapp/10 text-whatsapp-dark">
              <FileText className="size-6" />
            </span>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Ajoutez votre CV</p>
              <p className="text-sm text-muted-foreground">
                Votre expérience hors Rabotka compte : les recruteurs le lisent
                avec votre profil. PDF ou Word, 10 Mo au plus.
              </p>
            </div>
            <CvUploadButton className="w-full" />
          </section>
        )}

        {uploaded && cv && (
          <section className="space-y-2 rounded-xl bg-card p-4 shadow-soft">
            <p className="font-medium text-foreground">CV envoyé par défaut</p>
            <p className="text-sm text-muted-foreground">
              Celui qui part avec vos candidatures depuis WhatsApp. Dans
              l&apos;application, vous choisissez à chaque fois.
            </p>
            <div
              role="radiogroup"
              aria-label="CV envoyé par défaut"
              className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1"
            >
              {CHOICES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={cv.preferred === c.value}
                  disabled={preference.isPending}
                  onClick={() => preference.mutate(c.value)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    cv.preferred === c.value
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl bg-card p-4 shadow-soft">
          <div className="min-w-0 space-y-1 text-sm">
            <p className="font-medium text-foreground">Votre CV Rabotka</p>
            <p className="text-muted-foreground">
              Créé à partir de votre profil et de vos missions sur Rabotka.
            </p>
            <DownloadLink href={rabotkaCvUrl()}>Voir mon CV Rabotka</DownloadLink>
          </div>
        </section>

        <ConfirmDialog
          open={confirmRemove}
          onOpenChange={setConfirmRemove}
          title="Retirer votre CV ?"
          description="Vos prochaines candidatures partiront avec votre CV Rabotka. Celles déjà envoyées gardent le CV joint."
          actionLabel="Retirer mon CV"
          isPending={remove.isPending}
          onConfirm={() =>
            remove.mutate(undefined, {
              onSuccess: () => setConfirmRemove(false),
            })
          }
        />

        <p className="px-1 text-xs text-muted-foreground">
          Votre téléphone et votre e-mail figurent souvent sur votre CV : le
          recruteur ne l&apos;ouvre qu&apos;une fois votre contact débloqué ou
          votre candidature retenue.
        </p>
      </div>
    </div>
  );
}
