import { useQuery } from "@tanstack/react-query";
import { getMeRaw } from "@/lib/api/profile-controller";
import { isUnauthorized } from "@/lib/api/errors";

/**
 * The signed-in profile — and, because nothing else answers the question, the
 * app's session check.
 *
 * `getMeRaw` rather than `getMe` so the 401 survives: the global default is
 * `retry: false`, which used to make *any* failure look like a logout. Most of
 * this app runs inside WhatsApp's WebView on a mobile connection, where a single
 * dropped request is routine — and it was bouncing people to /login.
 *
 * A genuine 401 still resolves immediately, with no retries and no delay, so
 * signed-out visitors reach the login form as fast as they did before.
 */
export function useProfileMe() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMeRaw,
    retry: (failureCount, error) =>
      !isUnauthorized(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
  });
}
