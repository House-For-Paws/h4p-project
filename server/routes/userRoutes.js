/** /api/users — current user shortcut + admin-only directory listing. */
const express = require("express");
const router = express.Router();

const { getMe, getUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/me", authMiddleware, getMe); // Mirror of profile-style payload
router.get("/", authMiddleware, roleMiddleware("admin"), getUsers); // Admin dashboard user table

module.exports = router;
