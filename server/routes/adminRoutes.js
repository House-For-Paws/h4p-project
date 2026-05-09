/** /api/admin — dashboard aggregates + listings; most routes require admin role. */
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getStats,
  getAllUsers,
  getAllPosts,
  getAllComments,
} = require("../controllers/adminController");

// Public endpoint for available pets count (no auth required)
router.get("/available-count", async (req, res, next) => {
  try {
    const { query } = require("../config/db");

    // Debug: Check all pets and their status
    const [allPets] = await query("SELECT id, name, status FROM pets");
    console.log("All pets in database:", allPets);

    const [availablePetsRow] = await query(
      "SELECT COUNT(*) AS count FROM pets WHERE status = ?",
      ["available"],
    );
    console.log("Available pets count:", availablePetsRow.count);

    res.json({ count: availablePetsRow.count });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/stats",
  (req, res, next) => {
    console.log(
      "DEBUG: admin/stats route hit",
      req.headers.authorization ? "with token" : "no token",
    );
    console.log("DEBUG: req.method:", req.method, "req.path:", req.path);
    next();
  },
  authMiddleware,
  (req, res, next) => {
    console.log("DEBUG: after auth middleware, req.user:", req.user);
    next();
  },
  roleMiddleware("admin"),
  (req, res, next) => {
    console.log("DEBUG: after role middleware");
    next();
  },
  getStats,
);
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/posts", authMiddleware, roleMiddleware("admin"), getAllPosts);
router.get("/comments", authMiddleware, roleMiddleware("admin"), getAllComments);

console.log(
  "DEBUG adminRoutes paths:",
  router.stack.map((layer) => layer.route && layer.route.path),
);
module.exports = router;
