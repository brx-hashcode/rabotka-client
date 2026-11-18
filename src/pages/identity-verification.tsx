import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronRight,
  Clock,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NativeSelect } from "@/components/ui/native-select";
import { ScreenHeader } from "@/features/employer";
import { FileUploadZone } from "@/features/onboarding/components/file-upload-zone";
import { kycDocumentsContent, kycDocumentGuidance } from "@/content/onboarding";
import { kycVerificationContent as content } from "@/content/kyc";
import { compressImage } from "@/lib/image-compress";
import { step3SchemaBase } from "@/lib/validations/onboarding";
import {
  KYC_DOCUMENT_TYPE_OPTIONS,
  requiresBackSide,
  type DocumentType,
} from "@/lib/kyc-document-types";
import { kycUploadState } from "@/lib/kyc-upload-state";
import { serverMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { submitMyKyc, uploadMyKycFile } from "@/lib/api/profile-controller";

type Field = "kycDocument" | "kycDocumentBack" | "kycSelfie";

type Upload = {
  preview: string | null;
  name: string | null;
  url: string | null;
  key: string | null;
  uploading: boolean;
  error: string | null;
};

const EMPTY: Upload = {
  preview: null,
  name: null,
  url: null,
  key: null,
  uploading: false,
  error: null,
};

const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Profil › Vérification d'identité.
 *
 * Where a person who signed up without their documents (« Plus tard »,
 * NOT_SUBMITTED) sends them, and where a refused one sends new ones. Under
 * review or verified, it only says so. Every « send your documents » link in
 * the app, the bot's card and the rejection message lead here.
 */
export default function IdentityVerification() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfileMe();
  const status = profile?.verificationStatus;
  const role: Role = profile?.profileType === "EMPLOYER" ? "employer" : "worker";

  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader title={content.title} onBack={() => navigate("/profile")} />
      <Seo title={content.seoTitle} noIndex />

      <main className="space-y-5 px-4 pt-2 pb-8">
        {isLoading || !profile ? (
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : status === "VERIFIED" ? (
          <VerifiedState role={role} />
        ) : status === "NOT_SUBMITTED" || status === "REJECTED" ? (
          <DocumentsForm
            rejected={status === "REJECTED"}
            rejectionReason={profile.rejectionReason ?? null}
          />
        ) : (
          // PENDING, and any status this client does not know yet: nothing
          // to send from here.
          <PendingState role={role} />
        )}
      </main>
    </div>
  );
}

type Role = "worker" | "employer";

/** The state at a glance: a round icon, a title and one sentence. */
function StatusHeader({
  tone,
  icon: Icon,
  title,
  body,
}: Readonly<{
  tone: "amber" | "green";
  icon: LucideIcon;
  title: string;
  body: string;
}>) {
  return (
    <section className="flex flex-col items-center rounded-2xl bg-card px-5 py-6 text-center">
      <div
        className={cn(
          "mb-3 flex size-14 items-center justify-center rounded-full",
          tone === "amber" ? "bg-amber-100" : "bg-green-100",
        )}
      >
        <Icon
          aria-hidden
          className={cn(
            "size-7",
            tone === "amber" ? "text-amber-600" : "text-green-600",
          )}
        />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </section>
  );
}

/**
 * Sent, waiting for a reviewer: where the file stands, and what is worth
 * doing meanwhile — a page that only said « reçus » left nothing to do but
 * leave.
 */
