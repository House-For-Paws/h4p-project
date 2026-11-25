/**
 * =============================================================================
 * FILE: server/routes/messageRoutes.js
 * ROLE: Mount /api/messages → messageController (JWT required)
 * =============================================================================
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createRateLimiter } = require("../middleware/rateLimit");
const {
  getThreads,
  getUnreadCount,
  getThread,
  startThread,
  sendMessage,
  deleteThread,
} = require("../controllers/messageController");

const sendLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 40,
  message: "Sending too fast. Wait a moment and try again.",
});

router.get("/threads", authMiddleware, getThreads);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.get("/threads/:id", authMiddleware, getThread);
router.post("/threads", authMiddleware, sendLimiter, startThread);
router.post("/threads/:id", authMiddleware, sendLimiter, sendMessage);
router.delete("/threads/:id", authMiddleware, deleteThread);

module.exports = router;
