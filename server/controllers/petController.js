/**
 * =============================================================================
 * FILE: server/controllers/petController.js
 * ROLE: Pet listings, likes, favorites, comments, views
 * =============================================================================
 * Sections: HELPERS | LIST / GET | VIEWS | CREATE | LIKES | FAVORITES
 *           COMMENTS | DELETE LISTING
 * =============================================================================
 */
const { query, run } = require("../config/db");

const PET_TRAIT_KEYS = [
  "fromStreet",
  "forAdoption",
  "vaccinated",
  "neutered",
  "microchipped",
  "houseTrained",
  "goodWithKids",
  "goodWithPets",
  "specialNeeds",
];

function normalizeTraits(raw) {
  const traits = Object.fromEntries(PET_TRAIT_KEYS.map((key) => [key, false]));
  let source = raw;
  if (Buffer.isBuffer(source)) source = source.toString("utf8");
  if (typeof source === "string" && source.trim()) {
    try {
      source = JSON.parse(source);
    } catch {
      source = {};
    }
  }
  if (!source || typeof source !== "object") return traits;
  PET_TRAIT_KEYS.forEach((key) => {
    traits[key] = Boolean(source[key]);
  });
  return traits;
}

function cleanTraitsPayload(raw) {
  const traits = normalizeTraits(raw);
  return JSON.stringify(traits);
}

/** Normalize DB pet row so clients always receive images as a string array. */
function normalizePet(pet) {
  if (!pet) return pet;

  let rawImages = pet.images;
  if (Buffer.isBuffer(rawImages)) {
    rawImages = rawImages.toString("utf8");
  }

  let images = [];
  if (typeof rawImages === "string" && rawImages.trim()) {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) images = parsed;
    } catch {
      images = [];
    }
  } else if (Array.isArray(rawImages)) {
    images = rawImages;
  }

  images = images.map((url) => String(url || "").trim()).filter(Boolean);
  if (!images.length && pet.image) {
    images = [String(pet.image).trim()].filter(Boolean);
  }

  return {
    ...pet,
    image: images[0] || pet.image || "",
    images,
    traits: normalizeTraits(pet.traits),
    likeCount: Number(pet.likeCount || 0),
    commentCount: Number(pet.commentCount || 0),
    viewCount: Number(pet.viewCount || 0),
    likedByMe: Boolean(Number(pet.likedByMe || 0)),
    favoritedByMe: Boolean(Number(pet.favoritedByMe || 0)),
    requestedByMe: Boolean(Number(pet.requestedByMe || 0)),
    myApplicationStatus: pet.myApplicationStatus
      ? String(pet.myApplicationStatus).toLowerCase()
      : null,
  };
}

function engagementSelect(userId) {
  const likedSelect = userId
    ? `EXISTS(
         SELECT 1 FROM pet_likes plme
         WHERE plme.petId = pets.id AND plme.userId = ${Number(userId)}
       ) AS likedByMe`
    : "0 AS likedByMe";
  const favoritedSelect = userId
    ? `EXISTS(
         SELECT 1 FROM pet_favorites pfme
         WHERE pfme.petId = pets.id AND pfme.userId = ${Number(userId)}
       ) AS favoritedByMe`
    : "0 AS favoritedByMe";
  const requestedSelect = userId
    ? `EXISTS(
         SELECT 1 FROM adoption_applications aame
         WHERE aame.petId = pets.id
           AND aame.applicantId = ${Number(userId)}
           AND LOWER(aame.status) = 'pending'
       ) AS requestedByMe`
    : "0 AS requestedByMe";
  const myAppStatusSelect = userId
    ? `(
         SELECT a.status
         FROM adoption_applications a
         WHERE a.petId = pets.id AND a.applicantId = ${Number(userId)}
         ORDER BY a.createdAt DESC, a.id DESC
         LIMIT 1
       ) AS myApplicationStatus`
    : "NULL AS myApplicationStatus";

  return `
    pets.*,
    u.username AS ownerUsername,
    u.firstName AS ownerFirstName,
    u.lastName AS ownerLastName,
    u.profile_picture AS ownerAvatar,
    (SELECT COUNT(*) FROM pet_likes pl WHERE pl.petId = pets.id) AS likeCount,
    (SELECT COUNT(*) FROM pet_comments pc WHERE pc.petId = pets.id) AS commentCount,
    ${likedSelect},
    ${favoritedSelect},
    ${requestedSelect},
    ${myAppStatusSelect}
  `;
}

