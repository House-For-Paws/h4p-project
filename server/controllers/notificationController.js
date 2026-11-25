/**
 * =============================================================================
 * FILE: server/controllers/notificationController.js
 * ROLE: In-app notification inbox for the logged-in user
 * =============================================================================
 * Types used elsewhere: pet_comment, pet_like, adoption_request,
 *   application_update, admin_warning, content_report
 * Sections: LIST | UNREAD COUNT | MARK READ | MARK ALL READ
 * =============================================================================
 */
const { query, run } = require("../config/db");

// ======================== LIST ========================
/** GET /api/notifications — newest first. */
exports.getNotifications = async (req, res, next) => {
  try {
    const rows = await query(
      `
        SELECT
          n.id,
          n.type,
          n.title,
          n.body,
          n.relatedPetId,
          n.relatedApplicationId,
          n.relatedThreadId,
          n.isRead,
          n.createdAt
        FROM notifications n
        WHERE n.userId = ?
        ORDER BY n.createdAt DESC
        LIMIT 100
      `,
      [req.user.id],
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// ======================== UNREAD COUNT ========================
/** GET /api/notifications/unread-count */
exports.getUnreadCount = async (req, res, next) => {
  try {
    // Exclude pet_message — unread chats use the Messages badge instead.
    const rows = await query(
      `
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE userId = ?
          AND isRead = 0
          AND type <> 'pet_message'
      `,
      [req.user.id],
    );
    res.json({ count: Number(rows[0]?.count || 0) });
  } catch (error) {
    next(error);
  }
};

// ======================== MARK ONE READ ========================
/** PATCH /api/notifications/:id/read */
exports.markNotificationRead = async (req, res, next) => {
  try {
    const result = await run(
      "UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?",
      [Number(req.params.id), req.user.id],
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

// ======================== MARK ALL READ ========================
/** PATCH /api/notifications/read-all */
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await run(
      "UPDATE notifications SET isRead = 1 WHERE userId = ? AND isRead = 0",
      [req.user.id],
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/notifications — permanently clear the user's inbox. */
exports.clearNotifications = async (req, res, next) => {
  try {
    const result = await run("DELETE FROM notifications WHERE userId = ?", [
      req.user.id,
    ]);
    res.json({
      message: "Notifications cleared",
      deleted: Number(result.affectedRows || 0),
    });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/notifications/:id — delete one notification. */
exports.deleteNotification = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid notification id" });
    }
    const result = await run(
      "DELETE FROM notifications WHERE id = ? AND userId = ?",
      [id, req.user.id],
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted", id });
  } catch (error) {
    next(error);
  }
};
