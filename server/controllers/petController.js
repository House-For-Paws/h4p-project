const { readDb, writeDb, getNextId } = require("../config/db");

exports.getPets = (req, res) => {
  const db = readDb();
  const { type, search } = req.query;

  let pets = db.pets;

  if (type && type !== "all") {
    pets = pets.filter((pet) => pet.type === type);
  }

  if (search) {
    const term = String(search).toLowerCase();
    pets = pets.filter(
      (pet) =>
        pet.name.toLowerCase().includes(term) ||
        pet.breed.toLowerCase().includes(term) ||
        pet.location.toLowerCase().includes(term),
    );
  }

  res.json(pets);
};

exports.getPetById = (req, res) => {
  const db = readDb();
  const pet = db.pets.find((item) => item.id === Number(req.params.id));

  if (!pet) {
    return res.status(404).json({ message: "Pet not found" });
  }

  res.json(pet);
};

exports.createPet = (req, res) => {
  const { name, breed, age, location, type, image, gender } = req.body;

  if (!name || !breed || !age || !location || !type || !gender) {
    return res.status(400).json({ message: "Missing pet fields" });
  }

  const db = readDb();
  const newPet = {
    id: getNextId(db.pets),
    name,
    breed,
    age,
    location,
    type,
    image: image || "",
    gender,
    status: "available",
    ownerId: req.user.id,
    createdAt: new Date().toISOString(),
  };

  db.pets.push(newPet);
  writeDb(db);

  res.status(201).json(newPet);
};
