/**
 * =============================================================================
 * FILE: server/routes/reportRoutes.js
 * ROLE: Mount /api/reports → reportController (JWT required)
 * =============================================================================
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createReport } = require("../controllers/reportController");

router.post("/", authMiddleware, createReport);

module.exports = router;
