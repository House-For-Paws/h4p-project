import axios from "axios";
import { notifyAuthTokenChanged } from "../utils/authEvents";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

/** JWT + Bearer prefix must stay under Node's max HTTP header size (~8–16 KiB). */
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
