/**
 * Thin wrappers around /api/auth REST endpoints — keeps pages free of URL strings.
 * Each call uses shared axios instance (see ./api.js) so JWT interceptor applies.
 */
import API from "./api";

/** POST /auth/login — body: { email|username, password }; returns { token, user }. */
export const login = (credentials) => API.post("/auth/login", credentials);

/** POST /auth/register — full signup form payload; returns { token, user }. */
export const register = (formData) => API.post("/auth/register", formData);

/** GET /auth/profile — requires Bearer token; returns { user }. */
export const getProfile = () => API.get("/auth/profile");

/** PATCH /auth/profile — partial profile fields; may return refreshed JWT. */
export const updateProfile = (payload) => API.patch("/auth/profile", payload);
/** PATCH /auth/change-email — { newEmail, currentPassword }. */
export const changeEmail = (payload) => API.patch("/auth/change-email", payload);
/** PATCH /auth/change-password — password rotation. */
export const changePassword = (payload) =>
  API.patch("/auth/change-password", payload);
/** PATCH /auth/profile-picture — { imageData } base64 data URL. */
export const updateProfilePicture = (payload) =>
  API.patch("/auth/profile-picture", payload);
/** PATCH /auth/notification-settings — boolean toggles. */
export const updateNotificationSettings = (payload) =>
  API.patch("/auth/notification-settings", payload);
/** DELETE /auth/account — JSON body with password + confirmation. */
export const deleteAccount = (payload) =>
  API.delete("/auth/account", { data: payload });
