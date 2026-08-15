import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Seo } from "@/hooks/use-seo";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { KycNotice } from "@/features/kyc";
import { useAccountGate } from "@/hooks/use-account-gate";
import { AccountNotice } from "@/features/account";
import { CreateJobOfferForm } from "@/features/jobs/components/create-job-offer-form";
import { JobOfferSuccess } from "@/features/jobs/components/job-offer-success";
import type { CreateJobOfferFormData } from "@/lib/validations/job-offer";

type Created = { reference: string; recap: CreateJobOfferFormData };

export default function CreateJobOffer() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfileMe();
  const { blocked, reason } = useKycGate();
  // The server has always refused a non-ACTIVE employer here
  // (`JobOfferService.create`), but nothing said so until the form was
  // submitted. Account first: a suspension outranks an unverified identity.
  const { blocked: accountBlocked, reason: accountReason } = useAccountGate();
  const [created, setCreated] = useState<Created | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [created]);

  if (!profileLoading && profile && profile.profileType !== "EMPLOYER") {
    navigate("/profile");
    return null;
  }

  // Resolved before the created/form branch on purpose: "Créer une autre offre"
  // only calls setCreated(null) — it never navigates — so a mount-time guard
  // would let the form come back for a blocked user.
  let body: React.ReactNode;
  if (accountBlocked && accountReason) {
    body = <AccountNotice reason={accountReason} />;
  } else if (blocked && reason) {
    body = <KycNotice reason={reason} />;
  } else if (created) {
    body = (
      <JobOfferSuccess
        reference={created.reference}
        recap={created.recap}
        onCreateAnother={() => setCreated(null)}
      />
    );
  } else {
    body = (
      <CreateJobOfferForm
        onCreated={(offer, recap) =>
          setCreated({ reference: offer.reference, recap })
        }
      />
    );
  }

  return (
    <div className="pt-8 lg:pt-10 pb-8 px-4 md:px-8 flex flex-col max-w-2xl mx-auto w-full">
      <Seo title="Créer une offre — Rabotka" noIndex />
      {body}
    </div>
  );
}
