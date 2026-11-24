/**
 * =============================================================================
 * FILE: server/routes/userRoutes.js
 * ROLE: Mount /api/users → userController
 * =============================================================================
 */
const express = require("express");
const router = express.Router();

const { getMe, getUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/me", authMiddleware, getMe);
router.get("/", authMiddleware, roleMiddleware("admin"), getUsers);

module.exports = router;
