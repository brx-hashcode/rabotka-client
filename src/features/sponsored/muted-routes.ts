/**
 * Routes that own the whole screen or are mid-flow — an ad on top of a payment
 * or an onboarding step is both intrusive and a conversion killer.
 */
const MUTED_ROUTE_PREFIXES = [
  "/login",
  "/onboarding",
  "/verify-whatsapp",
  "/pay",
  "/r/",
  "/s/",
];

export function isMutedRoute(pathname: string): boolean {
  // "/" is the marketing landing, not the app — and muting it keeps anonymous
  // visitors from triggering a profile lookup they have no session for.
  if (pathname === "/") return true;
  return MUTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
