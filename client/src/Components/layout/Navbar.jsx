import "./Navbar.css";
import { FaPaw } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <div className="navbar">
      {/* לוגו */}
      <div className="logo" onClick={() => navigate("/")}>
        House For Paws
        <FaPaw className="paw-icon" />
      </div>

      {/* קישורים */}
      <div className="nav-links">
        <a onClick={() => navigate("/")}>Find pets</a>
        <a onClick={() => navigate("/about")}>About us</a>
        <a onClick={() => navigate("/how-it-works")}>How it works</a>
        <a onClick={() => navigate("/contact")}>Contact</a>
      </div>

      {/* 🔥 אזור כפתורים */}
      <div className="auth-buttons">
        {/* LOGIN PAGE */}
        {isLoginPage && (
          <button onClick={() => navigate("/register")} className="auth-signup-btn">
            Sign up
          </button>
        )}

        {/* REGISTER PAGE */}
        {isRegisterPage && (
          <button onClick={() => navigate("/login")} className="auth-login-btn">
              Login
          </button>
        )}

        {/* OTHER PAGES */}
        {!isLoginPage && !isRegisterPage && (
          <>
            <button onClick={() => navigate("/login")} className="auth-login-btn">
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="auth-signup-btn"
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
