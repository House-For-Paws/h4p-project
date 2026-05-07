const { query, run } = require("../config/db");
const { generateToken } = require("../utils/generateToken");
const { hashPassword, verifyPassword } = require("../utils/password");

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

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
