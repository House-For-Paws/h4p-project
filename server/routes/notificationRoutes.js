/**
 * =============================================================================
 * FILE: server/routes/notificationRoutes.js
 * ROLE: Mount /api/notifications → notificationController (JWT required)
 * =============================================================================
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  deleteNotification,
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.patch("/read-all", authMiddleware, markAllNotificationsRead);
router.delete("/", authMiddleware, clearNotifications);
router.patch("/:id/read", authMiddleware, markNotificationRead);
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;
