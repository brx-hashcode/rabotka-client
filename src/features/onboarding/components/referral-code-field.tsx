import { useCallback, useEffect, useState } from "react";
import { Gift, Check, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { confirmationContent } from "@/content/onboarding";
import {
  REFERRAL_CODE_PATTERN,
  normalizeReferralCode,
} from "@/lib/referral-attribution";
import { resolveReferralCode } from "@/lib/api/referral-controller";
import { cn } from "@/lib/utils";

/** Long enough that typing six characters is one request, not six. */
const LOOKUP_DEBOUNCE_MS = 450;

type LookupState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "found"; name: string }
  | { kind: "not-found" };

/**
 * "Avez-vous été parrainé ?" — asked on the confirmation screen, after the KYC
 * documents.
 *
 * Not in step 1 with the personal information: this field names a *different*
 * profile, so it does not belong in the form that collects who you are, and
 * putting it there would drag it into `step1Schema` where a wrong code could
 * block the step. Here it sits beside the policy checkbox, at the moment of
 * commitment, and nothing about it can stop the submit.
 *
 * The code is written to the store rather than kept in local state, because
 * `useOnboardingMutation` takes no arguments and reads everything from
 * `useOnboardingStore.getState()` — a value held only here would silently never
 * reach the payload.
 */
export function ReferralCodeField() {
  const { referralCode, referralSource, setReferral } = useOnboardingStore();

  // A code carried in from a `?ref=` link means the answer is already "oui".
  const [hasReferrer, setHasReferrer] = useState(() => referralCode !== "");
  const [draft, setDraft] = useState(referralCode);
  const [lookup, setLookup] = useState<LookupState>({ kind: "idle" });

  const content = confirmationContent.referral;
  const prefilledFromLink = referralSource === "LINK" && referralCode !== "";
  const normalized = normalizeReferralCode(draft);
  const malformed = draft.length > 0 && normalized === null;

  // Store the code only once it could actually be one. A half-typed code in the
  // store would be sent if the user submitted mid-typing.
  useEffect(() => {
    setReferral(normalized ?? "", normalized ? referralSource : "MANUAL_CODE");
    // `setReferral` is a stable zustand action; `referralSource` is only read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized]);

  useEffect(() => {
    if (!normalized) {
      setLookup({ kind: "idle" });
      return;
    }

    let cancelled = false;
    setLookup({ kind: "checking" });
    const timer = setTimeout(() => {
      void resolveReferralCode(normalized).then((res) => {
        if (cancelled) return;
        setLookup(
          res.found
            ? { kind: "found", name: `${res.firstName} ${res.lastInitial}.` }
            : { kind: "not-found" },
        );
      });
    }, LOOKUP_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [normalized]);

  const onToggle = useCallback(
    (next: boolean) => {
      setHasReferrer(next);
      if (!next) {
        // Answering "non" clears the code, including one that arrived by link.
        // Leaving it staged would attribute a parrainage the user just declined.
        setDraft("");
        setReferral("", "MANUAL_CODE");
        setLookup({ kind: "idle" });
      }
    },
    [setReferral],
  );

  return (
    <div className="rounded-lg bg-card shadow-soft p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Gift className="h-5 w-5 text-whatsapp mt-0.5 shrink-0" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-gray-900">
            {content.question}
          </p>
          <p className="text-xs text-gray-500">{content.hint}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { value: true, label: content.yes },
          { value: false, label: content.no },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onToggle(option.value)}
            aria-pressed={hasReferrer === option.value}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              hasReferrer === option.value
                ? "bg-whatsapp text-primary-foreground hover:bg-whatsapp-dark"
                : "bg-muted text-gray-700 hover:bg-muted/80",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {hasReferrer && (
        <div className="space-y-1.5">
          <Label htmlFor="referral-code" className="text-sm text-gray-700">
            {content.inputLabel}
          </Label>
          <Input
            id="referral-code"
            value={draft}
            onChange={(e) => setDraft(e.target.value.toUpperCase())}
            placeholder={content.placeholder}
            // 7 rather than 6: a pasted code with a dash still fits, and
            // normalisation strips it.
            maxLength={7}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            pattern={REFERRAL_CODE_PATTERN.source}
            aria-invalid={malformed}
            className="bg-muted font-mono tracking-widest uppercase"
          />

          {malformed && (
            <p className="text-xs text-destructive">{content.invalid}</p>
          )}

          {!malformed && lookup.kind === "checking" && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              {content.checking}
            </p>
          )}

          {!malformed && lookup.kind === "found" && (
            <p className="flex items-center gap-1.5 text-xs text-whatsapp">
              <Check className="h-3 w-3" />
              {content.found(lookup.name)}
            </p>
          )}

          {/* Informational, never blocking: the backend ignores a code it
              cannot resolve, and losing an account over a mistyped parrainage
              would be a far worse trade than losing the parrainage. */}
          {!malformed && lookup.kind === "not-found" && (
            <p className="text-xs text-amber-600">{content.notFound}</p>
          )}

          {prefilledFromLink && lookup.kind !== "not-found" && (
            <p className="text-xs text-gray-500">{content.linkPrefilled}</p>
          )}
        </div>
      )}
    </div>
  );
}
