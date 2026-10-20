import { useNavigate } from "react-router";
import {
  Building2,
  FileWarning,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";

import { Seo } from "@/hooks/use-seo";
import { useProfileMe } from "@/hooks/use-profile-me";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { Skeleton } from "@/components/ui/skeleton";
import { KycNotice } from "@/features/kyc";
import { ScreenHeader } from "@/features/employer";
import { DomainBadges } from "@/features/profile/components/domain-badges";
import { EditProfileSheetButton } from "@/features/profile/components/edit-profile-sheet-button";
import type { ProfileMeResponse } from "@/lib/api/profile-controller";

/**
 * The profile's facts — bio, domains, contact details, verification — on a
 * screen of their own. They used to fill most of the profile tab, above the
 * links people actually came for; this is where you check them, not where you
 * start your day.
 */
export default function ProfileDetails() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfileMe();
  const { blocked: kycBlocked, reason: kycReason } = useKycGate();

  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader
        title="Mes informations"
        onBack={() => navigate("/profile")}
        action={profile ? <EditProfileSheetButton profile={profile} inline /> : undefined}
      />
      <Seo title="Mes informations — Rabotka" noIndex />

      <main className="space-y-5 px-4 pt-2">
        {isLoading || !profile ? (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <>
            <Section title="À propos">
              <p className="whitespace-pre-line px-4 py-3 text-sm leading-relaxed text-foreground">
                {profile.description || (
                  <span className="text-muted-foreground">
                    Décrivez votre métier en quelques mots.
                  </span>
                )}
              </p>
            </Section>

            <Section title="Domaines">
              <div className="px-4 py-3">
                {(profile.categoryNames ?? []).length > 0 ? (
                  <DomainBadges names={profile.categoryNames} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucun domaine sélectionné
                  </p>
                )}
              </div>
            </Section>

            <Section title="Coordonnées">
              {/* The phone IS the WhatsApp number — every login link and
                  notification goes there. Optional fields only when set: a
                  « Non renseigné » row reads as something to go and fix. */}
              <InfoRow icon={Phone} label="Numéro WhatsApp" value={profile.phone} />
              {profile.directPhone && (
                <InfoRow icon={Phone} label="Numéro direct" value={profile.directPhone} />
              )}
              {profile.email && (
                <InfoRow icon={Mail} label="E-mail" value={profile.email} />
              )}
              {profile.countryName && (
                <InfoRow icon={Globe} label="Pays" value={profile.countryName} />
              )}
              {profile.city && (
                <InfoRow icon={Building2} label="Ville" value={profile.city} />
              )}
              {profile.address && (
                <InfoRow icon={MapPin} label="Adresse" value={profile.address} />
              )}
            </Section>

            <Section title="Compte">
              <InfoRow
                icon={Shield}
                label="Vérification d'identité"
                value={verificationLabel(profile.verificationStatus)}
              />
              {profile.profileType === "WORKER" && (
                <InfoRow
                  icon={FileWarning}
                  label="Pénalités"
                  value={penaltiesLabel(profile)}
                />
              )}
              {kycBlocked && kycReason && (
                <div className="p-4">
                  <KycNotice reason={kycReason} />
                </div>
              )}
            </Section>
          </>
        )}
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="overflow-hidden rounded-xl bg-card">{children}</div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: Readonly<{ icon: React.ElementType; label: string; value: string }>) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-whatsapp" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function verificationLabel(status: ProfileMeResponse["verificationStatus"]) {
  switch (status) {
    case "VERIFIED":
      return "Vérifiée";
    case "PENDING":
      return "En attente";
    case "REJECTED":
      return "Refusée";
    default:
      return "Inconnue";
  }
}

function penaltiesLabel(profile: ProfileMeResponse) {
  const n = profile.penaltiesCount;
  const unpaid = profile.unpaidPenaltiesCount;
  const base = `${n} pénalité${n > 1 ? "s" : ""}`;
  return unpaid > 0 ? `${base} (${unpaid} impayée${unpaid > 1 ? "s" : ""})` : base;
}
