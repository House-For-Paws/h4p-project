/**
 * =============================================================================
 * FILE: client/src/services/userService.js
 * ROLE: Users + pets API wrappers (/api/users, /api/pets)
 * =============================================================================
 */
import API from "./api";

// ----- Users -----
export const getMe = () => API.get("/users/me");
export const getUsers = () => API.get("/users");

// ----- Pets list / detail -----
export const getPets = (params = {}) => API.get("/pets", { params });
export const getPet = (id) => API.get(`/pets/${id}`);
export const recordPetView = (id) => API.post(`/pets/${id}/view`);
export const createPet = (pet) => API.post("/pets", pet);
export const deletePet = (id) => API.delete(`/pets/${id}`);

// ----- Likes / favorites / comments -----
export const togglePetLike = (id) => API.post(`/pets/${id}/like`);
export const togglePetFavorite = (id) => API.post(`/pets/${id}/favorite`);
export const getMyFavoritePets = () => API.get("/pets/favorites/mine");
export const getPetComments = (id) => API.get(`/pets/${id}/comments`);
export const addPetComment = (id, text) =>
  API.post(`/pets/${id}/comments`, { text });
