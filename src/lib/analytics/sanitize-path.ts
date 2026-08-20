/**
 * The page path, stripped of everything Google must never receive.
 *
 * This is a privacy boundary, not a formatting helper. Google Analytics sends
 * `page_location` — the full URL, query string included — on every page view
 * unless it is told otherwise, and several routes in this app carry a
 * credential in the URL itself:
 *
 * - `/verify/whatsapp?token=…` is a login token
 * - `/pay/:token` is a payment token
 * - `/s/:code` and `/r/:hash` are single-use links from WhatsApp
 * - `/p/:slug` is a public portfolio, and a slug is built from a person's name
 *
 * Sending any of those to a third party would be handing out a working
 * credential, or a name attached to a browsing session. So nothing dynamic
 * leaves this function: the value reported is the route *shape*, never the
 * value that filled it.
 *
 * The pleasant side effect is a readable report. Without this, the Pages view
 * fills with thousands of single-hit rows — one per claim, offer and mission —
 * and «/claims/:id» as a single line is what someone actually wants to read.
 */

/**
 * Segments whose successor is always dynamic, whatever it looks like.
 *
 * Shape-matching alone is not enough here. A short code like `x7f2q` and a
 * portfolio slug like `jean-mabiala` are indistinguishable from a static route
 * name, so these prefixes are named explicitly. The placeholder repeats the
 * name used in the route table, so a line in the GA report can be found in
 * `src/app/routes`.
 */
const DYNAMIC_AFTER: Record<string, string> = {
  pay: ":token",
  s: ":code",
  r: ":hash",
  p: ":slug",
};

/** A v4-shaped UUID — how most ids reach the URL in this app. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A bare number, as in a paginated or indexed route. */
const NUMERIC = /^\d+$/;

/**
 * An opaque token that is neither a UUID nor a number.
 *
 * Deliberately loose: a false positive costs one route name turned into
 * «:id» in a report, a false negative leaks an identifier. Sixteen characters
 * of unbroken hex or base64url is not a word anyone routes on.
 */
const OPAQUE = /^[A-Za-z0-9_-]{16,}$/;

/**
 * Takes a pathname only — never a full URL.
 *
 * The query string and the fragment are dropped by never being passed in,
 * rather than filtered out. An allowlist would have to be kept in step with
 * every future `?token=` a feature adds, and the one that gets forgotten is
 * the one that leaks. There is nothing in a query string here worth that risk.
 */
export function sanitizePath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return "/";

  const out = segments.map((segment, index) => {
    const previous = index > 0 ? segments[index - 1] : "";
    // Checked against the RAW previous segment, before it was itself replaced.
    const named = DYNAMIC_AFTER[previous.toLowerCase()];
    if (named) {
      // The prefix is redacted at any depth — never leak — but it only earns
      // its specific name at the root, where those four routes live. Nested,
      // the same letter means something else: `r` is the short link at
      // `/r/:hash` and a portfolio realization at `/p/:slug/r/:itemId`, and
      // labelling the second one `:hash` would describe the wrong route.
      return index === 1 ? named : ":id";
    }
    if (UUID.test(segment)) return ":id";
    if (NUMERIC.test(segment)) return ":id";
    if (OPAQUE.test(segment)) return ":id";
    return segment;
  });

  return `/${out.join("/")}`;
}
