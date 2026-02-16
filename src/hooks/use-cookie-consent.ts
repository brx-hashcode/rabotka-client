import { useState, useEffect } from "react";

const COOKIE_CONSENT_KEY = "rabotka-cookie-consent";

export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof globalThis !== "undefined") {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      setHasConsent(consent === "accepted");
    }
  }, []);

  const acceptConsent = () => {
    if (typeof globalThis !== "undefined") {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
      setHasConsent(true);
    }
  };

  return {
    hasConsent: hasConsent === true,
    showBanner: hasConsent === false,
    acceptConsent,
  };
}
