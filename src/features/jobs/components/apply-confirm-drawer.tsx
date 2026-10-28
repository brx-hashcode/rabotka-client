import { useState } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useApplicationTerms } from "@/hooks/use-application-terms";
import { useJobDetail } from "@/hooks/use-jobs";
import type { ApplyAnswer, ApplyQuestion } from "@/lib/api/job-feed-controller";
import { cn } from "@/lib/utils";
import { useProfileMe } from "@/hooks/use-profile-me";
import { formatDateTime, formatOfferAmount } from "@/lib/utils";

type Props = {
  /** The offer: its questions, if any, are asked here before applying. */
  readonly jobOfferId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  /** Null for a CDI, CDD or stage — formatDateTime renders «—». */
  readonly scheduledAt: string | null;
  readonly address: string;
  readonly amount?: number | null;
  readonly isPending?: boolean;
  /** `answers` is set only when the offer asks questions. */
  readonly onConfirm: (answers?: ApplyAnswer[]) => void;
};

/**
 * Bottom sheet shown before a worker applies, carrying the engagement warning
 * the WhatsApp flow used to show.
 *
 * Applying is not a free action — it shares the worker's contact details with
 * the employer, spends one of their applications for the day, and binds them to
 * a penalty if they cancel late. That has to be visible before they commit, not
 * discovered afterwards.
 */
export function ApplyConfirmDrawer({
  jobOfferId,
  open,
  onOpenChange,
  title,
  scheduledAt,
  address,
  amount,
  isPending,
  onConfirm,
}: Props) {
  const { data: terms } = useApplicationTerms();
  const { data: me } = useProfileMe();
  // The feed's cards carry no questions: the offer detail does.
  const detail = useJobDetail(open ? jobOfferId : undefined);
  const questions = detail.data?.questions ?? [];
  const [values, setValues] = useState<Record<string, string>>({});
  const missing = questions.some(
    (q) => q.required && !(values[q.id] ?? "").trim(),
  );
  const answers = questions.length
    ? questions
        .filter((q) => (values[q.id] ?? "").trim())
        .map((q) => ({ questionId: q.id, value: values[q.id].trim() }))
    : undefined;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto flex max-h-[85vh] w-full flex-col">
          <DrawerHeader className="text-center">
            <DrawerTitle>Confirmer votre candidature</DrawerTitle>
            <DrawerDescription>
              Vous êtes sur le point de postuler à « {title} ».
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-2">
            {questions.length > 0 && (
              <Questions
                questions={questions}
                values={values}
                onChange={(id, v) => setValues((s) => ({ ...s, [id]: v }))}
              />
            )}
            <dl className="space-y-2 rounded-xl bg-card p-3 text-left text-sm shadow-soft">
              <RecapRow label="Date" value={formatDateTime(scheduledAt)} />
              {amount != null && (
                <RecapRow label="Montant" value={formatOfferAmount(amount)} />
              )}
              <RecapRow label="Adresse" value={address} />
            </dl>

            <div className="flex gap-3 rounded-xl bg-destructive/10 p-3 text-left">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-destructive">
                  Engagement important
                </p>
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                  <li>Vos informations seront partagées avec le recruteur.</li>
                  <li>Vous vous engagez à être présent et ponctuel.</li>
                  <li>
                    {terms ? (
                      <>
                        Une annulation moins de {terms.cancellationThresholdHours}{" "}
                        heures avant le début entraîne une pénalité de{" "}
                        <span className="font-medium text-foreground">
                          {terms.lateCancellationPenaltyFcfa.toLocaleString(
                            "fr-FR",
                          )}{" "}
                          FCFA
                        </span>
                        .
                      </>
                    ) : (
                      <>
                        Une annulation tardive entraîne une pénalité en FCFA.
                      </>
                    )}
                  </li>
                  <li>Votre score de fiabilité est impacté.</li>
                </ul>
              </div>
            </div>

            {me && (
              <div className="space-y-2 rounded-xl bg-card p-3 text-left shadow-soft">
                <p className="text-xs font-medium text-muted-foreground">
                  Votre profil sera envoyé
                </p>
                <dl className="space-y-2 text-sm">
                  <RecapRow
                    label="Nom"
                    value={`${me.firstName} ${me.lastName}`}
                  />
                  <RecapRow label="Téléphone" value={me.phone} />
                  {me.email && <RecapRow label="Email" value={me.email} />}
                  {me.reliabilityScore != null && (
                    <RecapRow
                      label="Score de fiabilité"
                      value={`${me.reliabilityScore}/100`}
                    />
                  )}
                </dl>
              </div>
            )}
          </div>

          <DrawerFooter>
            <Button
              className="bg-whatsapp text-white hover:bg-whatsapp active:bg-whatsapp-dark"
              disabled={isPending || detail.isLoading || missing}
              onClick={() => onConfirm(answers)}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Oui, je postule
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isPending}>
                Retour
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** The employer's questions: Oui / Non and choices as pills, a short text otherwise. */
function Questions({
  questions,
  values,
  onChange,
}: Readonly<{
  questions: ApplyQuestion[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}>) {
  return (
    <div className="space-y-3 rounded-xl bg-card p-3 text-left shadow-soft">
      <p className="text-xs font-medium text-muted-foreground">
        Questions du recruteur
      </p>
      {questions.map((q) => {
        const value = values[q.id] ?? "";
        const choices: [string, string][] =
          q.kind === "YES_NO"
            ? [
                ["yes", "Oui"],
                ["no", "Non"],
              ]
            : q.options.map((o) => [o, o]);
        return (
          <fieldset key={q.id} className="space-y-2">
            <legend className="text-sm font-medium">
              {q.label}
              {!q.required && (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  (facultatif)
                </span>
              )}
            </legend>
            {q.kind === "SHORT_TEXT" ? (
              <textarea
                value={value}
                onChange={(e) => onChange(q.id, e.target.value)}
                maxLength={300}
                rows={2}
                placeholder="Votre réponse"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {choices.map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={value === v}
                    onClick={() => onChange(q.id, value === v ? "" : v)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      value === v
                        ? "border-whatsapp bg-whatsapp/10 text-whatsapp-dark"
                        : "bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {value === v && <Check className="size-3.5" />}
                    {label}
                  </button>
                ))}
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

function RecapRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="break-words text-right font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}
