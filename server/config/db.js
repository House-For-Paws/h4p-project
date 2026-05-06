const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DB_DIR, "db.json");

const initialPets = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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

const initialState = {
  users: [],
  posts: [],
  comments: [],
  pets: initialPets,
};

function ensureDbFile() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2));
  }
}

function readDb() {
  ensureDbFile();

  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    return {
      users: Array.isArray(data.users) ? data.users : [],
      posts: Array.isArray(data.posts) ? data.posts : [],
      comments: Array.isArray(data.comments) ? data.comments : [],
      pets: Array.isArray(data.pets) && data.pets.length ? data.pets : initialPets,
    };
  } catch (error) {
    return { ...initialState };
  }
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}

module.exports = {
  readDb,
  writeDb,
  getNextId,
};
