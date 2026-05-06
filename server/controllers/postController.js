const { readDb, writeDb, getNextId } = require("../config/db");

function enrichPost(post, users) {
  const user = users.find((item) => item.id === post.userId);

  return {
    ...post,
    username: user ? user.username : "Unknown",
    phone: user ? user.phone : null,
  };
}

exports.createPost = (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  const db = readDb();
  const newPost = {
    id: getNextId(db.posts),
    title: String(title).trim(),
    description: String(description).trim(),
    userId: req.user.id,
    createdAt: new Date().toISOString(),
  };

  db.posts.push(newPost);
  writeDb(db);

  res.status(201).json(enrichPost(newPost, db.users));
};

exports.getPosts = (req, res) => {
  const db = readDb();
  res.json(db.posts.map((post) => enrichPost(post, db.users)));
};

exports.deletePost = (req, res) => {
  const postId = Number(req.params.id);
  const db = readDb();
  const post = db.posts.find((item) => item.id === postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }

  db.posts = db.posts.filter((item) => item.id !== postId);
  db.comments = db.comments.filter((comment) => comment.postId !== postId);
  writeDb(db);

  res.json({ message: "Post deleted" });
};
