/**
 * =============================================================================
 * FILE: server/middleware/authMiddleware.js
 * ROLE: Required JWT auth — blocks request if token missing/invalid/banned
 * =============================================================================
 * Sets req.user = { id, email, username, firstname, lastname, role, ... }
 * Use on protected routes (profile, like, comment, admin, …).
 * =============================================================================
 */
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../utils/generateToken");
const { query } = require("../config/db");

module.exports = async (req, res, next) => {
  // ----- 1) Read Bearer token -----
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ----- 2) Verify JWT + reload user from DB -----
    const payload = jwt.verify(token, getJwtSecret());
    const users = await query(
      "SELECT id, email, username, firstName, lastName, role, isBanned FROM users WHERE id = ? LIMIT 1",
      [payload.id],
    );
    const dbUser = users[0];

    if (!dbUser) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // ----- 3) Block banned accounts -----
    if (Number(dbUser.isBanned) === 1) {
      return res.status(403).json({ message: "This account has been banned" });
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
