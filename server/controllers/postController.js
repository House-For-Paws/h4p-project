// מייבאים את הנתונים הזמניים (users + posts)
const { posts, users } = require("../data");

// 🔹 פונקציה ליצירת פוסט חדש
exports.createPost = (req, res) => {
  // לוקחים את הנתונים מהבקשה (מה-Body ב-Postman)
  const { title, description } = req.body;

  // בדיקה: אם חסר מידע – מחזירים שגיאה
  if (!title || !description) {
    return res.status(400).send("Missing fields");
  }

  // יוצרים אובייקט פוסט חדש
  const newPost = {
    id: posts.length + 1, // מזהה ייחודי (לפי כמות הפוסטים)
    title, // כותרת הפוסט
    description, // תיאור הפוסט

    // מזהה המשתמש מגיע מה-JWT (middleware שמנו קודם)
    userId: req.user.id,

    // תאריך יצירת הפוסט
    createdAt: new Date(),
  };

  // מוסיפים את הפוסט למערך (ה-DB הזמני)
  posts.push(newPost);

  // מחזירים את הפוסט שנוצר
  res.send(newPost);
};

// 🔹 פונקציה לשליפת כל הפוסטים
exports.getPosts = (req, res) => {
  // עושים מעבר על כל הפוסטים
  const postsWithUser = posts.map((post) => {
    // מוצאים את המשתמש שיצר את הפוסט לפי userId
    const user = users.find((u) => u.id === post.userId);

    // מחזירים פוסט + שם משתמש
    return {
      ...post, // כל הנתונים של הפוסט

      // אם יש משתמש → תציג username
      // אם לא → תציג Unknown
      username: user ? user.username : "Unknown",
      phone: user ? user.phone : null,
    };
  });

  // מחזירים את כל הפוסטים עם המשתמשים
  res.send(postsWithUser);
};


// פונקציה למחיקת פוסט
exports.deletePost = (req, res) => {

  // מקבלים id מה-URL
  const postId = parseInt(req.params.id);

  // מוצאים את הפוסט
  const post = posts.find((p) => p.id === postId);

  // אם לא נמצא פוסט
  if (!post) {
    return res.status(404).send("Post not found");
  }

  // בודקים אם המשתמש הוא הבעלים
  if (post.userId !== req.user.id) {
    return res.status(403).send("Not allowed");
  }

  // מוחקים את הפוסט
  const index = posts.findIndex((p) => p.id === postId);
  posts.splice(index, 1);

  res.send("Post deleted");
};