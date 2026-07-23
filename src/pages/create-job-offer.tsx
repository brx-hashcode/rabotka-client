import { useState } from "react";
import { useNavigate } from "react-router";

import { Seo } from "@/hooks/use-seo";
import { useProfileMe } from "@/hooks/use-profile-me";
import { CreateJobOfferForm } from "@/features/jobs/components/create-job-offer-form";
import { JobOfferSuccess } from "@/features/jobs/components/job-offer-success";
import type { CreateJobOfferFormData } from "@/lib/validations/job-offer";

type Created = { reference: string; recap: CreateJobOfferFormData };

export default function CreateJobOffer() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfileMe();
  const [created, setCreated] = useState<Created | null>(null);

  if (!profileLoading && profile && profile.profileType !== "EMPLOYER") {
    navigate("/profile");
    return null;
  }

  return (
    <div className="pt-24 lg:pt-28 pb-8 px-4 md:px-8 flex flex-col max-w-2xl mx-auto w-full">
      <Seo title="Créer une offre — Rabotka" noIndex />

      {created ? (
        <JobOfferSuccess
          reference={created.reference}
          recap={created.recap}
          onCreateAnother={() => setCreated(null)}
        />
      ) : (
        <CreateJobOfferForm
          onCreated={(offer, recap) =>
            setCreated({ reference: offer.reference, recap })
          }
        />
      )}
    </div>
  );
}
