import { CreateClaimForm } from "@/features/claims/components/create-claim-form";

export default function CreateClaim() {
  return (
    <div className="pt-8 lg:pt-10 pb-8 px-4 md:px-8  flex flex-col max-w-2xl mx-auto w-full">
      <CreateClaimForm />
    </div>
  );
}
