/**
 * Express middleware — validates Authorization: Bearer <JWT>, loads fresh user from DB.
 * On success sets req.user { id, email, username, firstname, lastname, role, ...payload }.
 * On failure responds 401 (invalid/missing token).
 */
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../utils/generateToken");
const { query } = require("../config/db");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const users = await query(
      "SELECT id, email, username, firstName, lastName, role FROM users WHERE id = ? LIMIT 1",
      [payload.id],
    );
    const dbUser = users[0];

    if (!dbUser) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      ...payload,
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      firstname: dbUser.firstName || "",
      lastname: dbUser.lastName || "",
      role: String(dbUser.role || "").toLowerCase(),
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
