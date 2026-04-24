const { users } = require("../data"); // מביא את המשתמשים
const jwt = require("jsonwebtoken"); // ספריית token

const SECRET = "mysecretkey"; // מפתח ליצירת token

// REGISTER
exports.register = (req, res) => {
  const { username, email, password } = req.body; // מקבל נתונים מהבקשה

  const userExists = users.find((u) => u.email === email); // בודק אם קיים

  if (userExists) {
    return res.status(400).send("User already exists");
  }

  const newUser = {
    id: users.length + 1, // id אוטומטי
    username,
    email,
    password,
  };

  users.push(newUser); // שומר במערך

  res.send(newUser); // מחזיר תשובה
};

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user) return res.status(400).send("User not found");

  if (user.password !== password) {
    return res.status(400).send("Wrong password");
  }

  // יצירת token
  const token = jwt.sign(
    { id: user.id, email: user.email }, // מידע בתוך הטוקן
    SECRET,
    { expiresIn: "1h" },
  );

  res.json({
    message: "Login successful",
    token,
  });
};
