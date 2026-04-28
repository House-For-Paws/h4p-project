const express = require("express");
const router = express.Router();

// מייבא את הפונקציות
const {
  createComment,
  getCommentsByPost,
} = require("../controllers/commentController");

// מייבא middleware
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 יצירת תגובה (מוגן)
router.post("/:postId", authMiddleware, createComment);

// 🔹 שליפת תגובות לפוסט
router.get("/:postId", getCommentsByPost);

module.exports = router;
