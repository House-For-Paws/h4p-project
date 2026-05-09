/**
 * Global top navigation — logo, centered NavLinks, auth/profile slot.
 * Loads optional profile from API when token exists; listens for AUTH_TOKEN_CHANGED_EVENT.
 * Layout uses CSS grid on desktop so links don’t shift between login/register vs home.
 */
import styles from "../../styles/navbar.module.css";
import PawIcon from "../features/PawIcon";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getProfile } from "../../services/authService";
import {
  AUTH_TOKEN_CHANGED_EVENT,
  notifyAuthTokenChanged,
} from "../../utils/authEvents";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  const isLoggedIn = localStorage.getItem("token");
  const [navUser, setNavUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [profileMenuOpen]);
  const formatDisplayName = (data) => {
    const normalizedRole = String(data?.role || "").toLowerCase();
    if (
      normalizedRole === "admin" ||
      normalizedRole === "administrator" ||
      normalizedRole === "superadmin"
    ) {
      return "Admin";
    }

    const firstName = String(data?.firstName || data?.firstname || "").trim();
    const lastName = String(data?.lastName || data?.lastname || "").trim();
    const username = String(data?.username || "").trim();

    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (username) return username;
    return "User";
  };


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
        const username = formatDisplayName(u);
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
        setNavUser(
          payload
            ? {
                username: formatDisplayName(payload),
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

  const user =
    navUser ||
    (tokenPayload
      ? {
          username: formatDisplayName(tokenPayload),
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
  const isAdminChip = String(user.username || "").toLowerCase() === "admin";

  const linkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`;

  const goToProfile = () => {
    setProfileMenuOpen(false);
    navigate("/profile");
  };

  const goToProfileSettings = () => {
    setProfileMenuOpen(false);
    navigate("/profile?tab=settings");
  };

  const goToAdminDashboard = () => {
    setProfileMenuOpen(false);
    navigate("/admin");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    notifyAuthTokenChanged();
    setProfileMenuOpen(false);
    navigate("/login");
  };

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
          <div className={styles.profileMenuWrap} ref={profileMenuRef}>
            <div
              className={`${styles.profilePreview} ${isAdminChip ? styles.profilePreviewAdmin : ""}`}
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              role="button"
              tabIndex={0}
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setProfileMenuOpen((prev) => !prev);
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

              <div className={styles.profileText}>
                <span className={styles.username}>{user.username}</span>
                <span className={styles.profileSubtext}>
                  {isAdminChip ? "Dashboard access" : "Profile"}
                </span>
              </div>
              <span className={`${styles.profileChevron} ${profileMenuOpen ? styles.profileChevronOpen : ""}`}>
                ▾
              </span>
            </div>

            {profileMenuOpen && (
              <div className={styles.profileDropdown} role="menu">
                <button type="button" className={styles.profileDropdownItem} onClick={goToProfile}>
                  Profile
                </button>
                <button type="button" className={styles.profileDropdownItem} onClick={goToProfileSettings}>
                  Settings
                </button>
                {isAdminChip && (
                  <button type="button" className={styles.profileDropdownItem} onClick={goToAdminDashboard}>
                    Admin dashboard
                  </button>
                )}
                <button type="button" className={`${styles.profileDropdownItem} ${styles.profileDropdownDanger}`} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
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
