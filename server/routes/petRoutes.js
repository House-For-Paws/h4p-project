/**
 * =============================================================================
 * FILE: server/routes/petRoutes.js
 * ROLE: Mount /api/pets → petController
 * =============================================================================
 * Public (optional auth): list, get by id, view, list comments
 * Authed: create, like, favorite, add comment, delete, my favorites
 * =============================================================================
 */
const express = require("express");
const router = express.Router();

const {
  getPets,
  getPetById,
  recordPetView,
  createPet,
  deletePet,
  togglePetLike,
  togglePetFavorite,
  getMyFavoritePets,
  getPetComments,
  addPetComment,
} = require("../controllers/petController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

// ----- Read -----
router.get("/", optionalAuthMiddleware, getPets);
router.get("/favorites/mine", authMiddleware, getMyFavoritePets);
router.get("/:id", optionalAuthMiddleware, getPetById);
router.get("/:id/comments", getPetComments);

// ----- Write -----
router.post("/", authMiddleware, createPet);
router.post("/:id/view", optionalAuthMiddleware, recordPetView);
router.post("/:id/like", authMiddleware, togglePetLike);
router.post("/:id/favorite", authMiddleware, togglePetFavorite);
router.post("/:id/comments", authMiddleware, addPetComment);
router.delete("/:id", authMiddleware, deletePet);

module.exports = router;
