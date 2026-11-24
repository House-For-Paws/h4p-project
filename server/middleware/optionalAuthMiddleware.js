/**
 * =============================================================================
 * FILE: server/middleware/optionalAuthMiddleware.js
 * ROLE: Optional JWT — sets req.user when token is valid, never returns 401
 * =============================================================================
 * Use on public pages that still show likedByMe / favoritedByMe when logged in.
 * =============================================================================
 */
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../utils/generateToken");
const { query } = require("../config/db");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, getJwtSecret());
    const users = await query(
      "SELECT id, email, username, firstName, lastName, role, isBanned FROM users WHERE id = ? LIMIT 1",
      [payload.id],
    );
    const dbUser = users[0];
    if (dbUser && Number(dbUser.isBanned) !== 1) {
      req.user = {
        ...payload,
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        firstname: dbUser.firstName || "",
        lastname: dbUser.lastName || "",
        role: String(dbUser.role || "").toLowerCase(),
      };
    }
  } catch {
    /* ignore invalid token on public endpoints */
  }
  next();
};
