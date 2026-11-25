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
const { isWeakSecret } = require("./secrets");

const getJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || "").trim();
  if (!secret || isWeakSecret(secret)) {
    throw new Error(
      "JWT_SECRET is missing or too weak. Set a strong value in server/.env",
    );
  }
  return secret;
};

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
