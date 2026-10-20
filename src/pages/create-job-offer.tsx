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
import { scrollToTop } from "@/lib/app-scroll";

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

  // The confirmation replaces the form inside the same page, so it needs its
  // own scroll to top. Arriving on the page is handled by ScrollRestoration.
  useEffect(() => {
    if (created) scrollToTop();
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
    // NO horizontal padding, at any width, and no `max-w` of its own.
    //
    // Both used to be responsive — `md:px-8` here, `lg:p-8` on the card — which
    // looks right until you remember what this page sits in. `AppShell` pins
    // every screen to a `max-w-lg` column, 512px on a desktop exactly as on a
    // phone, so a viewport breakpoint says nothing about the space this page
    // actually has. On a wide screen both fired at once: a 32px page gutter
    // around a card with 32px of its own padding, 64px a side out of 512, and
    // the fields paid for all of it.
    //
    // `max-w-2xl` (672px) was dead for the same reason — the column is 512.
    //
    // White to the edges, top to bottom: `bg-card` and `min-h-full` here, no
    // top padding, and `-mb-6` to sit over the 24px AppShell leaves under
    // <main> for the tab bar. A white block on the grey page left a grey band
    // above it and a grey field under a short form or the success screen.
    <div className="-mb-6 flex min-h-full w-full flex-col bg-card pb-8">
      <Seo title="Créer une offre — Rabotka" noIndex />
      {body}
    </div>
  );
}
