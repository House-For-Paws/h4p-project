import API from "./api";

export const getPosts = () => API.get("/posts");

export const createPost = (post) => API.post("/posts", post);

export const deletePost = (id) => API.delete(`/posts/${id}`);

export const getComments = (postId) => API.get(`/comments/${postId}`);

export const createComment = (postId, comment) =>
  API.post(`/comments/${postId}`, comment);
