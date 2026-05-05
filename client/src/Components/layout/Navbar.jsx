import styles from "../../styles/navbar.module.css";
import PawIcon from "../features/PawIcon";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <div className={styles.navbar}>
      {/* לוגו */}
      <div className={styles.logo} onClick={() => navigate("/")}>
        <PawIcon size={24} />
        House For Paws
      </div>

      {/* קישורים */}
      <div className={styles.navLinks}>
        <a onClick={() => navigate("/")}>Find pets</a>
        <a onClick={() => navigate("/about")}>About us</a>
        <a onClick={() => navigate("/how-it-works")}>How it works</a>
        <a onClick={() => navigate("/contact")}>Contact</a>
      </div>

      {/* 🔥 אזור כפתורים */}
      <div className={styles.authButtons}>
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
      </div>
    </div>
  );
}

export default Navbar;
