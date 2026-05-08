import API from "./api";

export const login = (credentials) => API.post("/auth/login", credentials);

export const register = (formData) => API.post("/auth/register", formData);

export const getProfile = () => API.get("/auth/profile");

export const updateProfile = (payload) => API.patch("/auth/profile", payload);
