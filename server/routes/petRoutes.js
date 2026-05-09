/** /api/pets — public read; create requires JWT (shelter/user listing). */
const express = require("express");
const router = express.Router();

const { getPets, getPetById, createPet } = require("../controllers/petController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getPets); // List + filters
router.get("/:id", getPetById); // Detail (numeric id)
router.post("/", authMiddleware, createPet); // New pet row

module.exports = router;
