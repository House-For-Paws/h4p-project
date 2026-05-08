const express = require("express");
const router = express.Router();

const {
  register,
  login,
  profile,
  promote,
  updateProfile,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);
router.patch("/profile", authMiddleware, updateProfile);
router.post("/promote", promote);

module.exports = router;
