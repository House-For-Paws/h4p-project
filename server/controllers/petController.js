/**
 * petController — CRUD-adjacent handlers for adoptable pets listing (pets table).
 * getPets builds dynamic WHERE from query string; createPet ties listing to req.user (JWT).
 */
const { query, run } = require("../config/db");

/** GET /api/pets — optional filters: ?type=dog|cat|all, ?search=substring across name/breed/location. */
exports.getPets = async (req, res, next) => {
  const { type, search } = req.query;

  const where = []; // SQL fragments AND-joined
  const params = []; // Bound values for prepared statement

  if (type && type !== "all") {
    where.push("type = ?");
    params.push(type);
  }

  if (search) {
    const term = `%${String(search).toLowerCase()}%`;
    where.push(
      "(LOWER(name) LIKE ? OR LOWER(breed) LIKE ? OR LOWER(location) LIKE ?)",
    );
    params.push(term, term, term);
  }

  try {
    const pets = await query(
      `SELECT * FROM pets ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id`,
      params,
    );
    res.json(pets);
  } catch (error) {
    next(error);
  }
};

/** GET /api/pets/:id — single row or 404. */
exports.getPetById = async (req, res, next) => {
  try {
    const pets = await query("SELECT * FROM pets WHERE id = ? LIMIT 1", [
      Number(req.params.id),
    ]);
    const pet = pets[0];

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json(pet);
  } catch (error) {
    next(error);
  }
};

/** POST /api/pets — auth required; inserts listing with ownerId = authenticated user. */
exports.createPet = async (req, res, next) => {
  const { name, breed, age, location, type, image, gender } = req.body;

  if (!name || !breed || !age || !location || !type || !gender) {
    return res.status(400).json({ message: "Missing pet fields" });
  }

  try {
    const createdAt = new Date();
    const result = await run(
      `
        INSERT INTO pets
          (name, breed, age, location, type, image, gender, status, ownerId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        breed,
        age,
        location,
        type,
        image || "",
        gender,
        "available",
        req.user.id,
        createdAt,
      ],
    );

    const pets = await query("SELECT * FROM pets WHERE id = ? LIMIT 1", [result.insertId]);

    res.status(201).json(pets[0]);
  } catch (error) {
    next(error);
  }
};
