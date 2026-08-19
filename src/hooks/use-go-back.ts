import { useCallback } from "react";
import { useNavigate } from "react-router";

/**
 * A back button that cannot strand the user.
 *
 * `navigate(-1)` assumes there is somewhere to go back to. For anyone arriving
 * from WhatsApp there is not: the bot's card opens `/s/<code>`, and
 * `login-link.tsx` signs them in with `navigate(destination, { replace: true })`
 * — which REPLACES the short-link entry rather than stacking on it. The page
 * they land on is the first entry in the webview, so its back button did
 * nothing at all, on a surface with no browser chrome to escape with.
 *
 * Most users reach these screens from the bot, so "nothing happens" was the
 * common case rather than the edge one.
 *
 * @param fallback where to go when there is no history to pop — pick a screen
 * the user's role can actually open.
 */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();

  return useCallback(() => {
    if (globalThis.history.length > 1) navigate(-1);
    else navigate(fallback);
  }, [navigate, fallback]);
}
