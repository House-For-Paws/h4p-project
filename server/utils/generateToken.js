/**
 * =============================================================================
 * FILE: server/utils/generateToken.js
 * ROLE: Create / read JWT secret for auth
 * =============================================================================
 * Exports: generateToken(user), getJwtSecret()
 * Keep payload small — large claims break HTTP Authorization headers.
 * =============================================================================
 */
const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret-change-me";
const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      firstname: user.firstName || user.firstname || "",
      lastname: user.lastName || user.lastname || "",
      role: normalizeRole(user.role || "user"),
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
  );

module.exports = {
  generateToken,
  getJwtSecret,
};
