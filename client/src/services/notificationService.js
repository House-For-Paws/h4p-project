/**
 * =============================================================================
 * FILE: client/src/services/notificationService.js
 * ROLE: In-app notifications API wrappers
 * =============================================================================
 */
import API from "./api";

export const getNotifications = () => API.get("/notifications");

export const getUnreadNotificationCount = () =>
  API.get("/notifications/unread-count");

export const markNotificationRead = (id) =>
  API.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  API.patch("/notifications/read-all");