// ======================== LIST PETS ========================
/** GET /api/pets — filters: type, search, sort=likes|comments|views|newest */
exports.getPets = async (req, res, next) => {
  const { type, search, sort, status } = req.query;
  const userId = req.user?.id ? Number(req.user.id) : null;

  const where = [];
  const params = [];

  // Default: browse available pets only. Pass status=all for profile/owner views.
  const statusKey = String(status || "available").trim().toLowerCase();
  if (statusKey && statusKey !== "all") {
    where.push("LOWER(pets.status) = ?");
    params.push(statusKey);
  }

  if (type && type !== "all") {
    where.push("pets.type = ?");
    params.push(type);
  }

  if (search) {
    const term = `%${String(search).toLowerCase()}%`;
    where.push(
      "(LOWER(pets.name) LIKE ? OR LOWER(pets.breed) LIKE ? OR LOWER(pets.location) LIKE ?)",
    );
    params.push(term, term, term);
  }

  let orderBy = "pets.id DESC";
  const sortKey = String(sort || "").toLowerCase();
  if (sortKey === "likes") {
    orderBy = "likeCount DESC, pets.id DESC";
  } else if (sortKey === "comments") {
    orderBy = "commentCount DESC, pets.id DESC";
  } else if (sortKey === "views") {
    orderBy = "pets.viewCount DESC, pets.id DESC";
  } else if (sortKey === "newest") {
    orderBy = "pets.createdAt DESC, pets.id DESC";
  }

  try {
    const pets = await query(
      `
        SELECT ${engagementSelect(userId)}
        FROM pets
        LEFT JOIN users u ON u.id = pets.ownerId
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY ${orderBy}
      `,
      params,
    );
    res.json(pets.map(normalizePet));
  } catch (error) {
    next(error);
  }
};

