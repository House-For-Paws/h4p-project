import styles from "../../styles/navbar.module.css";
import PawIcon from "../features/PawIcon";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  // 🔥 fake auth
  const isLoggedIn = localStorage.getItem("token");

  // Get user data from token
  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  };

  const userData = getUserFromToken();

  // Debug: Log the token data to see what fields are available
  console.log("Token userData:", userData);

  const user = userData
    ? {
        username:
          userData.role === "admin"
            ? "Admin"
            : userData.firstname && userData.lastname
              ? `Welcome back, ${userData.firstname} ${userData.lastname}`
              : userData.firstname
                ? `Welcome back, ${userData.firstname}`
                : userData.username
                  ? `Welcome back, ${userData.username}`
                  : "Welcome back, User",
        profileImage: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      }
    : {
        username: "Guest",
        profileImage: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      };

  return (
    <div className={styles.navbar}>
      {/* LOGO */}
      <div className={styles.logo}>
        <div className={styles.pawIcon} onClick={() => navigate("/")}>
          <PawIcon size={24} />
        </div>

        <div className={styles.logoText}>House For Paws</div>
      </div>

      {/* LINKS */}
      <div className={styles.navLinks}>
        <a onClick={() => navigate("/")}>Find pets</a>

        <a onClick={() => navigate("/about")}>About us</a>

        <a onClick={() => navigate("/how-it-works")}>How it works</a>

        <a onClick={() => navigate("/contact")}>Contact</a>
      </div>

      {/* AUTH */}
      <div className={styles.authButtons}>
        {/* 🔥 LOGGED IN */}
        {isLoggedIn ? (
          <div
            className={styles.profilePreview}
            onClick={() => navigate("/profile")}
          >
            <img
              src={user.profileImage}
              alt="profile"
              className={styles.profileImage}
            />

            <span className={styles.username}>{user.username}</span>
          </div>
        ) : (
          <>
            {/* LOGIN PAGE */}
            {isLoginPage && (
              <button
                onClick={() => navigate("/register")}
                className={styles.authSignupBtn}
              >
                Sign up
              </button>
            )}

            {/* REGISTER PAGE */}
            {isRegisterPage && (
              <button
                onClick={() => navigate("/login")}
                className={styles.authLoginBtn}
              >
                Login
              </button>
            )}

            {/* OTHER PAGES */}
            {!isLoginPage && !isRegisterPage && (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className={styles.authLoginBtn}
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className={styles.authSignupBtn}
                >
                  Sign up
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
