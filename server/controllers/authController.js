const { readDb, writeDb, getNextId } = require("../config/db");
const { generateToken } = require("../utils/generateToken");
const { hashPassword, verifyPassword } = require("../utils/password");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

exports.register = (req, res) => {
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

  const db = readDb();
  const userExists = db.users.some(
    (user) =>
      normalizeEmail(user.email) === cleanEmail ||
      String(user.username || "").toLowerCase() === cleanUsername.toLowerCase(),
  );

  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const newUser = {
    id: getNextId(db.users),
    username: cleanUsername,
    email: cleanEmail,
    password: hashPassword(password),
    phone: phoneNumber || phone || "",
    birthday: birthday || "",
    firstName: firstName || "",
    lastName: lastName || "",
    gender: gender || "",
    role: "user",
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  res.status(201).json({
    message: "Registration successful",
    token: generateToken(newUser),
    user: publicUser(newUser),
  });
};

exports.login = (req, res) => {
  const { email, username, password } = req.body;
  const login = normalizeEmail(email || username);

  if (!login || !password) {
    return res
      .status(400)
      .json({ message: "Email or username and password are required" });
  }

  const db = readDb();
  const user = db.users.find(
    (item) =>
      normalizeEmail(item.email) === login ||
      String(item.username || "").toLowerCase() === login.toLowerCase(),
  );

  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    message: "Login successful",
    token: generateToken(user),
    user: publicUser(user),
  });
};

exports.profile = (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user: publicUser(user) });
};
