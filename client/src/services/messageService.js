/**
 * =============================================================================
 * FILE: client/src/services/messageService.js
 * ROLE: Pet-linked messaging API wrappers
 * =============================================================================
 */
import API from "./api";

export const getMessageThreads = () => API.get("/messages/threads");

export const getMessageUnreadCount = () => API.get("/messages/unread-count");

export const getMessageThread = (id) => API.get(`/messages/threads/${id}`);

/** Start or open a thread for a pet; optional first message body. */
export const startMessageThread = (payload) =>
  API.post("/messages/threads", payload);

export const sendMessage = (threadId, body) =>
  API.post(`/messages/threads/${threadId}`, { body });

export const deleteMessageThread = (threadId) =>
  API.delete(`/messages/threads/${threadId}`);
