const { query } = require("../config/db");

exports.getStats = async (req, res, next) => {
  try {
    const [usersRow] = await query("SELECT COUNT(*) AS count FROM users");
    const [petsRow] = await query("SELECT COUNT(*) AS count FROM pets");
    const [postsRow] = await query("SELECT COUNT(*) AS count FROM posts");
    const [commentsRow] = await query("SELECT COUNT(*) AS count FROM comments");

    const [availablePetsRow] = await query(
      "SELECT COUNT(*) AS count FROM pets WHERE status = ?",
      ["available"]
    );

    const [recentUsers] = await query(
      `SELECT id, username, email, createdAt FROM users ORDER BY createdAt DESC LIMIT 5`
    );

    const [recentPets] = await query(
      `SELECT id, name, breed, status, createdAt FROM pets ORDER BY createdAt DESC LIMIT 5`
    );

    res.json({
      stats: {
        totalUsers: usersRow.count,
        totalPets: petsRow.count,
        totalPosts: postsRow.count,
        totalComments: commentsRow.count,
        availablePets: availablePetsRow.count,
      },
      recentUsers,
      recentPets,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await query(
      `
        SELECT id, username, email, role, createdAt
        FROM users
        ORDER BY createdAt DESC
      `,
    );
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await query(
      `
        SELECT posts.id, posts.title, posts.createdAt, posts.userId,
               COALESCE(users.username, 'Unknown') AS username
        FROM posts
        LEFT JOIN users ON users.id = posts.userId
        ORDER BY posts.createdAt DESC, posts.id DESC
      `,
    );
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

exports.getAllComments = async (req, res, next) => {
  try {
    const comments = await query(
      `
        SELECT comments.id, comments.postId, comments.userId, comments.text, comments.createdAt,
               COALESCE(users.username, 'Unknown') AS username
        FROM comments
        LEFT JOIN users ON users.id = comments.userId
        ORDER BY comments.createdAt DESC, comments.id DESC
      `,
    );
    res.json(comments);
  } catch (error) {
    next(error);
  }
};
