/**
 * =============================================================================
 * FILE: server/utils/secrets.js
 * ROLE: Reject weak / missing JWT and ADMIN secrets
 * =============================================================================
 */
const WEAK_SECRETS = new Set([
  "",
  "change-this-secret",
  "dev-secret-change-me",
  "h4p-admin-secret",
  "secret",
  "password",
  "jwt-secret",
  "admin",
]);

function isWeakSecret(value) {
  const clean = String(value || "").trim();
  if (clean.length < 16) return true;
  return WEAK_SECRETS.has(clean.toLowerCase());
}

function assertRuntimeSecrets() {
  const jwtSecret = String(process.env.JWT_SECRET || "").trim();
  const adminSecret = String(process.env.ADMIN_SECRET || "").trim();

  if (!jwtSecret || isWeakSecret(jwtSecret)) {
    throw new Error(
      "JWT_SECRET is missing or too weak. Set a strong value (16+ chars) in server/.env",
    );
  }

  if (!adminSecret || isWeakSecret(adminSecret)) {
    throw new Error(
      "ADMIN_SECRET is missing or too weak. Set a strong value (16+ chars) in server/.env",
    );
  }
}

function getAdminSecret() {
  const adminSecret = String(process.env.ADMIN_SECRET || "").trim();
  if (!adminSecret || isWeakSecret(adminSecret)) {
    return null;
  }
  return adminSecret;
}

module.exports = {
  isWeakSecret,
  assertRuntimeSecrets,
  getAdminSecret,
};
