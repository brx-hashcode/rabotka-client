import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Loader2 } from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { useJobOffer } from "@/hooks/use-job-offer";
import { useUpdateJobOffer } from "@/hooks/use-update-job-offer";
import { useAccountGate } from "@/hooks/use-account-gate";
import { AccountNotice } from "@/features/account";
import { JobOfferForm } from "@/features/jobs/components/create-job-offer-form";
import { offerToFormValues, toUpdatePayload } from "@/lib/job-offer-form";
import { composeScheduledAt } from "@/lib/scheduled-at";
import { jobOfferSchema } from "@/lib/validations/job-offer";

/**
 * The employer's edit of one of their own offers, allowed while it is ACTIVE.
 * The server re-checks everything; candidates are told when the pay, date or
 * place changes.
 */
export default function EditJobOffer() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: offer, isLoading } = useJobOffer(id);
  const { mutate: updateOffer, isPending } = useUpdateJobOffer(id);
  const { blocked: accountBlocked, reason: accountReason } = useAccountGate();

  const initialValues = useMemo(
    () => (offer ? offerToFormValues(offer) : null),
    [offer],
  );
  // Keeping the offer's current date is always allowed, however close it now
  // is — only a new one must be 4h ahead.
  const schema = useMemo(
    () =>
      jobOfferSchema({
        keepSchedule: initialValues
          ? composeScheduledAt(
              initialValues.scheduledDate,
              initialValues.scheduledTime,
            )
          : undefined,
      }),
    [initialValues],
  );

  // Back to the detail that opened this form, so the detail's own « ← »
  // leaves the offer instead of landing here again — pushing a new detail
  // entry would leave this page in the history behind it. Opened directly,
  // there is no such entry: then replace this page with the detail.
  const backToDetail = () => {
    if (location.key !== "default") navigate(-1);
    else navigate(`/job-offers/${id}`, { replace: true });
  };

  let body: React.ReactNode;
  if (accountBlocked && accountReason) {
    body = <AccountNotice reason={accountReason} />;
  } else if (isLoading) {
    body = (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  } else if (!offer || !initialValues) {
    body = <p className="p-4 text-muted-foreground">Offre introuvable.</p>;
  } else if (offer.status !== "ACTIVE") {
    body = (
      <p className="p-4 text-muted-foreground">
        Seule une offre active peut être modifiée.
      </p>
    );
  } else {
    body = (
      <JobOfferForm
        heading="Modifier l'offre"
        initialValues={initialValues}
        schema={schema}
        submitLabel="Enregistrer"
        pendingLabel="Enregistrement…"
        cancelTo={`/job-offers/${id}`}
        onCancel={backToDetail}
        isPending={isPending}
        onSubmit={(data) =>
          updateOffer(toUpdatePayload(data, initialValues), {
            onSuccess: backToDetail,
          })
        }
      />
    );
  }

  return (
    // Same frame as the create page: AppShell already sets the column.
    <div className="-mb-6 flex min-h-full w-full flex-col bg-card pb-8">
      <Seo title="Modifier l'offre — Rabotka" noIndex />
      {body}
    </div>
  );
}
