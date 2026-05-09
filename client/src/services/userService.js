/** Users + pets listing helpers — some endpoints require JWT or admin role server-side. */
import API from "./api";

export const getMe = () => API.get("/users/me");

export const getUsers = () => API.get("/users");

export const getPets = (params = {}) => API.get("/pets", { params });

export const getPet = (id) => API.get(`/pets/${id}`);

export const createPet = (pet) => API.post("/pets", pet);
