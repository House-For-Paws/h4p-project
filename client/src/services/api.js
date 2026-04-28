import axios from "axios";
// ספרייה לשליחת בקשות לשרת

// יוצרים instance עם כתובת בסיס
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// פונקציה שמוסיפה token אוטומטית לכל בקשה
API.interceptors.request.use((req) => {
  // לוקחים token מה-localStorage
  const token = localStorage.getItem("token");

  if (token) {
    // מוסיפים header
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req; // מחזירים את הבקשה
});

export default API;
