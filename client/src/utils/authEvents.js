/** Fired after token is stored or removed so Navbar (etc.) can refresh. */
export const AUTH_TOKEN_CHANGED_EVENT = "h4p-auth-token-changed";

export function notifyAuthTokenChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED_EVENT));
  }
}
