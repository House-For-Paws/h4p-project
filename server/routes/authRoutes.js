/**
 * Maps HTTP paths under /api/auth to authController handlers.
 * Protected routes list authMiddleware first so req.user is populated.
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

router.post("/register", register); // Public — sign up
router.post("/login", login); // Public — JWT issuance
router.post("/forgot-password", forgotPassword); // Public — email based reset (OTP TBD)
router.get("/profile", authMiddleware, profile); // Current user snapshot
router.patch("/profile", authMiddleware, updateProfile); // Names, phone, gender, birthday
router.patch("/change-email", authMiddleware, changeEmail); // Requires current password
router.patch("/change-password", authMiddleware, changePassword);
router.patch("/profile-picture", authMiddleware, updateProfilePicture); // Base64 data URL
router.patch("/notification-settings", authMiddleware, updateNotificationSettings);
router.delete("/account", authMiddleware, deleteAccount); // DELETE + password confirm
router.post("/promote", promote); // Dev/admin lift — uses ADMIN_SECRET body field

module.exports = router;
