/**
 * Classifying an API failure.
 *
 * `BaseController.handleError` in mvc-front-sdk rethrows every ApiError as a
 * plain `Error` carrying only the message — `statusCode` and `body` are dropped
 * before the caller ever sees them. So the message is the only discriminator
 * available downstream.
 *
 * That is workable because the SDK uses one fixed string for transport
 * failures: a rejected fetch becomes `ApiError("Network error occurred", 0)`.
 * Anything else came from the server and is already phrased for the user, in
 * French.
 */
const NETWORK_ERROR_MESSAGE = "Network error occurred";

/** A transport failure — no response reached us, so retrying can help. */
export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && error.message === NETWORK_ERROR_MESSAGE;
}

/**
 * The session was refused — signing in again is the only way forward.
 *
 * Only meaningful for callers that skip `handleError` and let the SDK's
 * `ApiError` through (see `getMeRaw` in profile-controller). Everything else has
 * already had `statusCode` stripped and will read as `false` here, which is the
 * safe direction: a caller that cannot tell will not claim the user is signed
 * out. A transport failure carries `statusCode: 0`, so it is correctly excluded.
 */
export function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    (error as { statusCode: unknown }).statusCode === 401
  );
}

/**
 * The server's own explanation, or null when there isn't one.
 *
 * Returns null for transport failures specifically so callers never render the
 * SDK's untranslated "Network error occurred" to a French-speaking user — show
 * your own copy and offer a retry instead.
 */
export function serverMessage(error: unknown): string | null {
  if (!(error instanceof Error) || isNetworkError(error)) return null;
  const message = error.message.trim();
  return message.length > 0 ? message : null;
}
