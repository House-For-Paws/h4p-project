/**
 * =============================================================================
 * FILE: client/src/services/api.js
 * ROLE: Shared Axios client — base URL + JWT interceptors
 * =============================================================================
 * Import this (not raw axios) from every *Service.js file.
 * =============================================================================
 */
import axios from "axios";
import { notifyAuthTokenChanged } from "../utils/authEvents";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

const MAX_TOKEN_CHARS = 8000;

const clearAuthToken = () => {
  localStorage.removeItem("token");
  notifyAuthTokenChanged();
};

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

// ======================== REQUEST: attach Bearer JWT ========================
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

// ======================== RESPONSE: clear token on 401 ========================
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
