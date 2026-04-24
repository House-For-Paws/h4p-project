require("dotenv").config(); // טוען משתני סביבה (לא חובה כרגע אבל טוב לעתיד)
const express = require("express"); // ספריית שרת
const cors = require("cors"); // מאפשר תקשורת בין client ל-server

const app = express(); // יצירת השרת

// Middleware
app.use(cors()); // מאפשר בקשות חיצוניות (React → Node)
app.use(express.json()); // מאפשר לקרוא JSON מהבקשות

// Routes
const authRoutes = require("./routes/authRoutes"); // מייבא routes
app.use("/api/auth", authRoutes); // כל בקשה ל /api/auth תגיע ל-authRoutes

// בדיקה שהשרת עובד
app.get("/", (req, res) => {
  res.send("Server is running 🔥");
});

// פורט
const PORT = process.env.PORT || 5000;

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
