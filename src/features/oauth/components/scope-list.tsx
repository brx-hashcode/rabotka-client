import { Check } from "lucide-react";
import { consentContent, type ConsentScopeKey } from "@/content/oauth/consent";

type ScopeListProps = {
  readonly scopes: readonly string[];
};

/**
 * What the application will receive, one line per thing.
 *
 * `openid` is filtered out rather than described. It carries only the opaque
 * per-application identifier, which is meaningless outside this pairing and
 * cannot be declined separately — listing it would add a row nobody can act on
 * and push the rows that matter further down the screen.
 *
 * An unrecognised scope is skipped rather than rendered raw. A user shown
 * `rabotka:something_new` has been told nothing, and a screen that can print
 * arbitrary server strings is a screen that can be made to say anything.
 */
export function ScopeList({ scopes }: Readonly<ScopeListProps>) {
  const described = scopes
    .filter((scope): scope is ConsentScopeKey => scope in consentContent.scopes)
    .map((scope) => ({ key: scope, ...consentContent.scopes[scope] }));

  if (described.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{consentContent.consent.willReceive}</p>

      <ul className="space-y-3">
        {described.map((scope) => (
          <li key={scope.key} className="flex gap-3">
            <Check
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <div className="space-y-0.5">
              <p className="text-sm leading-snug">{scope.label}</p>
              <p className="text-xs leading-snug text-muted-foreground">
                {scope.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