// ======================== GET PET BY ID ========================
/** GET /api/pets/:id — engagement + comments (does not count a view). */
exports.getPetById = async (req, res, next) => {
  try {
    const petId = Number(req.params.id);
    const userId = req.user?.id ? Number(req.user.id) : null;

    const pets = await query(
      `
        SELECT ${engagementSelect(userId)}
        FROM pets
        LEFT JOIN users u ON u.id = pets.ownerId
        WHERE pets.id = ?
        LIMIT 1
      `,
      [petId],
    );
    const pet = pets[0];

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const comments = await query(
      `
        SELECT
          c.id,
          c.petId,
          c.userId,
          c.text,
          c.createdAt,
          u.username,
          u.firstName,
          u.lastName,
          u.profile_picture AS avatar
        FROM pet_comments c
        LEFT JOIN users u ON u.id = c.userId
        WHERE c.petId = ?
        ORDER BY c.createdAt DESC
      `,
      [petId],
    );

    res.json({
      ...normalizePet(pet),
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// ======================== STATS (light poll) ========================
/** GET /api/pets/:id/stats — view/like/comment counts without heavy joins. */
exports.getPetStats = async (req, res, next) => {
  try {
    const petId = Number(req.params.id);
    if (!petId) {
      return res.status(400).json({ message: "Invalid pet id" });
    }

    const rows = await query(
      `
        SELECT
          pets.viewCount,
          (SELECT COUNT(*) FROM pet_likes pl WHERE pl.petId = pets.id) AS likeCount,
          (SELECT COUNT(*) FROM pet_comments pc WHERE pc.petId = pets.id) AS commentCount
        FROM pets
        WHERE pets.id = ?
        LIMIT 1
      `,
      [petId],
    );
    const pet = rows[0];
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json({
      viewCount: Number(pet.viewCount || 0),
      likeCount: Number(pet.likeCount || 0),
      commentCount: Number(pet.commentCount || 0),
    });
  } catch (error) {
    next(error);
  }
};

// ======================== VIEWS ========================
/** POST /api/pets/:id/view — count one page view. */
exports.recordPetView = async (req, res, next) => {
  try {
    const petId = Number(req.params.id);
    const result = await run(
      "UPDATE pets SET viewCount = viewCount + 1 WHERE id = ?",
      [petId],
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const rows = await query(
      "SELECT viewCount FROM pets WHERE id = ? LIMIT 1",
      [petId],
    );
    res.json({ viewCount: Number(rows[0]?.viewCount || 0) });
  } catch (error) {
    next(error);
  }
};

// ======================== CREATE PET ========================
/** POST /api/pets — auth required. */
exports.createPet = async (req, res, next) => {
  const {
    name,
    breed,
    age,
    location,
    type,
    image,
    images,
    gender,
    details,
    traits,
  } = req.body;

  if (!name || !breed || !age || !location || !type || !gender) {
    return res.status(400).json({ message: "Missing pet fields" });
  }

  const cleanDetails = String(details || "").trim();
  if (cleanDetails.length > 2000) {
    return res
      .status(400)
      .json({ message: "Details must be under 2000 characters" });
  }

  const gallery = Array.isArray(images)
    ? images.map((url) => String(url || "").trim()).filter(Boolean)
    : [];
  if (!gallery.length && image) {
    gallery.push(String(image).trim());
  }
  const coverImage = gallery[0] || image || "";
  const traitsJson = cleanTraitsPayload(traits);

  try {
    const createdAt = new Date();
    const result = await run(
      `
        INSERT INTO pets
          (name, breed, age, location, type, image, images, gender, details, traits, status, ownerId, createdAt, viewCount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `,
      [
        name,
        breed,
        age,
        location,
        type,
        coverImage,
        JSON.stringify(gallery),
        gender,
        cleanDetails || null,
        traitsJson,
        "available",
        req.user.id,
        createdAt,
      ],
    );

    const pets = await query(
      `
        SELECT ${engagementSelect(req.user.id)}
        FROM pets
        LEFT JOIN users u ON u.id = pets.ownerId
        WHERE pets.id = ?
        LIMIT 1
      `,
      [result.insertId],
    );

    res.status(201).json(normalizePet(pets[0]));
  } catch (error) {
    next(error);
  }
};

// ======================== UPDATE PET ========================
/** PATCH /api/pets/:id — owner only. */
exports.updatePet = async (req, res, next) => {
  try {
    const petId = Number(req.params.id);
    if (!petId) {
      return res.status(400).json({ message: "Invalid pet id" });
    }

    const existing = await query(
      "SELECT id, ownerId FROM pets WHERE id = ? LIMIT 1",
      [petId],
    );
    const pet = existing[0];
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    if (Number(pet.ownerId) !== Number(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only the owner can edit this listing" });
    }

    const {
      name,
      breed,
      age,
      location,
      type,
      image,
      images,
      gender,
      details,
      traits,
    } = req.body;

    if (!name || !breed || !age || !location || !type || !gender) {
      return res.status(400).json({ message: "Missing pet fields" });
    }

    const cleanDetails = String(details || "").trim();
    if (cleanDetails.length > 2000) {
      return res
        .status(400)
        .json({ message: "Details must be under 2000 characters" });
    }

    const gallery = Array.isArray(images)
      ? images.map((url) => String(url || "").trim()).filter(Boolean)
      : [];
    if (!gallery.length && image) {
      gallery.push(String(image).trim());
    }
    if (!gallery.length) {
      return res.status(400).json({ message: "Add at least one photo" });
    }
    const coverImage = gallery[0];
    const traitsJson = cleanTraitsPayload(traits);

    await run(
      `
        UPDATE pets
        SET
          name = ?,
          breed = ?,
          age = ?,
          location = ?,
          type = ?,
          image = ?,
          images = ?,
          gender = ?,
          details = ?,
          traits = ?
        WHERE id = ?
      `,
      [
        String(name).trim(),
        String(breed).trim(),
        String(age).trim(),
        String(location).trim(),
        String(type).trim(),
        coverImage,
        JSON.stringify(gallery),
        String(gender).trim(),
        cleanDetails || null,
        traitsJson,
        petId,
      ],
    );

    const pets = await query(
      `
        SELECT ${engagementSelect(req.user.id)}
        FROM pets
        LEFT JOIN users u ON u.id = pets.ownerId
        WHERE pets.id = ?
        LIMIT 1
      `,
      [petId],
    );

    res.json(normalizePet(pets[0]));
  } catch (error) {
    next(error);
  }
};

// ======================== LIKES (notifies owner) ========================
/** POST /api/pets/:id/like — toggle like; notifies owner on new like. */
exports.togglePetLike = async (req, res, next) => {
  try {
    const petId = Number(req.params.id);
    const userId = Number(req.user.id);

    const pets = await query(
      "SELECT id, name, ownerId FROM pets WHERE id = ? LIMIT 1",
      [petId],
    );
    const pet = pets[0];
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const existing = await query(
      "SELECT id FROM pet_likes WHERE petId = ? AND userId = ? LIMIT 1",
      [petId, userId],
    );

    let liked;
    if (existing[0]) {
      await run("DELETE FROM pet_likes WHERE petId = ? AND userId = ?", [
        petId,
        userId,
      ]);
      liked = false;
    } else {
      await run(
        "INSERT INTO pet_likes (petId, userId, createdAt) VALUES (?, ?, ?)",
        [petId, userId, new Date()],
      );
      liked = true;
    }

    // Notify listing owner when someone likes (skip self-likes / unlikes).
    if (
      liked &&
      pet.ownerId != null &&
      Number(pet.ownerId) !== userId
    ) {
      const owners = await query(
        "SELECT id, notify_application_updates FROM users WHERE id = ? LIMIT 1",
        [pet.ownerId],
      );
      const owner = owners[0];
      const shouldNotify =
        !owner ||
        owner.notify_application_updates === null ||
        Number(owner.notify_application_updates) === 1;

      if (shouldNotify) {
        const likers = await query(
          "SELECT username, firstName, lastName FROM users WHERE id = ? LIMIT 1",
          [userId],
        );
        const liker = likers[0];
        const likerName =
          String(liker?.username || "").trim() ||
          `${liker?.firstName || ""} ${liker?.lastName || ""}`.trim() ||
          "Someone";

        await run(
          `
            INSERT INTO notifications
              (userId, type, title, body, relatedPetId, relatedApplicationId, isRead, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            pet.ownerId,
            "pet_like",
            `${likerName} liked ${pet.name}`,
            `${likerName} liked your adoption post for ${pet.name}.`,
            pet.id,
            null,
            0,
            new Date(),
          ],
        );
      }
    }

    const counts = await query(
      "SELECT COUNT(*) AS count FROM pet_likes WHERE petId = ?",
      [petId],
    );

    res.json({
      liked,
      likeCount: Number(counts[0]?.count || 0),
    });
  } catch (error) {
    next(error);
  }
};

// ======================== FAVORITES ========================
/** POST /api/pets/:id/favorite — toggle saved listing. */
exports.togglePetFavorite = async (req, res, next) => {
  try {
    const petId = Number(req.params.id);
    const userId = Number(req.user.id);

    const pets = await query("SELECT id FROM pets WHERE id = ? LIMIT 1", [
      petId,
    ]);
    if (!pets[0]) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const existing = await query(
      "SELECT id FROM pet_favorites WHERE petId = ? AND userId = ? LIMIT 1",
      [petId, userId],
    );

    let favorited;
    if (existing[0]) {
      await run("DELETE FROM pet_favorites WHERE petId = ? AND userId = ?", [
        petId,
        userId,
      ]);
      favorited = false;
    } else {
      await run(
        "INSERT INTO pet_favorites (petId, userId, createdAt) VALUES (?, ?, ?)",
        [petId, userId, new Date()],
      );
      favorited = true;
    }

    res.json({ favorited });
  } catch (error) {
    next(error);
  }
};

// ======================== MY FAVORITES ========================
/** GET /api/pets/favorites/mine */
exports.getMyFavoritePets = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const pets = await query(
      `
        SELECT ${engagementSelect(userId)}
        FROM pet_favorites pf
        JOIN pets ON pets.id = pf.petId
        LEFT JOIN users u ON u.id = pets.ownerId
        WHERE pf.userId = ?
        ORDER BY pf.createdAt DESC
      `,
      [userId],
    );
    res.json(pets.map(normalizePet));
  } catch (error) {
    next(error);
  }
};

// ======================== COMMENTS (read) ========================
/** GET /api/pets/:id/comments */
exports.getPetComments = async (req, res, next) => {
  try {
    const petId = Number(req.params.id);
    const comments = await query(
      `
        SELECT
          c.id,
          c.petId,
          c.userId,
          c.text,
          c.createdAt,
          u.username,
          u.firstName,
          u.lastName,
          u.profile_picture AS avatar
        FROM pet_comments c
        LEFT JOIN users u ON u.id = c.userId
        WHERE c.petId = ?
        ORDER BY c.createdAt DESC
      `,
      [petId],
    );
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// ======================== DELETE LISTING ========================
/** DELETE /api/pets/:id — owner (or admin). */
exports.deletePet = async (req, res, next) => {
  try {
    const petId = Number(req.params.id);
    const pets = await query(
      "SELECT id, ownerId, name FROM pets WHERE id = ? LIMIT 1",
      [petId],
    );
    const pet = pets[0];
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const isOwner = Number(pet.ownerId) === Number(req.user.id);
    const isAdmin = String(req.user.role || "").toLowerCase() === "admin";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Only the owner can remove this listing" });
    }

    await run("DELETE FROM notifications WHERE relatedPetId = ?", [petId]);
    await run("DELETE FROM pet_likes WHERE petId = ?", [petId]);
    await run("DELETE FROM pet_favorites WHERE petId = ?", [petId]);
    await run("DELETE FROM pet_comments WHERE petId = ?", [petId]);
    await run("DELETE FROM adoption_applications WHERE petId = ?", [petId]);
    await run("DELETE FROM pets WHERE id = ?", [petId]);

    res.json({ message: "Pet listing removed", id: petId, name: pet.name });
  } catch (error) {
    next(error);
  }
};

// ======================== COMMENTS (add + notify owner) ========================
/** POST /api/pets/:id/comments — auth required; notifies owner. */
exports.addPetComment = async (req, res, next) => {
  try {
    const petId = Number(req.params.id);
    const text = String(req.body?.text || "").trim();

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    if (text.length > 1000) {
      return res.status(400).json({ message: "Comment is too long" });
    }

    const pets = await query(
      "SELECT id, name, ownerId FROM pets WHERE id = ? LIMIT 1",
      [petId],
    );
    const pet = pets[0];
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const result = await run(
      "INSERT INTO pet_comments (petId, userId, text, createdAt) VALUES (?, ?, ?, ?)",
      [petId, req.user.id, text, new Date()],
    );

    const rows = await query(
      `
        SELECT
          c.id,
          c.petId,
          c.userId,
          c.text,
          c.createdAt,
          u.username,
          u.firstName,
          u.lastName,
          u.profile_picture AS avatar
        FROM pet_comments c
        LEFT JOIN users u ON u.id = c.userId
        WHERE c.id = ?
        LIMIT 1
      `,
      [result.insertId],
    );

    const comment = rows[0];
    const commenterUsername =
      String(comment?.username || "").trim() ||
      `${comment?.firstName || ""} ${comment?.lastName || ""}`.trim() ||
      "Someone";

    // Notify the listing owner (skip self-comments).
    if (
      pet.ownerId != null &&
      Number(pet.ownerId) !== Number(req.user.id)
    ) {
      const owners = await query(
        "SELECT id, notify_application_updates FROM users WHERE id = ? LIMIT 1",
        [pet.ownerId],
      );
      const owner = owners[0];
      const shouldNotify =
        !owner ||
        owner.notify_application_updates === null ||
        Number(owner.notify_application_updates) === 1;

      if (shouldNotify) {
        const preview =
          text.length > 200 ? `${text.slice(0, 197).trim()}...` : text;
        await run(
          `
            INSERT INTO notifications
              (userId, type, title, body, relatedPetId, relatedApplicationId, isRead, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            pet.ownerId,
            "pet_comment",
            `New comment on ${pet.name} from ${commenterUsername}`,
            preview,
            pet.id,
            null,
            0,
            new Date(),
          ],
        );
      }
    }

    const counts = await query(
      "SELECT COUNT(*) AS count FROM pet_comments WHERE petId = ?",
      [petId],
    );

    res.status(201).json({
      comment,
      commentCount: Number(counts[0]?.count || 0),
    });
  } catch (error) {
    next(error);
  }
};

// ======================== COMMENTS (delete own) ========================
/** DELETE /api/pets/:id/comments/:commentId — comment author only. */
exports.deletePetComment = async (req, res, next) => {
  try {
    const petId = Number(req.params.id);
    const commentId = Number(req.params.commentId);
    if (!petId || !commentId) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    const rows = await query(
      `
        SELECT id, petId, userId
        FROM pet_comments
        WHERE id = ? AND petId = ?
        LIMIT 1
      `,
      [commentId, petId],
    );
    const comment = rows[0];
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (Number(comment.userId) !== Number(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You can only remove your own comments" });
    }

    await run("DELETE FROM pet_comments WHERE id = ?", [commentId]);
    const counts = await query(
      "SELECT COUNT(*) AS count FROM pet_comments WHERE petId = ?",
      [petId],
    );

    res.json({
      message: "Comment removed",
      id: commentId,
      commentCount: Number(counts[0]?.count || 0),
    });
  } catch (error) {
    next(error);
  }
};
