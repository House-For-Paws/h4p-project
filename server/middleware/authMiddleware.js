const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization; // מקבל header

  if (!authHeader) {
    return res.status(401).send("No token provided");
  }

  const token = authHeader.split(" ")[1]; // מוציא רק את הטוקן

  try {
    const decoded = jwt.verify(token, SECRET); // בודק token
    req.user = decoded; // שומר את המשתמש
    next(); // ממשיך הלאה
  } catch (err) {
    res.status(401).send("Invalid token");
  }
};
