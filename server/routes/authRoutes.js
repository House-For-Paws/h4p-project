/**
 * =============================================================================
 * FILE: server/routes/authRoutes.js
 * ROLE: Mount /api/auth → authController
 * =============================================================================
 * Public:  register, login, forgot-password, promote
 * Authed:  profile, change-email/password, picture, notify settings, delete
 * =============================================================================
 */
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  profile,
  promote,
  updateProfile,
  changeEmail,
  changePassword,
  updateProfilePicture,
  updateNotificationSettings,
  deleteAccount,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { createRateLimiter } = require("../middleware/rateLimit");

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: "Too many auth attempts. Try again in a few minutes.",
});
const promoteLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many promote attempts. Try again later.",
});

// ----- Public -----
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/promote", promoteLimiter, promote);

// ----- Authenticated -----
router.get("/profile", authMiddleware, profile);
router.patch("/profile", authMiddleware, updateProfile);
router.patch("/change-email", authMiddleware, changeEmail);
router.patch("/change-password", authMiddleware, changePassword);
router.patch("/profile-picture", authMiddleware, updateProfilePicture);
router.patch("/notification-settings", authMiddleware, updateNotificationSettings);
router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;
