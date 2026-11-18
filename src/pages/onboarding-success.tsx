import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import {
  Briefcase,
  Camera,
  Check,
  Clock,
  Gift,
  IdCard,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/hooks/use-seo";
import { cn } from "@/lib/utils";
import { statusPagesContent } from "@/content/onboarding/modals";

const content = statusPagesContent.success;

/** How a step reads: done, the one to do now, to do, waiting on us, or later. */
type StepTone = "done" | "next" | "todo" | "waiting" | "later";

type Step = Readonly<{
  icon: LucideIcon;
  title: string;
  body: string;
  tone: StepTone;
}>;

const TONE: Record<StepTone, { circle: string; icon: string; title: string }> =
  {
    done: {
      circle: "bg-green-100",
      icon: "text-green-600",
      title: "text-foreground",
    },
    next: {
      circle: "bg-whatsapp",
      icon: "text-white",
      title: "text-foreground",
    },
    todo: {
      circle: "bg-amber-100",
      icon: "text-amber-600",
      title: "text-amber-900",
    },
    waiting: {
      circle: "bg-sky-100",
      icon: "text-sky-600",
      title: "text-foreground",
    },
    later: {
      circle: "bg-muted",
      icon: "text-muted-foreground",
      title: "text-muted-foreground",
    },
  };

/**
 * Right after sign-up: what is done, and what comes next, in order.
 *
 * The identity step is the one that differs. Documents sent: an agent is on it,
 * and WhatsApp will say when. « Plus tard » (`?documents=later`): nothing is
 * under review, it is the person's to do — so it says what to send and where,
 * rather than promising an activation that is not on its way.
 */
export default function OnboardingSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const creditAmount = Number(params.get("credit") ?? 0);
  const documentsLater = params.get("documents") === "later";

  const steps: Step[] = [
    { icon: Check, tone: "done", ...content.steps.account },
    { icon: Camera, tone: "next", ...content.steps.photo },
    documentsLater
      ? { icon: IdCard, tone: "todo", ...content.steps.identityToSend }
      : { icon: Clock, tone: "waiting", ...content.steps.identityPending },
    { icon: Briefcase, tone: "later", ...content.steps.work },
  ];

  return (
    <>
      <Seo title="Compte créé - Rabotka" noIndex />
      <div className="min-h-dvh bg-background">
        <div className="flex min-h-dvh w-full flex-col px-6 pt-[max(0px,calc(2rem-env(safe-area-inset-top)))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-1 flex-col gap-5 py-6">
            <motion.header
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                <Check className="size-8 text-green-600" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {content.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {content.subtitle}
              </p>
            </motion.header>

            {creditAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-3 shadow-soft"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
                  <Gift className="size-5 text-green-600" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-green-700">
                    {content.creditLabel}
                  </p>
                  <p className="text-lg font-bold leading-tight text-green-800">
                    {creditAmount.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
                <p className="max-w-[9rem] text-right text-xs text-green-700">
                  {content.creditHint}
                </p>
              </motion.div>
            )}

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl bg-card p-4 shadow-soft"
              aria-labelledby="next-steps"
            >
              <h2
                id="next-steps"
                className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {content.nextTitle}
              </h2>
              <ol>
                {steps.map((step, index) => (
                  <StepRow
                    key={step.title}
                    step={step}
                    last={index === steps.length - 1}
                  />
                ))}
              </ol>
            </motion.section>

            {email && (
              <p className="wrap-break-word text-center text-xs text-muted-foreground">
                {content.emailSent.replace("{profile_email}", email)}
              </p>
            )}
          </div>

          <Button
            className="w-full"
            variant="whatsapp"
            size="lg"
            onClick={() => navigate("/onboarding/avatar")}
          >
            {content.button}
          </Button>
        </div>
      </div>
    </>
  );
}

function StepRow({ step, last }: Readonly<{ step: Step; last: boolean }>) {
  const tone = TONE[step.tone];
  const Icon = step.icon;
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {/* The thread between steps, behind the circles. */}
      {!last && (
        <span
          aria-hidden
          className="absolute top-9 bottom-0 left-[1.125rem] w-px bg-border"
        />
      )}
      <div
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center rounded-full",
          tone.circle,
        )}
      >
        <Icon className={cn("size-4", tone.icon)} aria-hidden />
      </div>
      <div className="min-w-0 pt-1">
        <p className={cn("text-sm font-semibold", tone.title)}>{step.title}</p>
        <p className="text-sm text-muted-foreground">{step.body}</p>
      </div>
    </li>
  );
}
