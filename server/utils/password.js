/**
 * =============================================================================
 * FILE: server/utils/password.js
 * ROLE: Password hash + verify (PBKDF2)
 * =============================================================================
 * Stored format: "iterations:saltHex:hashHex"
 * Exports: hashPassword, verifyPassword
 * =============================================================================
 */
const crypto = require("crypto");

const HASH_ALGORITHM = "sha256";
const HASH_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 64;

// ======================== HASH ========================
/** Create salted hash for users.password. */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_ALGORITHM)
    .toString("hex");

  return `${HASH_ITERATIONS}:${salt}:${hash}`;
}

// ======================== VERIFY ========================
/** Compare login password to stored hash (timing-safe). */
function verifyPassword(password, storedPassword) {
  const parts = String(storedPassword || "").split(":");

  if (parts.length !== 3) {
    return password === storedPassword;
  }

  const [iterations, salt, originalHash] = parts;
  const hash = crypto
    .pbkdf2Sync(
      password,
      salt,
      Number(iterations),
      HASH_KEY_LENGTH,
      HASH_ALGORITHM,
    )
    .toString("hex");

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
}

module.exports = {
  hashPassword,
  verifyPassword,
};
