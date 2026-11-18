import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock } from "lucide-react";

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
          <StateCard
            icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
            title={content.verified.title}
            body={content.verified.body}
          />
        ) : status === "NOT_SUBMITTED" || status === "REJECTED" ? (
          <DocumentsForm
            rejected={status === "REJECTED"}
            rejectionReason={profile.rejectionReason ?? null}
          />
        ) : (
          // PENDING, and any status this client does not know yet: nothing
          // to send from here.
          <StateCard
            icon={<Clock className="h-6 w-6 text-amber-600" />}
            title={content.pending.title}
            body={content.pending.body}
          />
        )}
      </main>
    </div>
  );
}

function StateCard({
  icon,
  title,
  body,
}: Readonly<{ icon: React.ReactNode; title: string; body: string }>) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-card p-4">
      <div className="shrink-0">{icon}</div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
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
