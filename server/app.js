/**
 * =============================================================================
 * FILE: server/app.js
 * ROLE: Express API entry point for House For Paws (H4P)
 * =============================================================================
 * What to find here:
 *   - CORS + JSON body setup
 *   - /api/* route mounts
 *   - 404 / error handlers
 *   - Server listen (after DB init)
 * =============================================================================
 */
require("dotenv").config();

// ======================== IMPORTS ========================
const express = require("express");
const cors = require("cors");

const { assertRuntimeSecrets } = require("./utils/secrets");
const { initDb } = require("./config/db");

try {
  assertRuntimeSecrets();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const authRoutes = require("./routes/authRoutes");
const commentRoutes = require("./routes/commentRoutes");
const petRoutes = require("./routes/petRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reportRoutes = require("./routes/reportRoutes");
const messageRoutes = require("./routes/messageRoutes");
const blockRoutes = require("./routes/blockRoutes");

const app = express();

// ======================== CORS ========================
/** Allowed browser origins for JWT API calls from the React client. */
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
if (process.env.CLIENT_URL) {
  defaultOrigins.push(process.env.CLIENT_URL);
}

/**
 * Dynamic CORS: allow configured origins; in dev also allow any localhost port.
 */
function corsOrigin(origin, callback) {
  if (!origin) {
    return callback(null, true);
  }
  if (defaultOrigins.includes(origin)) {
    return callback(null, true);
  }
  if (
    process.env.NODE_ENV !== "production" &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
  ) {
    return callback(null, true);
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

// ======================== BODY PARSER ========================
/** Large limit supports base64 profile / pet images. */
app.use(express.json({ limit: "12mb" }));

const API_REVISION = "2026-05-password-settings-no-email-otp";

// ======================== HEALTH CHECK ========================
/** GET / — quick API status + mounted prefixes. */
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
      "/api/applications",
      "/api/notifications",
      "/api/reports",
      "/api/messages",
      "/api/blocks",
    ],
  });
});

// ======================== API ROUTES ========================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/admin", adminRoutes);
console.log("ADMIN ROUTES REGISTERED");

// ======================== ERROR HANDLERS ========================
app.use((req, res) => {
  console.log("404 NOT FOUND:", req.method, req.url);
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

// ======================== START SERVER ========================
const PORT = process.env.PORT || 5000;

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
