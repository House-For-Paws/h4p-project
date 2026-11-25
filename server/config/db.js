/**
 * =============================================================================
 * FILE: server/config/db.js
 * ROLE: MySQL pool, schema bootstrap, and query helpers
 * =============================================================================
 * What to find here:
 *   - initDb()     — create DB, apply schema.sql, seed pets
 *   - query()      — SELECT helpers
 *   - run()        — INSERT / UPDATE / DELETE helpers
 *   - getPool()    — raw pool access
 *   - seedPets()   — demo data when pets table is empty
 * =============================================================================
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// ======================== CONFIG ========================
const DB_NAME = process.env.DB_NAME || "h4p";
const SCHEMA_FILE = path.join(__dirname, "..", "sql", "schema.sql");

const baseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
};

/** Shared pool — only valid after initDb(). */
let pool;

// ======================== SEED DATA ========================
/** Demo pets inserted only when the pets table is empty. */
const initialPets = [
  {
    name: "Max",
    breed: "Golden Retriever",
    age: "2 years",
    location: "Tel Aviv",
    type: "dog",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
      "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400",
    ],
    gender: "Male",
    status: "available",
  },
  {
    name: "Luna",
    breed: "British Shorthair",
    age: "1 year",
    location: "Haifa",
    type: "cat",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400",
    images: [
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400",
    ],
    gender: "Female",
    status: "available",
  },
  {
    name: "Charlie",
    breed: "Labrador",
    age: "3 years",
    location: "Jerusalem",
    type: "dog",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
      "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400",
    ],
    gender: "Male",
    status: "available",
  },
  {
    name: "Milo",
    breed: "Persian Cat",
    age: "2 years",
    location: "Tel Aviv",
    type: "cat",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    images: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400",
    ],
    gender: "Male",
    status: "available",
  },
  {
    name: "Bella",
    breed: "Beagle",
    age: "1 year",
    location: "Eilat",
    type: "dog",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400",
    images: [
      "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
    ],
    gender: "Female",
    status: "available",
  },
  {
    name: "Oliver",
    breed: "Maine Coon",
    age: "4 years",
    location: "Haifa",
    type: "cat",
    image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400",
    images: [
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400",
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    ],
    gender: "Male",
    status: "available",
  },
  {
    name: "Rocky",
    breed: "German Shepherd",
    age: "2 years",
    location: "Tel Aviv",
    type: "dog",
    image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400",
    images: [
      "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
      "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400",
    ],
    gender: "Male",
    status: "available",
  },
  {
    name: "Whiskers",
    breed: "Siamese",
    age: "1 year",
    location: "Haifa",
    type: "cat",
    image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400",
    images: [
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400",
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400",
    ],
    gender: "Female",
    status: "available",
  },
];

const EXTRA_IMAGES_BY_TYPE = {
  dog: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
    "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400",
    "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400",
  ],
  cat: [
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400",
    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400",
  ],
};

// ======================== HELPERS ========================
function quoteIdentifier(identifier) {
  return `\`${String(identifier).replace(/`/g, "``")}\``;
}

/** SELECT helper — returns row array. */
async function query(sql, params = []) {
  if (!pool) {
    throw new Error("Database has not been initialized");
  }

  const [rows] = await pool.execute(sql, params);
  return rows;
}

/** INSERT / UPDATE / DELETE helper — returns driver result. */
async function run(sql, params = []) {
  if (!pool) {
    throw new Error("Database has not been initialized");
  }

  const [result] = await pool.execute(sql, params);
  return result;
}

/** Build a short 3-image gallery from cover + type pool. */
function buildGallery(coverImage, type) {
  const pool = EXTRA_IMAGES_BY_TYPE[String(type || "").toLowerCase()] || [];
  const gallery = [coverImage, ...pool].filter(Boolean);
  return [...new Set(gallery)].slice(0, 3);
}

// ======================== SEED / BACKFILL ========================
async function seedPets() {
  const rows = await query("SELECT COUNT(*) AS count FROM pets");
  if (rows[0].count > 0) {
    return;
  }

  const values = initialPets.map((pet) => [
    pet.name,
    pet.breed,
    pet.age,
    pet.location,
    pet.type,
    pet.image,
    JSON.stringify(pet.images || buildGallery(pet.image, pet.type)),
    pet.gender,
    pet.status,
  ]);

  await pool.query(
    `
      INSERT INTO pets (name, breed, age, location, type, image, images, gender, status)
      VALUES ?
    `,
    [values],
  );
}

