/**
 * Axios instance shared by all client/src/services/* modules.
 * - baseURL from Vite env (production API host) or localhost dev server.
 * - Request interceptor attaches Bearer JWT from localStorage when valid.
 * - Response interceptor clears stale auth on 401 to force re-login.
 */
import axios from "axios";
import { notifyAuthTokenChanged } from "../utils/authEvents";

/** Single configured client — import default everywhere instead of raw axios. */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

/** JWT + Bearer prefix must stay under Node's max HTTP header size (~8–16 KiB). */
const MAX_TOKEN_CHARS = 8000;

/** Remove invalid/expired token and tell Navbar to refresh UI. */
const clearAuthToken = () => {
  localStorage.removeItem("token");
  notifyAuthTokenChanged();
};

/** Decode JWT payload.exp (seconds) and compare to Date.now() — fails closed on parse errors. */
const isTokenExpired = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    if (!payload?.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

/** Before each outbound request: attach Authorization if token present & sane & unexpired. */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    if (token.length > MAX_TOKEN_CHARS) {
      clearAuthToken();
    } else if (isTokenExpired(token)) {
      clearAuthToken();
    } else {
      req.headers.Authorization = `Bearer ${token}`;
    }
  }

  return req;
});

/** Global 401 handler — server rejected JWT → clear client token (avoid retry loops). */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasToken = Boolean(localStorage.getItem("token"));
    if (error?.response?.status === 401 && hasToken) {
      clearAuthToken();
    }
    return Promise.reject(error);
  },
);

export default API;
