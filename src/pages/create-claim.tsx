import { CreateClaimForm } from "@/features/claims/components/create-claim-form";

export default function CreateClaim() {
  return (
    // NO horizontal padding, at any width, and no `max-w` of its own — the
    // same correction the create-offer page needed, for the same reason.
    //
    // This had `px-4 md:px-8` around a card carrying `p-4 lg:p-8`, so the
    // gutter was paid twice: 32px a side on a phone, 64px on anything wide.
    // And `AppShell` pins every screen to a `max-w-lg` column — 512px on a
    // desktop exactly as on a phone — so a viewport breakpoint said nothing
    // about the space this page actually had, and `max-w-2xl` (672px) could
    // never apply at all.
    <div className="flex w-full flex-col pt-4 pb-8">
      <CreateClaimForm />
    </div>
  );
}
