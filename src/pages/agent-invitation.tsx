import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Globe,
  Handshake,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ScreenHeader,
  PAYMENT_FLOW_LABELS,
  isClosedToApplications,
} from "@/features/employer";
import { AccountNotice, accountShortLabel } from "@/features/account";
import { KycNotice, kycShortLabel } from "@/features/kyc";
import {
  acceptButton,
  invitationState,
} from "@/features/agent-invites/invitation-state";
import {
  useAcceptInvite,
  useAgentInvite,
  useDeclineInvite,
} from "@/hooks/use-agent-invite";
import { useAccountGate } from "@/hooks/use-account-gate";
import { useCanApply } from "@/hooks/use-jobs";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { serverMessage } from "@/lib/api/errors";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/employment-type";
import {
  jobLocationLabel,
  jobLocationRegion,
  REMOTE_LOCATION_LABEL,
} from "@/lib/job-location";
import { formatDateTime, formatOfferAmount } from "@/lib/utils";

/**
 * Where a worker answers a Rabotka agent's invitation — the link the agent
 * sent after calling them. Accepting applies to the job exactly as the offer
 * screen would; declining tells the agent no.
 */
export default function AgentInvitation() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { data: invite, isLoading, isError, error } = useAgentInvite(token);
  const accept = useAcceptInvite(token);
  const decline = useDeclineInvite(token);
  const [confirmDecline, setConfirmDecline] = useState(false);

  const { blocked: kycBlocked, reason: kycReason } = useKycGate();
  const { blocked: accountBlocked, reason: accountReason } = useAccountGate();
  const { quota } = useCanApply();

  return (
    <div className="flex min-h-screen flex-col">
      <ScreenHeader title="Invitation" onBack={() => navigate("/home")} />

      {isLoading && (
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && (isError || !invite) && (
        <StateScreen
          icon={<XCircle className="h-10 w-10 text-muted-foreground" />}
          title="Invitation introuvable"
          text={
            serverMessage(error) === "Invitation introuvable" || !serverMessage(error)
              ? "Ce lien ne correspond pas à votre compte, ou il a été remplacé. Vérifiez que vous êtes connecté avec le numéro que l'agent a appelé."
              : serverMessage(error)!
          }
          action={{ label: "Voir les offres", to: "/home" }}
        />
      )}

      {!isLoading && invite && (() => {
        const state = invitationState(invite);
        const agentName = invite.agent?.firstName ?? "Un agent";

        if (state.kind === "accepted") {
          return (
            <StateScreen
              icon={<CheckCircle2 className="h-10 w-10 text-whatsapp" />}
              title="Candidature envoyée"
              text={`Vous avez accepté l'invitation de ${agentName} et postulé à « ${invite.job.title} ». L'employeur va étudier votre candidature : vous serez prévenu sur WhatsApp.`}
              action={
                state.applicationId
                  ? {
                      label: "Voir ma candidature",
                      to: `/applications/${state.applicationId}`,
                    }
                  : { label: "Mes candidatures", to: "/mes-candidatures" }
              }
            />
          );
        }
        if (state.kind === "declined") {
          return (
            <StateScreen
              icon={<XCircle className="h-10 w-10 text-muted-foreground" />}
              title="Invitation refusée"
              text={`Vous avez refusé cette offre. ${agentName} pourra vous proposer d'autres missions.`}
              action={{ label: "Voir les offres", to: "/home" }}
            />
          );
        }
        if (state.kind === "expired") {
          return (
            <StateScreen
              icon={<Clock className="h-10 w-10 text-muted-foreground" />}
              title="Invitation expirée"
              text={`Ce lien n'est plus valable. Si l'offre vous intéresse toujours, demandez un nouveau lien à ${agentName}, ou cherchez-la parmi les offres.`}
              action={{ label: "Voir les offres", to: "/home" }}
            />
          );
        }
        if (state.kind === "closed") {
          return (
            <StateScreen
              icon={<XCircle className="h-10 w-10 text-muted-foreground" />}
              title="Invitation retirée"
              text="Cette invitation n'est plus active."
              action={{ label: "Voir les offres", to: "/home" }}
            />
          );
        }

        const job = invite.job;
        const region = jobLocationRegion(job);
        const button = acceptButton({
          offerClosed: isClosedToApplications(job),
          accountBlockedLabel:
            accountBlocked && accountReason ? accountShortLabel(accountReason) : null,
          kycBlockedLabel: kycBlocked && kycReason ? kycShortLabel(kycReason) : null,
          dailyExhausted: quota != null && quota.remaining <= 0,
          tooManyActive: false,
        });
        const busy = accept.isPending || decline.isPending;

        return (
          <div className="space-y-4 px-4 py-4 pb-8">
            <div className="rounded-xl bg-whatsapp/10 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white">
                  <Handshake className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {agentName}, agent Rabotka, vous propose cette offre
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Cette invitation est personnelle
                    {invite.expiresAt
                      ? ` et valable jusqu'au ${formatDateTime(invite.expiresAt)}`
                      : ""}
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card p-4 shadow-soft">
              <h2 className="text-lg font-bold leading-snug text-foreground">
                {job.title}
              </h2>
              {job.category && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {job.category.name}
                </p>
              )}
            </div>

            <Section title="Informations">
              {job.amount != null && (
                <InfoRow
                  icon={<Coins className="h-4 w-4 text-whatsapp" />}
                  label="Rémunération"
                >
                  <span className="font-medium text-foreground">
                    {formatOfferAmount(job.amount)}
                  </span>{" "}
                  {(job.paymentFlow && PAYMENT_FLOW_LABELS[job.paymentFlow]) ?? ""}
                </InfoRow>
              )}
              <InfoRow
                icon={<FileText className="h-4 w-4 text-whatsapp" />}
                label="Type de contrat"
              >
                {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
              </InfoRow>
              {job.scheduledAt && (
                <InfoRow
                  icon={<Calendar className="h-4 w-4 text-whatsapp" />}
                  label="Date de clôture"
                >
                  {formatDateTime(job.scheduledAt)}
                </InfoRow>
              )}
              {job.isRemote ? (
                <InfoRow
                  icon={<Globe className="h-4 w-4 text-whatsapp" />}
                  label="Lieu"
                >
                  <span className="font-medium text-foreground">
                    {REMOTE_LOCATION_LABEL}
                  </span>
                </InfoRow>
              ) : (
                <>
                  <InfoRow
                    icon={<MapPin className="h-4 w-4 text-whatsapp" />}
                    label="Adresse"
                  >
                    {jobLocationLabel(job)}
                  </InfoRow>
                  {region && (
                    <InfoRow
                      icon={<Building2 className="h-4 w-4 text-whatsapp" />}
                      label="Ville"
                    >
                      {region}
                    </InfoRow>
                  )}
                </>
              )}
            </Section>

            {job.description && (
              <Section title="Description">
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {job.description}
                </p>
              </Section>
            )}

            {job.note && (
              <Section title="Précisions du recruteur">
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {job.note}
                </p>
              </Section>
            )}

            <Section title="Comment ça marche">
              <ol className="space-y-2 text-sm leading-relaxed text-foreground">
                <li>1. En acceptant, vous postulez à cette offre.</li>
                <li>2. L'employeur étudie votre candidature.</li>
                <li>
                  3. S'il vous retient, vous réglez les frais de mise en
                  relation pour recevoir son contact, comme pour toute
                  candidature Rabotka.
                </li>
              </ol>
            </Section>

            {accountBlocked && accountReason ? (
              <AccountNotice reason={accountReason} />
            ) : (
              kycBlocked && kycReason && <KycNotice reason={kycReason} />
            )}

            <div className="space-y-2">
              <Button
                className="w-full bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark"
                disabled={button.disabled || busy}
                onClick={() => accept.mutate()}
              >
                {accept.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {button.label}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                disabled={busy}
                onClick={() => setConfirmDecline(true)}
              >
                Ça ne m'intéresse pas
              </Button>
            </div>

            <Drawer open={confirmDecline} onOpenChange={setConfirmDecline}>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Refuser cette offre ?</DrawerTitle>
                  <DrawerDescription>
                    {agentName} sera prévenu. Vous pourrez toujours postuler à
                    d'autres offres.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button
                    variant="destructive"
                    disabled={decline.isPending}
                    onClick={() =>
                      decline.mutate(undefined, {
                        onSettled: () => setConfirmDecline(false),
                      })
                    }
                  >
                    {decline.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Refuser l'offre
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmDecline(false)}
                  >
                    Annuler
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        );
      })()}
    </div>
  );
}

function StateScreen({
  icon,
  title,
  text,
  action,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  text: string;
  action: { label: string; to: string };
}>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon}
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>
      <Button asChild className="mt-2 bg-whatsapp text-white hover:bg-whatsapp">
        <Link to={action.to}>{action.label}</Link>
      </Button>
    </div>
  );
}

const Section = ({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) => (
  <section className="rounded-xl bg-card p-4 shadow-soft">
    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {title}
    </p>
    {children}
  </section>
);

const InfoRow = ({
  icon,
  label,
  children,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}>) => (
  <div className="flex items-start gap-3 py-1.5">
    <div className="mt-0.5 shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{children}</p>
    </div>
  </div>
);
