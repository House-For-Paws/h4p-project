const { readDb, writeDb, getNextId } = require("../config/db");

function enrichComment(comment, users) {
  const user = users.find((item) => item.id === comment.userId);

  return {
    ...comment,
    username: user ? user.username : "Unknown",
  };
}

exports.createComment = (req, res) => {
  const postId = Number(req.params.postId);
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  const db = readDb();
  const post = db.posts.find((item) => item.id === postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const newComment = {
    id: getNextId(db.comments),
    postId,
    userId: req.user.id,
    text: String(text).trim(),
    createdAt: new Date().toISOString(),
  };

  db.comments.push(newComment);
  writeDb(db);

  res.status(201).json(enrichComment(newComment, db.users));
};

exports.getCommentsByPost = (req, res) => {
  const postId = Number(req.params.postId);
  const db = readDb();
  const postComments = db.comments
    .filter((comment) => comment.postId === postId)
    .map((comment) => enrichComment(comment, db.users));

  res.json(postComments);
};
