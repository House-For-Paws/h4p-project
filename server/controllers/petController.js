const { query, run } = require("../config/db");

exports.getPets = async (req, res, next) => {
  const { type, search } = req.query;

  const where = [];
  const params = [];

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
