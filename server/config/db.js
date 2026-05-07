const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

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

let pool;

const initialPets = [
  {
    name: "Max",
    breed: "Golden Retriever",
    age: "2 years",
    location: "Tel Aviv",
    type: "dog",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
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
    gender: "Female",
    status: "available",
  },
];

function quoteIdentifier(identifier) {
  return `\`${String(identifier).replace(/`/g, "``")}\``;
}

async function query(sql, params = []) {
  if (!pool) {
    throw new Error("Database has not been initialized");
  }

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function run(sql, params = []) {
  if (!pool) {
    throw new Error("Database has not been initialized");
  }

  const [result] = await pool.execute(sql, params);
  return result;
}

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
    pet.gender,
    pet.status,
  ]);

  await pool.query(
    `
      INSERT INTO pets (name, breed, age, location, type, image, gender, status)
      VALUES ?
    `,
    [values],
  );
}

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
  await seedPets();
}

function getPool() {
  if (!pool) {
    throw new Error("Database has not been initialized");
  }

  return pool;
}

module.exports = {
  initDb,
  getPool,
  query,
  run,
};
