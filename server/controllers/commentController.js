/**
 * commentController — thread replies on posts; enforces post exists before insert.
 */
const { query, run } = require("../config/db");

/** POST /comments/:postId — auth user adds comment row linked to post + user. */
exports.createComment = async (req, res, next) => {
  const postId = Number(req.params.postId);
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    const posts = await query("SELECT id FROM posts WHERE id = ? LIMIT 1", [postId]);

    if (!posts.length) {
      return res.status(404).json({ message: "Post not found" });
    }

    const result = await run(
      "INSERT INTO comments (postId, userId, text, createdAt) VALUES (?, ?, ?, ?)",
      [postId, req.user.id, String(text).trim(), new Date()],
    );

    const comments = await query(
      `
        SELECT comments.*, COALESCE(users.username, 'Unknown') AS username
        FROM comments
        LEFT JOIN users ON users.id = comments.userId
        WHERE comments.id = ?
        LIMIT 1
      `,
      [result.insertId],
    );

    res.status(201).json(comments[0]);
  } catch (error) {
    next(error);
  }
};

/** GET /comments/:postId — public read of all comments for a post (newest optional). */
exports.getCommentsByPost = async (req, res, next) => {
  const postId = Number(req.params.postId);

  try {
    const comments = await query(
      `
        SELECT comments.*, COALESCE(users.username, 'Unknown') AS username
        FROM comments
        LEFT JOIN users ON users.id = comments.userId
        WHERE comments.postId = ?
        ORDER BY comments.id
      `,
      [postId],
    );

    res.json(comments);
  } catch (error) {
    next(error);
  }
};
