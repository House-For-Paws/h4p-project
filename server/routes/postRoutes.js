/**
 * =============================================================================
 * FILE: server/routes/postRoutes.js
 * ROLE: Legacy community posts under /api/posts
 * =============================================================================
 */
const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  deletePost,
} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createPost);
router.get("/", getPosts);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
