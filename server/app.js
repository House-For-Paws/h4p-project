/**
 * server/app.js — Express API bootstrap for House For Paws (H4P).
 * - Loads env (.env), enables CORS + JSON parsing, mounts /api/* routers.
 * - Starts HTTP listener only when run directly (node app.js); exports `app` for tests.
 */
require("dotenv").config();

const express = require("express"); // Web framework
const cors = require("cors"); // Cross-origin requests from Vite dev server

const { initDb } = require("./config/db"); // MySQL pool + schema apply
const authRoutes = require("./routes/authRoutes");
const commentRoutes = require("./routes/commentRoutes");
const petRoutes = require("./routes/petRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express(); // Single Express application instance

/** Allowed browser origins for cookie-less JWT API calls from the React client. */
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
if (process.env.CLIENT_URL) {
  defaultOrigins.push(process.env.CLIENT_URL);
}

/**
 * Dynamic CORS policy: allow configured origins; in dev also allow any localhost port.
 * @param {string|undefined} origin — Request Origin header (missing for same-origin tools).
 * @param {function} callback — (err, allowBoolean)
 */
function corsOrigin(origin, callback) {
  if (!origin) {
    return callback(null, true); // Non-browser clients (curl, Postman)
  }
  if (defaultOrigins.includes(origin)) {
    return callback(null, true);
  }
  if (
    process.env.NODE_ENV !== "production" &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
  ) {
    return callback(null, true); // Vite may use random port in dev
  }
  callback(null, false);
}

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
/** Parse JSON bodies (large limit for base64 profile images). */
app.use(express.json({ limit: "12mb" }));

/** Bump when auth/settings behavior changes (helps confirm you’re on fresh API code). */
const API_REVISION = "2026-05-password-settings-no-email-otp";

/** Root health/info endpoint — lists mounted API prefixes. */
app.get("/", (req, res) => {
  res.json({
    message: "H4P API is running",
    revision: API_REVISION,
    settingsAuth: "password-only",
    endpoints: [
      "/api/auth",
      "/api/users",
      "/api/pets",
      "/api/posts",
      "/api/comments",
    ],
  });
});

// REST API route prefixes — each file in routes/*.js maps HTTP verbs to controllers.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
console.log("ADMIN ROUTES REGISTERED");

/** 404 handler — unknown path under this Express app. */
app.use((req, res) => {
  console.log("404 NOT FOUND:", req.method, req.url);
  res.status(404).json({ message: "Route not found" });
});

/** Global error handler — uncaught exceptions from controllers/middleware. */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;

// Only listen when executed directly; tests can require(app) without binding a port.
if (require.main === module) {
  initDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Server running on port ${PORT} (revision ${API_REVISION} — change email/password/delete: no email OTP)`,
        );
      });
    })
    .catch((error) => {
      console.error("Failed to initialize database", error);
      process.exit(1);
    });
}

module.exports = app;
