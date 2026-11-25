/**
 * =============================================================================
 * FILE: server/routes/blockRoutes.js
 * ROLE: Mount /api/blocks → blockController (JWT required)
 * =============================================================================
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMyBlocks,
  blockUser,
  unblockUser,
} = require("../controllers/blockController");

router.get("/", authMiddleware, getMyBlocks);
router.post("/", authMiddleware, blockUser);
router.delete("/:userId", authMiddleware, unblockUser);

module.exports = router;
