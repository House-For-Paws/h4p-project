const express = require("express");
const router = express.Router();

const { getPets, getPetById, createPet } = require("../controllers/petController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getPets);
router.get("/:id", getPetById);
router.post("/", authMiddleware, createPet);

module.exports = router;
