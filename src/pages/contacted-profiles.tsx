import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, Phone, ShieldCheck, Star, UserRoundSearch } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorState } from "@/components/common/query-error-state";
import { Seo } from "@/hooks/use-seo";
import { ScreenHeader } from "@/features/employer";
import { useContactedProfiles } from "@/hooks/use-contacted-profiles";
import type { ContactedProfile } from "@/lib/api/profile-controller";
import { formatDate } from "@/lib/utils";

/** Digits only — `tel:` and wa.me both choke on spaces and punctuation. */
function toDialable(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function ContactCard({ contact }: Readonly<{ contact: ContactedProfile }>) {
  const initials =
    `${contact.firstName?.[0] ?? ""}${contact.lastName?.[0] ?? ""}`.toUpperCase();
  const dialable = toDialable(contact.phone);

  return (
    <div className="bg-card shadow-soft flex flex-col gap-3 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Avatar className="size-12">
          <AvatarImage src={contact.avatarUrl ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">
            {contact.firstName} {contact.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {contact.origin === "MISSION" && contact.jobTitle
              ? `Mission · ${contact.jobTitle}`
              : "Recommandation"}{" "}
            · {formatDate(contact.unlockedAt)}
          </p>
        </div>

        {contact.reliabilityScore != null && (
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            {contact.reliabilityScore}
          </span>
        )}
      </div>

      {contact.description && (
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {contact.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {contact.categories.map((category) => (
          <Badge key={category} variant="secondary" className="text-[11px]">
            {category}
          </Badge>
        ))}
        {contact.ratingCount > 0 && contact.ratingAvg != null && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className="size-3 fill-current" />
            {contact.ratingAvg.toFixed(1)} ({contact.ratingCount})
          </span>
        )}
      </div>

      {/* The whole point of the page: the details this recruiter paid for. */}
      <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 text-sm">
        <a
          href={`tel:${dialable}`}
          className="flex items-center gap-2 font-medium"
        >
          <Phone className="size-4 shrink-0 text-muted-foreground" />
          {contact.phone}
        </a>
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 break-all"
        >
          <Mail className="size-4 shrink-0 text-muted-foreground" />
          {contact.email}
        </a>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() =>
          globalThis.open(
            `https://wa.me/${dialable.replace(/^\+/, "")}`,
            "_blank",
            "noopener,noreferrer",
          )
        }
      >
        <WhatsAppIcon className="size-4" />
        Écrire sur WhatsApp
      </Button>
    </div>
  );
}

export default function ContactedProfiles() {
  const navigate = useNavigate();
  const {
    data: contacts = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useContactedProfiles();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Seo
        title="Profils contactés - Rabotka"
        description="Retrouvez les profils dont vous avez débloqué le contact."
        canonical="/profils-contactes"
        noIndex
      />
      <div className="flex min-h-screen flex-col">
        <ScreenHeader title="Profils contactés" onBack={() => navigate(-1)} />

        {isLoading && (
          <div className="space-y-3 px-4 py-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && isError && (
          <QueryErrorState
            className="flex-1"
            message="Impossible de charger vos contacts."
            onRetry={refetch}
            isRetrying={isFetching}
          />
        )}

        {!isLoading && !isError && contacts.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <UserRoundSearch className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Vous n’avez encore débloqué aucun contact. Les profils que vous
              contactez apparaîtront ici, avec leur téléphone et leur e-mail.
            </p>
            <Button variant="outline" onClick={() => navigate("/recherche")}>
              Rechercher des profils
            </Button>
          </div>
        )}

        {!isLoading && contacts.length > 0 && (
          <div className="space-y-3 px-4 py-4">
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
