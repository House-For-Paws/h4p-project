/**
 * authController — /api/auth/* handlers: register, login, profile CRUD, security settings.
 * Uses: MySQL (users), JWT (generateToken), PBKDF2 (hashPassword/verifyPassword).
 * Never return password hash to client — use publicUser().
 */
const { query, run } = require("../config/db");
const { generateToken } = require("../utils/generateToken");
const { hashPassword, verifyPassword } = require("../utils/password");

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

/**
 * POST /register — validate body, ensure unique email/username, INSERT user, return JWT.
 */
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

  if (!cleanUsername || !cleanEmail || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required" });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
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
        phoneNumber || phone || "",
        birthday || "",
        firstName || "",
        lastName || "",
        gender || "",
        "user",
        createdAt,
      ],
    );

    const newUser = {
      id: result.insertId,
      username: cleanUsername,
      email: cleanEmail,
      phone: phoneNumber || phone || "",
      birthday: birthday || "",
      firstName: firstName || "",
      lastName: lastName || "",
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
exports.login = async (req, res, next) => {
  const { email, username, password } = req.body;
  const login = normalizeEmail(email || username);

  if (!login || !password) {
    return res
      .status(400)
      .json({ message: "Email or username and password are required" });
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
 * POST /promote — bootstraps admin role given ADMIN_SECRET env + target email (no user JWT).
 */
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
