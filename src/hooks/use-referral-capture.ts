import { useEffect } from "react";
import { useLocation } from "react-router";

import { saveReferralAttribution } from "@/lib/referral-attribution";

/**
 * Captures a `?ref=CODE` code into storage on every navigation.
 *
 * Mounted once at the app shell rather than on the signup page, because that is
 * not where the link lands: a code shared on WhatsApp points at
 * `rabotka.work/?ref=K7M2XQ`, and the person reads the landing page before
 * clicking through to register. Watching only `/onboarding` would drop the
 * attribution for everyone who takes the normal path.
 *
 * Keyed on `search`, not `pathname`: the code lives in the query string, and a
 * navigation that changes only the path cannot bring a new one.
 *
 * Storage is authoritative from here on — the code is read back on the
 * confirmation screen, four steps later, and the URL is long gone by then.
 */
export function useReferralCapture(): void {
  const { search } = useLocation();

  useEffect(() => {
    const code = new URLSearchParams(search).get("ref");
    if (!code) return;
    saveReferralAttribution(code, "LINK");
  }, [search]);
}
