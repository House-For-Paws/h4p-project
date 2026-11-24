/**
 * =============================================================================
 * FILE: server/controllers/authController.js
 * ROLE: Auth + account handlers for /api/auth/*
 * =============================================================================
 * Sections (search these titles):
 *   HELPERS | REGISTER | LOGIN | FORGOT PASSWORD | PROMOTE
 *   PROFILE | UPDATE PROFILE | CHANGE EMAIL / PASSWORD
 *   PROFILE PICTURE | NOTIFICATION SETTINGS | DELETE ACCOUNT
 * =============================================================================
 */
const { query, run } = require("../config/db");
const { generateToken } = require("../utils/generateToken");
const { hashPassword, verifyPassword } = require("../utils/password");

// ======================== HELPERS ========================
/** Normalize email for storage and lookup (lowercase, trim). */
function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

/** Strip password field before sending user JSON (spread omits hash). */
function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// ======================== REGISTER ========================
/** POST /register — validate, insert user, return JWT. */
exports.register = async (req, res, next) => {
  const {
    username,
    email,
    password,
    confirmPassword,
    phone,
    phoneNumber,
    birthday,
    firstName,
    lastName,
    gender,
  } = req.body;

  const cleanEmail = normalizeEmail(email);
  const cleanUsername = String(username || "").trim();
  const cleanFirstName = String(firstName || "").trim();
  const cleanLastName = String(lastName || "").trim();
  const cleanPhone = String(phoneNumber || phone || "").trim();

  const NAME_REGEX = /^[A-Za-z\u0590-\u05FF][A-Za-z\u0590-\u05FF\s'-]{1,49}$/;
  const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{2,19}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

  if (!cleanUsername || !cleanEmail || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required" });
  }

  if (!cleanFirstName || !NAME_REGEX.test(cleanFirstName)) {
    return res.status(400).json({
      message: "First name must be 2–50 letters (spaces, - and ' allowed)",
    });
  }

  if (!cleanLastName || !NAME_REGEX.test(cleanLastName)) {
    return res.status(400).json({
      message: "Last name must be 2–50 letters (spaces, - and ' allowed)",
    });
  }

  if (!USERNAME_REGEX.test(cleanUsername)) {
    return res.status(400).json({
      message:
        "Username must be 3–20 chars, start with a letter (A–Z, 0–9, _)",
    });
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({
      message: "Password must include at least one letter and one number",
    });
  }

  if (cleanPhone && !PHONE_REGEX.test(cleanPhone)) {
    return res.status(400).json({
      message: "Use a valid phone number (7–20 digits, optional + - ( ))",
    });
  }

  try {
    const existingUsers = await query(
      "SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1",
      [cleanEmail, cleanUsername.toLowerCase()],
    );

    if (existingUsers.length) {
      return res.status(409).json({ message: "User already exists" });
    }

    const createdAt = new Date();
    const result = await run(
      `
        INSERT INTO users
          (username, email, password, phone, birthday, firstName, lastName, gender, role, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        cleanUsername,
        cleanEmail,
        hashPassword(password),
        cleanPhone,
        birthday || "",
        cleanFirstName,
        cleanLastName,
        gender || "",
        "user",
        createdAt,
      ],
    );

    const newUser = {
      id: result.insertId,
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      birthday: birthday || "",
      firstName: cleanFirstName,
      lastName: cleanLastName,
      gender: gender || "",
      role: "user",
      createdAt,
    };

    res.status(201).json({
      message: "Registration successful",
      token: generateToken(newUser),
      user: publicUser(newUser),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /login — find user by email OR username (same field), verify password, return JWT.
 */
// ======================== LOGIN ========================
exports.login = async (req, res, next) => {
  const { email, username, password } = req.body;
  const login = normalizeEmail(email || username);
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{2,19}$/;

  if (!login || !password) {
    return res
      .status(400)
      .json({ message: "Email or username and password are required" });
  }

  if (!EMAIL_REGEX.test(login) && !USERNAME_REGEX.test(login)) {
    return res
      .status(400)
      .json({ message: "Enter a valid email or username" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const users = await query(
      "SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1",
      [login, login.toLowerCase()],
    );
    const user = users[0];

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (Number(user.isBanned) === 1) {
      const reason = String(user.banReason || "").trim();
      const detail = String(user.banDescription || "").trim();
      return res.status(403).json({
        message: "This account has been banned.",
        banned: true,
        banReason: reason || null,
        banDescription: detail || null,
      });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /forgot-password — demo reset flow by email (no OTP yet).
 * Validates email and new password, updates stored hash for matching user.
 */
// ======================== FORGOT PASSWORD ========================
exports.forgotPassword = async (req, res, next) => {
  const { email, newPassword, confirmNewPassword } = req.body;
  const cleanEmail = normalizeEmail(email);
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!cleanEmail || !newPassword || !confirmNewPassword) {
    return res
      .status(400)
      .json({ message: "Email, new password, and confirmation are required" });
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters" });
  }

  if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({
      message: "Password must include at least one letter and one number",
    });
  }

  if (String(newPassword) !== String(confirmNewPassword)) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  try {
    const users = await query("SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1", [
      cleanEmail,
    ]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "No account found for this email" });
    }

    await run("UPDATE users SET password = ? WHERE id = ?", [
      hashPassword(newPassword),
      user.id,
    ]);

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /promote — bootstraps admin role given ADMIN_SECRET env + target email (no user JWT).
 */
// ======================== PROMOTE (ADMIN SECRET) ========================
exports.promote = async (req, res, next) => {
  const { email, secret } = req.body;
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail || !secret) {
    return res.status(400).json({ message: "Email and secret are required" });
  }

  if (secret !== (process.env.ADMIN_SECRET || "h4p-admin-secret")) {
    return res.status(403).json({ message: "Invalid secret" });
  }

  try {
    const result = await run("UPDATE users SET role = ? WHERE email = ?", [
      "admin",
      cleanEmail,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User promoted to admin" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /profile — full user row for authenticated user (req.user.id from JWT middleware).
 */
// ======================== PROFILE ========================
exports.profile = async (req, res, next) => {
  try {
    const users = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [
      req.user.id,
    ]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /profile — update editable fields; issues NEW JWT so client replaces stale token.
 */
// ======================== UPDATE PROFILE ========================
exports.updateProfile = async (req, res, next) => {
  const { firstName, lastName, phone, gender, birthday } = req.body;

  const cleanFirstName = String(firstName ?? "").trim();
  const cleanLastName = String(lastName ?? "").trim();
  const cleanPhone = String(phone ?? "").trim();
  const cleanGender = String(gender ?? "").trim();
  const cleanBirthday = String(birthday ?? "").trim();

  if (!cleanFirstName || !cleanLastName) {
    return res
      .status(400)
      .json({ message: "First name and last name are required" });
  }

  try {
    await run(
      `
        UPDATE users
        SET firstName = ?, lastName = ?, phone = ?, gender = ?, birthday = ?
        WHERE id = ?
      `,
      [
        cleanFirstName,
        cleanLastName,
        cleanPhone,
        cleanGender,
        cleanBirthday,
        req.user.id,
      ],
    );

    const users = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [
      req.user.id,
    ]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /change-email — verifies current password, ensures new email unique, updates + new JWT.
 */
// ======================== CHANGE EMAIL ========================
exports.changeEmail = async (req, res, next) => {
  const { newEmail, currentPassword } = req.body;
  const cleanEmail = normalizeEmail(newEmail);

  if (!cleanEmail || !currentPassword) {
    return res
      .status(400)
      .json({ message: "New email and current password are required" });
  }

  try {
    const users = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [
      req.user.id,
    ]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const existingUsers = await query(
      "SELECT id FROM users WHERE LOWER(email) = ? AND id <> ? LIMIT 1",
      [cleanEmail, req.user.id],
    );

    if (existingUsers.length) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    await run("UPDATE users SET email = ? WHERE id = ?", [cleanEmail, req.user.id]);

    const refreshedUsers = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [
      req.user.id,
    ]);
    const refreshedUser = refreshedUsers[0];

    res.json({
      message: "Email updated successfully",
      token: generateToken(refreshedUser),
      user: publicUser(refreshedUser),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /change-password — verifies old password, stores new PBKDF2 hash (no token rotate required).
 */
// ======================== CHANGE PASSWORD ========================
exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current password and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters" });
  }

  if (
    confirmNewPassword !== undefined &&
    String(confirmNewPassword) !== String(newPassword)
  ) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  try {
    const users = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [
      req.user.id,
    ]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    await run("UPDATE users SET password = ? WHERE id = ?", [
      hashPassword(newPassword),
      req.user.id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /profile-picture — stores data:image/* base64 in DB (size-capped); returns new JWT.
 */
// ======================== PROFILE PICTURE ========================
exports.updateProfilePicture = async (req, res, next) => {
  const { imageData } = req.body;
  const cleanImageData = String(imageData || "").trim();

  if (!cleanImageData) {
    return res.status(400).json({ message: "Image data is required" });
  }

  if (!cleanImageData.startsWith("data:image/")) {
    return res.status(400).json({ message: "Invalid image format" });
  }

  if (cleanImageData.length > 2_000_000) {
    return res.status(400).json({ message: "Image is too large" });
  }

  try {
    await run("UPDATE users SET profile_picture = ? WHERE id = ?", [
      cleanImageData,
      req.user.id,
    ]);

    const users = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [
      req.user.id,
    ]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile picture updated successfully",
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /notification-settings — boolean flags persisted as 0/1 in users table.
 */
// ======================== NOTIFICATION SETTINGS ========================
exports.updateNotificationSettings = async (req, res, next) => {
  const { notifyNewPets, notifyApplicationUpdates } = req.body;

  try {
    await run(
      `
        UPDATE users
        SET notify_new_pets = ?, notify_application_updates = ?
        WHERE id = ?
      `,
      [notifyNewPets ? 1 : 0, notifyApplicationUpdates ? 1 : 0, req.user.id],
    );

    const users = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [
      req.user.id,
    ]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Notification settings updated successfully",
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /account — irreversible row delete after password check + "DELETE" confirmation string.
 */
// ======================== DELETE ACCOUNT ========================
exports.deleteAccount = async (req, res, next) => {
  const { currentPassword, confirmationText } = req.body;

  if (!currentPassword || !confirmationText) {
    return res
      .status(400)
      .json({ message: "Password and confirmation text are required" });
  }

  if (String(confirmationText).trim().toUpperCase() !== "DELETE") {
    return res.status(400).json({ message: "Type DELETE to confirm account removal" });
  }

  try {
    const users = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [
      req.user.id,
    ]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    await run("DELETE FROM users WHERE id = ?", [req.user.id]);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};
