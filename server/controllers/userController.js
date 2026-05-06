const { readDb } = require("../config/db");

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

exports.getMe = (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user: publicUser(user) });
};

exports.getUsers = (req, res) => {
  const db = readDb();
  res.json(db.users.map(publicUser));
};
