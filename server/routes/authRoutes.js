const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register); // הרשמה
router.post("/login", login); // התחברות

// route מוגן
router.get("/profile", authMiddleware, (req, res) => {
  res.send({
    message: "You are authenticated",
    user: req.user,
  });
});

module.exports = router;
