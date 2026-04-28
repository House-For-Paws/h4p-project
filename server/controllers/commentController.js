// מייבא את הנתונים מה-"DB" הזמני
const { comments } = require("../data");

// 🔹 יצירת תגובה
exports.createComment = (req, res) => {
  // לוקחים את postId מה-URL
  const postId = parseInt(req.params.postId);

  // לוקחים את הטקסט מה-Body
  const { text } = req.body;

  // בדיקה: אם אין טקסט → שגיאה
  if (!text) {
    return res.status(400).send("Text is required");
  }

  // יוצרים תגובה חדשה
  const newComment = {
    id: comments.length + 1, // מזהה ייחודי
    postId, // לאיזה פוסט זה שייך
    userId: req.user.id, // מי כתב (מה-JWT)
    text, // התוכן
    createdAt: new Date(), // זמן יצירה
  };

  // שומרים את התגובה במערך
  comments.push(newComment);

  // מחזירים את התגובה
  res.send(newComment);
};

// 🔹 שליפת תגובות לפי פוסט
exports.getCommentsByPost = (req, res) => {
  // לוקחים postId מה-URL
  const postId = parseInt(req.params.postId);

  // מסננים רק תגובות של הפוסט הזה
  const postComments = comments.filter((c) => c.postId === postId);

  // מחזירים את התגובות
  res.send(postComments);
};
