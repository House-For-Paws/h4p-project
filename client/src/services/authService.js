import API from "./api";

export const login = (credentials) => API.post("/auth/login", credentials);

export const register = (formData) => API.post("/auth/register", formData);

export const getProfile = () => API.get("/auth/profile");

export const updateProfile = (payload) => API.patch("/auth/profile", payload);
export const changeEmail = (payload) => API.patch("/auth/change-email", payload);
export const changePassword = (payload) =>
  API.patch("/auth/change-password", payload);
export const updateProfilePicture = (payload) =>
  API.patch("/auth/profile-picture", payload);
export const updateNotificationSettings = (payload) =>
  API.patch("/auth/notification-settings", payload);
export const deleteAccount = (payload) =>
  API.delete("/auth/account", { data: payload });
