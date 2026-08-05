/**
 * Turns an untrusted URL segment into a safe in-app path, or null.
 *
 * Used by `/s/:code` when the segment is not a login code: the outbound
 * processor leaves the destination path in a template's button URL whenever it
 * cannot mint a code, so `…/s/profile` means "go to /profile".
 *
 * That value came from a URL someone tapped, so it must never be able to send
 * them off-site. Anything carrying a scheme, a host, a backslash or a `..`
 * segment is rejected outright rather than escaped — an open redirect here
 * would be worse than the dead link this replaces.
 */
export function safeDestination(value: string): string | null {
  const decoded = (() => {
    try {
      return decodeURIComponent(value);
    } catch {
      // A malformed escape is not something to guess at.
      return value;
    }
  })();

  const raw = decoded.trim();

  // Checked BEFORE slashes are stripped: `//evil.test` is protocol-relative, and
  // flattening it to `/evil.test` would quietly turn a hostile input into a
  // bogus in-app route instead of rejecting it.
  if (raw.startsWith("//")) return null;
  if (/\\/.test(raw)) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return null;

  const trimmed = raw.replace(/^\/+/, "");
  if (!trimmed) return null;
  if (trimmed.split("/").includes("..")) return null;

  return `/${trimmed}`;
}
