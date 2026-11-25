/**
 * =============================================================================
 * FILE: server/controllers/postController.js
 * ROLE: Legacy community posts API (/api/posts)
 * =============================================================================
 */
const { query, run } = require("../config/db");

// ======================== CREATE POST ========================
exports.createPost = async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  try {
    const result = await run(
      "INSERT INTO posts (title, description, userId, createdAt) VALUES (?, ?, ?, ?)",
      [String(title).trim(), String(description).trim(), req.user.id, new Date()],
    );

    const posts = await query(
      `
        SELECT posts.*, users.username
        FROM posts
        LEFT JOIN users ON users.id = posts.userId
        WHERE posts.id = ?
        LIMIT 1
      `,
      [result.insertId],
    );

    res.status(201).json(posts[0]);
  } catch (error) {
    next(error);
  }
};

// ======================== LIST POSTS ========================
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await query(`
      SELECT posts.*, COALESCE(users.username, 'Unknown') AS username
      FROM posts
      LEFT JOIN users ON users.id = posts.userId
      ORDER BY posts.id DESC
    `);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// ======================== DELETE POST ========================
exports.deletePost = async (req, res, next) => {
  const postId = Number(req.params.id);

  try {
    const posts = await query("SELECT * FROM posts WHERE id = ? LIMIT 1", [postId]);
    const post = posts[0];

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    await run("DELETE FROM posts WHERE id = ?", [postId]);
    res.json({ message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};
