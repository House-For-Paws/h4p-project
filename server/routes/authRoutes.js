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

// ----- Public -----
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/promote", promote);

// ----- Authenticated -----
router.get("/profile", authMiddleware, profile);
router.patch("/profile", authMiddleware, updateProfile);
router.patch("/change-email", authMiddleware, changeEmail);
router.patch("/change-password", authMiddleware, changePassword);
router.patch("/profile-picture", authMiddleware, updateProfilePicture);
router.patch("/notification-settings", authMiddleware, updateNotificationSettings);
router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;
