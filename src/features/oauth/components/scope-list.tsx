import { BadgeCheck, MapPin, Mail, Phone, User } from "lucide-react";
import { consentContent, type ConsentScopeKey } from "@/content/oauth/consent";

type ScopeListProps = {
  readonly scopes: readonly string[];
};

/**
 * An icon per scope rather than a repeated checkmark.
 *
 * Identical ticks down the list turn it into decoration people skim past — the
 * one thing this screen cannot afford, since the list *is* the consent. A
 * distinct glyph per kind of data gives each row its own shape, so "phone
 * number" and "verification status" are told apart at a glance instead of read
 * word by word.
 */
const SCOPE_ICONS: Record<ConsentScopeKey, typeof User> = {
  profile: User,
  phone: Phone,
  email: Mail,
  "rabotka:verification": BadgeCheck,
  "rabotka:location": MapPin,
};

/**
 * What the application will receive, one row per thing.
 *
 * `openid` is filtered out rather than described: it carries only the opaque
 * per-application identifier, which is meaningless outside this pairing and
 * cannot be declined separately. Listing it would add a row nobody can act on
 * and push the rows that matter further down.
 *
 * An unrecognised scope is skipped rather than rendered raw. A user shown
 * `rabotka:something_new` has been told nothing, and a screen that prints
 * arbitrary server strings is a screen that can be made to say anything.
 */
export function ScopeList({ scopes }: Readonly<ScopeListProps>) {
  const described = scopes
    .filter((scope): scope is ConsentScopeKey => scope in consentContent.scopes)
    .map((scope) => ({
      key: scope,
      Icon: SCOPE_ICONS[scope],
      ...consentContent.scopes[scope],
    }));

  if (described.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-medium">
        {consentContent.consent.willReceive}
      </h2>

      <ul className="mt-3 space-y-3.5">
        {described.map(({ key, Icon, label, detail }) => (
          <li key={key} className="flex gap-3">
            <span className="bg-lime text-lime-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Icon aria-hidden className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5 pt-0.5">
              <p className="text-sm leading-snug font-medium">{label}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
