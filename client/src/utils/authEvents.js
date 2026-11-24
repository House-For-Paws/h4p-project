/**
 * =============================================================================
 * FILE: client/src/utils/authEvents.js
 * ROLE: Notify Navbar/pages when JWT is stored or cleared
 * =============================================================================
 */
export const AUTH_TOKEN_CHANGED_EVENT = "h4p-auth-token-changed";

/** Call whenever localStorage token mutates so listeners re-fetch profile/decoded JWT. */
export function notifyAuthTokenChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED_EVENT));
  }
}
