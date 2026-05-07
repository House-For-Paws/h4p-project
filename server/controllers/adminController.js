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
