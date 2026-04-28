const express = require("express"); // ייבוא express
const router = express.Router(); // יצירת router

// ייבוא הפונקציות מה-controller
const {
  createPost,
  getPosts,
  deletePost,
} = require("../controllers/postController");

// ייבוא middleware לבדיקה אם המשתמש מחובר
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 יצירת פוסט (רק למשתמש מחובר)
router.post(
  "/", // endpoint → /api/posts
  authMiddleware, // קודם בודק token
  createPost, // אם תקין → יוצר פוסט
);

// מחיקת פוסט (מוגן)
router.delete("/:id", authMiddleware, deletePost);

// 🔹 שליפת כל הפוסטים (פתוח לכולם)
router.get(
  "/", // endpoint → /api/posts
  getPosts, // מחזיר את כל הפוסטים
);

// ייצוא ה-router כדי להשתמש בו ב-app.js
module.exports = router;
