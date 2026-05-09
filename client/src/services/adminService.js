/** Admin dashboard API — all routes require admin JWT (403 otherwise). */
import API from "./api";

export const getAdminStats = () => API.get("/admin/stats");
export const getAdminUsers = () => API.get("/admin/users");
export const getAdminPosts = () => API.get("/admin/posts");
export const getAdminComments = () => API.get("/admin/comments");
