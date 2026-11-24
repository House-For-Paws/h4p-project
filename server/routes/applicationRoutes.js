/**
 * =============================================================================
 * FILE: server/routes/applicationRoutes.js
 * ROLE: Mount /api/applications → applicationController (JWT required)
 * =============================================================================
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createApplication,
  getIncomingApplications,
  getMyApplications,
  updateMyIncomingApplicationStatus,
} = require("../controllers/applicationController");

router.post("/", authMiddleware, createApplication);
router.get("/incoming", authMiddleware, getIncomingApplications);
router.get("/mine", authMiddleware, getMyApplications);
router.patch(
  "/incoming/:id",
  authMiddleware,
  updateMyIncomingApplicationStatus,
);

module.exports = router;
