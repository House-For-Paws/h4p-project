/**
 * =============================================================================
 * FILE: server/routes/adminRoutes.js
 * ROLE: Mount /api/admin → adminController (most routes need admin role)
 * =============================================================================
 * Sections: PUBLIC COUNT | STATS | USERS | REPORTS | CONTENT | APPLICATIONS
 * =============================================================================
 */
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getStats,
  getAllUsers,
  setUserBanned,
  warnUser,
  getAllReports,
  updateReportStatus,
  getPendingReportsCount,
  getAllPosts,
  getAllComments,
  deleteComment,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
  deletePet,
} = require("../controllers/adminController");

const adminOnly = [authMiddleware, roleMiddleware("admin")];

// ======================== PUBLIC ========================
router.get("/available-count", async (req, res, next) => {
  try {
    const { query } = require("../config/db");
    const availablePetsRow = await query(
      "SELECT COUNT(*) AS count FROM pets WHERE status = ?",
      ["available"],
    );
    res.json({ count: Number(availablePetsRow[0]?.count || 0) });
  } catch (error) {
    next(error);
  }
});

// ======================== STATS ========================
router.get("/stats", ...adminOnly, getStats);

// ======================== USERS ========================
router.get("/users", ...adminOnly, getAllUsers);
router.patch("/users/:id/ban", ...adminOnly, setUserBanned);
router.post("/users/:id/warn", ...adminOnly, warnUser);

// ======================== REPORTS ========================
router.get("/reports/pending-count", ...adminOnly, getPendingReportsCount);
router.get("/reports", ...adminOnly, getAllReports);
router.patch("/reports/:id", ...adminOnly, updateReportStatus);

// ======================== CONTENT ========================
router.get("/posts", ...adminOnly, getAllPosts);
router.get("/comments", ...adminOnly, getAllComments);
router.delete("/comments/:id", ...adminOnly, deleteComment);
router.delete("/pets/:id", ...adminOnly, deletePet);

// ======================== APPLICATIONS ========================
router.get("/applications", ...adminOnly, getAllApplications);
router.patch("/applications/:id", ...adminOnly, updateApplicationStatus);
router.delete("/applications/:id", ...adminOnly, deleteApplication);

module.exports = router;