/** Repair seed-pet galleries; does not overwrite real user single-photo posts. */
async function backfillPetImages() {
  const pets = await query(
    "SELECT id, name, type, image, images FROM pets",
  );

  for (const pet of pets) {
    let current = [];
    let parseFailed = false;
    if (pet.images) {
      try {
        const parsed = JSON.parse(
          Buffer.isBuffer(pet.images) ? pet.images.toString("utf8") : pet.images,
        );
        current = Array.isArray(parsed) ? parsed : [];
      } catch {
        current = [];
        parseFailed = true;
      }
    }

    if (Array.isArray(current) && current.length > 1) {
      continue;
    }

    const seeded = initialPets.find(
      (p) => p.name.toLowerCase() === String(pet.name || "").toLowerCase(),
    );

    if (!seeded && !parseFailed) {
      continue;
    }

    const gallery =
      seeded?.images ||
      buildGallery(pet.image || current[0] || "", pet.type);

    await run("UPDATE pets SET images = ?, image = ? WHERE id = ?", [
      JSON.stringify(gallery),
      gallery[0] || pet.image || "",
      pet.id,
    ]);
  }
}

// ======================== SCHEMA PATCHES ========================
async function columnExists(tableName, columnName) {
  const cols = await query(
    `
      SELECT COLUMN_NAME AS name
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [DB_NAME, tableName, columnName],
  );
  return cols.length > 0;
}

/** Columns CREATE IF NOT EXISTS cannot add to existing tables. */
async function ensureSchemaPatches() {
  if (!(await columnExists("notifications", "relatedThreadId"))) {
    await pool.query(`
      ALTER TABLE notifications
      ADD COLUMN relatedThreadId INT UNSIGNED NULL AFTER relatedApplicationId,
      ADD KEY notifications_relatedThreadId_index (relatedThreadId)
    `);
    try {
      await pool.query(`
        ALTER TABLE notifications
        ADD CONSTRAINT notifications_relatedThreadId_fk
        FOREIGN KEY (relatedThreadId) REFERENCES message_threads(id)
        ON DELETE SET NULL
      `);
    } catch {
      // Constraint may already exist or message_threads missing on odd DBs.
    }
  }

  if (!(await columnExists("content_reports", "screenshot"))) {
    await pool.query(`
      ALTER TABLE content_reports
      ADD COLUMN screenshot LONGTEXT NULL AFTER description
    `);
  }

  if (!(await columnExists("content_reports", "relatedThreadId"))) {
    await pool.query(`
      ALTER TABLE content_reports
      ADD COLUMN relatedThreadId INT UNSIGNED NULL AFTER screenshot,
      ADD KEY content_reports_relatedThreadId_index (relatedThreadId)
    `);
  }

  try {
    await pool.query(`
      ALTER TABLE content_reports
      ADD CONSTRAINT content_reports_relatedThreadId_fk
      FOREIGN KEY (relatedThreadId) REFERENCES message_threads(id)
      ON DELETE SET NULL
    `);
  } catch {
    // Already exists, or message_threads not ready yet.
  }

  const blockTables = await query(
    `
      SELECT TABLE_NAME AS name
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'user_blocks'
    `,
    [DB_NAME],
  );
  if (!(await columnExists("pets", "details"))) {
    await pool.query(`
      ALTER TABLE pets
      ADD COLUMN details TEXT NULL AFTER gender
    `);
  }

  if (!(await columnExists("pets", "traits"))) {
    await pool.query(`
      ALTER TABLE pets
      ADD COLUMN traits TEXT NULL AFTER details
    `);
  }

  if (!blockTables.length) {
    await pool.query(`
      CREATE TABLE user_blocks (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        blockerId INT UNSIGNED NOT NULL,
        blockedId INT UNSIGNED NOT NULL,
        reason VARCHAR(120) NULL,
        description TEXT NULL,
        relatedReportId INT UNSIGNED NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY user_blocks_pair_unique (blockerId, blockedId),
        KEY user_blocks_blockerId_index (blockerId),
        KEY user_blocks_blockedId_index (blockedId),
        CONSTRAINT user_blocks_blockerId_fk FOREIGN KEY (blockerId) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT user_blocks_blockedId_fk FOREIGN KEY (blockedId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
}

// ======================== INIT ========================
/** Create DB → open pool → apply schema.sql → seed. Call before listen(). */
async function initDb() {
  const setupConnection = await mysql.createConnection(baseConfig);
  await setupConnection.query(
    `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(DB_NAME)}
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await setupConnection.end();

  pool = mysql.createPool({
    ...baseConfig,
    database: DB_NAME,
    multipleStatements: true,
  });

  await pool.query(fs.readFileSync(SCHEMA_FILE, "utf8"));
  await ensureSchemaPatches();
  await seedPets();
  await backfillPetImages();
}

function getPool() {
  if (!pool) {
    throw new Error("Database has not been initialized");
  }

  return pool;
}

// ======================== EXPORTS ========================
module.exports = {
  initDb,
  getPool,
  query,
  run,
};
