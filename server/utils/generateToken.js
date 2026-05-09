/**
 * JWT creation — signed with JWT_SECRET; embeds user identity claims for stateless auth.
 * Never put huge blobs in payload (browser sends Bearer token on every request).
 */
const jwt = require("jsonwebtoken");

/** Reads secret from env — MUST override default in production. */
const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret-change-me";
/** Normalize role strings for consistent compares (admin vs Admin). */
const normalizeRole = (role) => String(role || "").trim().toLowerCase();

/** Keep payload small — large fields (e.g. base64 profile_picture) break HTTP header limits (431). */
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
