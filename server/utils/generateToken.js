const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret-change-me";

const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || "user",
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
  );

module.exports = {
  generateToken,
  getJwtSecret,
};
