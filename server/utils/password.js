/**
 * Password hashing utilities — PBKDF2 with random salt (no plain-text storage).
 * Stored format: "iterations:saltHex:hashHex" — verify recomputes hash with same salt.
 */
const crypto = require("crypto"); // Node crypto for PBKDF2 + secure compare

const HASH_ALGORITHM = "sha256";
const HASH_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 64;

/**
 * Create salted hash string suitable for users.password column.
 * @param {string} password — plain text from registration/password change
 * @returns {string} iterations:salt:hash
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_ALGORITHM)
    .toString("hex");

  return `${HASH_ITERATIONS}:${salt}:${hash}`;
}

/**
 * Compare login password against stored hash; supports legacy plain-text fallback (3-part split).
 * Uses timing-safe equality when comparing derived hashes.
 */
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