function PendingState({ role }: Readonly<{ role: Role }>) {
  const steps = content.pending.steps;
  return (
    <div className="space-y-5">
      <StatusHeader
        tone="amber"
        icon={Clock}
        title={content.pending.title}
        body={content.pending.body}
      />

      <section className="rounded-2xl bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {content.pending.timelineTitle}
        </h3>
        <ol>
          <TimelineStep tone="done" icon={Check} {...steps.sent} />
          <TimelineStep tone="current" icon={Clock} {...steps.review} />
          <TimelineStep tone="next" icon={ShieldCheck} {...steps.active[role]} last />
        </ol>
      </section>

      <section className="space-y-2">
        <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {content.pending.meanwhileTitle}
        </h3>
        <div className="overflow-hidden rounded-2xl bg-card">
          {content.pending.meanwhile[role].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 active:bg-muted/60"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.hint}</p>
              </div>
              <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function TimelineStep({
  tone,
  icon: Icon,
  title,
  body,
  last = false,
}: Readonly<{
  tone: "done" | "current" | "next";
  icon: LucideIcon;
  title: string;
  body: string;
  last?: boolean;
}>) {
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!last && (
        <span
          aria-hidden
          className="absolute top-9 bottom-0 left-[1.125rem] w-px bg-border"
        />
      )}
      <div
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center rounded-full",
          tone === "done" && "bg-green-100 text-green-600",
          tone === "current" && "bg-amber-100 text-amber-600",
          tone === "next" && "bg-muted text-muted-foreground",
        )}
      >
        <Icon aria-hidden className="size-4" />
      </div>
      <div className="min-w-0 pt-1">
        <p
          className={cn(
            "text-sm font-semibold",
            tone === "next" ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </li>
  );
}

/** Verified: the good news, and the one thing it unlocks. */
function VerifiedState({ role }: Readonly<{ role: Role }>) {
  const navigate = useNavigate();
  const action = content.verified.action[role];
  return (
    <div className="space-y-5">
      <StatusHeader
        tone="green"
        icon={ShieldCheck}
        title={content.verified.title}
        body={content.verified.body}
      />
      <Button
        className="w-full"
        variant="whatsapp"
        size="lg"
        onClick={() => navigate(action.to)}
      >
        {action.label}
      </Button>
    </div>
  );
}

function DocumentsForm({
  rejected,
  rejectionReason,
}: Readonly<{ rejected: boolean; rejectionReason: string | null }>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [documentType, setDocumentType] =
    useState<DocumentType>("IDENTITY_CARD");
  const [files, setFiles] = useState<Record<Field, Upload>>({
    kycDocument: EMPTY,
    kycDocumentBack: EMPTY,
    kycSelfie: EMPTY,
  });

  const needsBack = requiresBackSide(documentType);
  const patch = (field: Field, next: Partial<Upload>) =>
    setFiles((prev) => ({ ...prev, [field]: { ...prev[field], ...next } }));

  const select = useCallback(async (file: File, field: Field) => {
    const check = step3SchemaBase.shape[field].safeParse(file);
    if (!check.success) {
      patch(field, {
        error: check.error.errors[0]?.message ?? content.uploadFailed,
      });
      return;
    }
    const compressed = await compressImage(file);
    patch(field, {
      preview: URL.createObjectURL(compressed),
      name: compressed.name,
      url: null,
      key: null,
      uploading: true,
      error: null,
    });
    try {
      const { url, key } = await uploadMyKycFile(compressed);
      patch(field, { url, key, uploading: false });
    } catch (error) {
      patch(field, {
        uploading: false,
        error: serverMessage(error) ?? content.uploadFailed,
      });
    }
  }, []);

  const remove = (field: Field) => {
    const preview = files[field].preview;
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    patch(field, EMPTY);
  };

  const submit = useMutation({
    mutationFn: () =>
      submitMyKyc({
        documentType,
        kycDocumentUrl: files.kycDocument.url ?? "",
        kycDocumentKey: files.kycDocument.key ?? undefined,
        kycDocumentBackUrl: needsBack
          ? (files.kycDocumentBack.url ?? undefined)
          : undefined,
        kycDocumentBackKey: needsBack
          ? (files.kycDocumentBack.key ?? undefined)
          : undefined,
        kycSelfieUrl: files.kycSelfie.url ?? "",
        kycSelfieKey: files.kycSelfie.key ?? undefined,
      }),
    onSuccess: async () => {
      toast({ description: content.submitted });
      // The page and every gate read the status off this query.
      await queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: serverMessage(error) ?? content.submitFailed,
      });
      // A 409 means the status moved elsewhere (sent from another tab):
      // refresh so the page shows where it stands.
      void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });

  const complete =
    kycUploadState({
      documentType,
      kycDocumentUrl: files.kycDocument.url,
      kycDocumentBackUrl: needsBack ? files.kycDocumentBack.url : null,
      kycSelfieUrl: files.kycSelfie.url,
    }) === "complete";
  const anyUploading = Object.values(files).some((f) => f.uploading);

  const guidance = kycDocumentGuidance[documentType];
  const zones = kycDocumentsContent.documents;
  const zone = (field: Field, copy: { label: string; description: string }, type: "document" | "selfie") => (
    <FileUploadZone
      onFileSelect={(file) => void select(file, field)}
      preview={files[field].preview}
      fileName={files[field].name}
      onRemove={() => remove(field)}
      accept="image/*"
      maxSize={MAX_SIZE}
      label={copy.label}
      description={copy.description}
      helperText={zones[field].helperText}
      error={files[field].error ?? undefined}
      type={type}
      uploading={files[field].uploading}
    />
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {rejected ? content.rejected.intro : content.missing.intro}
      </p>

      {rejected && rejectionReason?.trim() && (
        <div className="rounded-xl bg-destructive/10 px-3 py-2.5 text-sm">
          <p className="font-medium text-destructive">
            {content.rejected.reasonLabel}
          </p>
          <p className="whitespace-pre-line text-muted-foreground">
            {rejectionReason.trim()}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium">
          {kycDocumentsContent.documentType.label}
        </p>
        <NativeSelect
          options={KYC_DOCUMENT_TYPE_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label.toLocaleUpperCase("fr-FR"),
          }))}
          value={documentType}
          placeholder={kycDocumentsContent.documentType.placeholder}
          onValueChange={(value) => {
            if (!value) return;
            setDocumentType(value as DocumentType);
            // A passport has no back: drop one already chosen.
            if (!requiresBackSide(value as DocumentType)) {
              remove("kycDocumentBack");
            }
          }}
        />
      </div>

      {zone("kycDocument", guidance?.front ?? zones.kycDocument, "document")}
      {needsBack &&
        zone(
          "kycDocumentBack",
          guidance?.back ?? zones.kycDocumentBack,
          "document",
        )}
      {zone("kycSelfie", guidance?.selfie ?? zones.kycSelfie, "selfie")}

      <Button
        className="w-full"
        variant="whatsapp"
        size="lg"
        disabled={!complete || anyUploading || submit.isPending}
        onClick={() => submit.mutate()}
      >
        {submit.isPending ? content.submitting : content.submit}
      </Button>
    </div>
  );
}
