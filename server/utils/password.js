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

  // Reject legacy/plaintext rows — all passwords must be PBKDF2.
  if (parts.length !== 3) {
    return false;
  }

  const [iterationsRaw, salt, originalHash] = parts;
  const iterations = Number(iterationsRaw);
  if (!iterations || !salt || !originalHash) {
    return false;
  }

  const hash = crypto
    .pbkdf2Sync(
      password,
      salt,
      iterations,
      HASH_KEY_LENGTH,
      HASH_ALGORITHM,
    )
    .toString("hex");

  const a = Buffer.from(hash);
  const b = Buffer.from(originalHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
