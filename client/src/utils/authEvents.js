/**
 * Lightweight pub/sub for auth state without Redux — CustomEvent on window.
 * Navbar listens to refresh welcome message after login/logout/profile token rotation.
 */
/** Fired after token is stored or removed so Navbar (etc.) can refresh. */
export const AUTH_TOKEN_CHANGED_EVENT = "h4p-auth-token-changed";

/** Call whenever localStorage token mutates so listeners re-fetch profile/decoded JWT. */
export function notifyAuthTokenChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED_EVENT));
  }
}
