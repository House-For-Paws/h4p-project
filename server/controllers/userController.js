const { query } = require("../config/db");

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

exports.getMe = async (req, res, next) => {
  try {
    const users = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.user.id]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await query("SELECT * FROM users ORDER BY id");
    res.json(users.map(publicUser));
  } catch (error) {
    next(error);
  }
};
