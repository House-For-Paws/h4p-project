import styles from "../../styles/navbar.module.css";
import PawIcon from "../features/PawIcon";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/authService";
import { AUTH_TOKEN_CHANGED_EVENT } from "../../utils/authEvents";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  const isLoggedIn = localStorage.getItem("token");
  const [navUser, setNavUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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

  useEffect(() => {
    const loadNavUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setNavUser(null);
        return;
      }
      try {
        const res = await getProfile();
        const u = res.data?.user;
        if (!u) {
          setNavUser(null);
          return;
        }
        const fn = u.firstName || u.firstname || "";
        const ln = u.lastName || u.lastname || "";
        const normalizedRole = String(u.role || "").toLowerCase();
        const username =
          normalizedRole === "admin" ||
          normalizedRole === "administrator" ||
          normalizedRole === "superadmin"
            ? "Admin"
            : fn && ln
              ? `Welcome back, ${fn} ${ln}`
              : fn
                ? `Welcome back, ${fn}`
                : u.username
                  ? `Welcome back, ${u.username}`
                  : "Welcome back, User";
        const fallbackInitial = (fn || u.username || u.email || "U")
          .charAt(0)
          .toUpperCase();
        setNavUser({
          username,
          fallbackInitial,
          avatarUrl: u.profile_picture || "",
        });
      } catch {
        const payload = getUserFromToken();
        const normalizedRole = String(payload?.role || "").toLowerCase();
        setNavUser(
          payload
            ? {
                username:
                  normalizedRole === "admin" ||
                  normalizedRole === "administrator" ||
                  normalizedRole === "superadmin"
                    ? "Admin"
                    : payload.firstname && payload.lastname
                      ? `Welcome back, ${payload.firstname} ${payload.lastname}`
                      : payload.firstname
                        ? `Welcome back, ${payload.firstname}`
                        : payload.username
                          ? `Welcome back, ${payload.username}`
                          : "Welcome back, User",
                fallbackInitial: (
                  payload.firstname ||
                  payload.username ||
                  payload.email ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase(),
                avatarUrl: "",
              }
            : null,
        );
      }
    };

    loadNavUser();
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, loadNavUser);
    return () =>
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, loadNavUser);
  }, [location.pathname]);

  const tokenPayload = getUserFromToken();

  const welcomeFromPayload = (payload) => {
    if (!payload) return "Guest";
    const r = String(payload.role || "").toLowerCase();
    if (r === "admin" || r === "administrator" || r === "superadmin") {
      return "Admin";
    }
    if (payload.firstname && payload.lastname) {
      return `Welcome back, ${payload.firstname} ${payload.lastname}`;
    }
    if (payload.firstname) return `Welcome back, ${payload.firstname}`;
    if (payload.username) return `Welcome back, ${payload.username}`;
    return "Welcome back, User";
  };

  const user =
    navUser ||
    (tokenPayload
      ? {
          username: welcomeFromPayload(tokenPayload),
          fallbackInitial: (
            tokenPayload.firstname ||
            tokenPayload.username ||
            tokenPayload.email ||
            "U"
          )
            .charAt(0)
            .toUpperCase(),
          avatarUrl: "",
        }
      : {
          username: "Guest",
          fallbackInitial: "G",
          avatarUrl: "",
        });

  const avatarSrc = user.avatarUrl || "";

  const linkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`;

  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>
        <div className={styles.pawIcon} onClick={() => navigate("/")}>
          <PawIcon size={22} color="#ffffff" circleColor="#ff9800" />
        </div>

        <div className={styles.logoText}>House For Paws</div>
      </div>

      <div className={styles.navCenter}>
      <nav
        id="main-navigation"
        className={`${styles.navLinks} ${mobileOpen ? styles.navLinksOpen : ""}`}
        aria-label="Main navigation"
      >
        <NavLink to="/" end className={linkClass}>
          Find pets
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          About us
        </NavLink>
        <NavLink to="/how-it-works" className={linkClass}>
          How it works
        </NavLink>
        <NavLink to="/contact" className={linkClass}>
          Contact
        </NavLink>
      </nav>
      </div>

      <button
        type="button"
        className={`${styles.menuToggle} ${mobileOpen ? styles.menuToggleOpen : ""}`}
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
        aria-controls="main-navigation"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={styles.authButtons}>
        {isLoggedIn ? (
          <div
            className={styles.profilePreview}
            onClick={() => navigate("/profile")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/profile");
              }
            }}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt=""
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.profileInitialAvatar}>
                {user.fallbackInitial}
              </div>
            )}

            <span className={styles.username}>{user.username}</span>
          </div>
        ) : (
          <>
            {isLoginPage && (
              <button
                type="button"
                onClick={() => navigate("/register")}
                className={styles.authSignupBtn}
              >
                Sign up
              </button>
            )}

            {isRegisterPage && (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={styles.authLoginBtn}
              >
                Login
              </button>
            )}

            {!isLoginPage && !isRegisterPage && (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className={styles.authLoginBtn}
                >
                  Login
                </button>

                <button
                  type="button"
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
    </header>
  );
}

export default Navbar;
