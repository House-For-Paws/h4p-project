/**
 * =============================================================================
 * FILE: client/src/Components/layout/Navbar.jsx
 * ROLE: Top nav — links, bell notifications, admin reports flag, profile menu
 * =============================================================================
 * Sections: AUTH LOAD | NOTIFICATIONS | REPORTS PREVIEW | NAV ACTIONS | RENDER
 * =============================================================================
 */
import styles from "../../styles/navbar.module.css";
import PawIcon from "../features/PawIcon";
import NotificationTypeIcon, {
  getNotificationVisual,
} from "../features/NotificationTypeIcon";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Bell, Flag } from "lucide-react";
import { getProfile } from "../../services/authService";
import {
  getAdminPendingReportsCount,
  getAdminReports,
} from "../../services/adminService";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
} from "../../services/notificationService";
import {
  AUTH_TOKEN_CHANGED_EVENT,
  notifyAuthTokenChanged,
} from "../../utils/authEvents";

function isAdminRole(role) {
  const value = String(role || "").toLowerCase();
  return (
    value === "admin" || value === "administrator" || value === "superadmin"
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  const isLoggedIn = localStorage.getItem("token");
  const [navUser, setNavUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingReports, setPendingReports] = useState([]);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const notifWrapRef = useRef(null);
  const notifCloseTimer = useRef(null);
  const reportsCloseTimer = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
    setNotifOpen(false);
    setReportsOpen(false);
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
          role: u.role || "",
          isAdmin: isAdminRole(u.role),
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
                role: payload.role || "",
                isAdmin: isAdminRole(payload.role),
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

  useEffect(() => {
    let active = true;

    const loadNotifs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (active) {
          setUnreadCount(0);
          setNotifications([]);
        }
        return;
      }
      try {
        const [countRes, listRes] = await Promise.all([
          getUnreadNotificationCount(),
          getNotifications(),
        ]);
        if (!active) return;
        setUnreadCount(Number(countRes.data?.count || 0));
        setNotifications(
          Array.isArray(listRes.data) ? listRes.data.slice(0, 8) : [],
        );
      } catch {
        if (active) {
          setUnreadCount(0);
          setNotifications([]);
        }
      }
    };

    loadNotifs();
    const intervalId = window.setInterval(loadNotifs, 30000);
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, loadNotifs);
    window.addEventListener("focus", loadNotifs);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, loadNotifs);
      window.removeEventListener("focus", loadNotifs);
    };
  }, [location.pathname, location.search]);

  useEffect(() => {
    let active = true;

    const loadAdminReports = async () => {
      const token = localStorage.getItem("token");
      const admin =
        navUser?.isAdmin || isAdminRole(getUserFromToken()?.role);
      if (!token || !admin) {
        if (active) {
          setPendingReportsCount(0);
          setPendingReports([]);
        }
        return;
      }
      try {
        const [countRes, listRes] = await Promise.all([
          getAdminPendingReportsCount(),
          getAdminReports(),
        ]);
        if (!active) return;
        setPendingReportsCount(Number(countRes.data?.count || 0));
        const pending = (listRes.data || []).filter(
          (item) => String(item.status || "").toLowerCase() === "pending",
        );
        setPendingReports(pending.slice(0, 8));
      } catch {
        if (active) {
          setPendingReportsCount(0);
          setPendingReports([]);
        }
      }
    };

    loadAdminReports();
    const intervalId = window.setInterval(loadAdminReports, 30000);
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, loadAdminReports);
    window.addEventListener("focus", loadAdminReports);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, loadAdminReports);
      window.removeEventListener("focus", loadAdminReports);
    };
  }, [location.pathname, location.search, navUser?.isAdmin]);

  useEffect(() => {
    return () => {
      if (notifCloseTimer.current) {
        window.clearTimeout(notifCloseTimer.current);
      }
      if (reportsCloseTimer.current) {
        window.clearTimeout(reportsCloseTimer.current);
      }
    };
  }, []);

  // ======================== NOTIFICATION BELL ========================
  const openNotifPreview = () => {
    if (notifCloseTimer.current) {
      window.clearTimeout(notifCloseTimer.current);
      notifCloseTimer.current = null;
    }
    setProfileMenuOpen(false);
    setReportsOpen(false);
    setNotifOpen(true);
  };

  const scheduleCloseNotifPreview = () => {
    if (notifCloseTimer.current) {
      window.clearTimeout(notifCloseTimer.current);
    }
    notifCloseTimer.current = window.setTimeout(() => {
      setNotifOpen(false);
    }, 180);
  };

  // ======================== ADMIN REPORTS FLAG ========================
  const openReportsPreview = () => {
    if (reportsCloseTimer.current) {
      window.clearTimeout(reportsCloseTimer.current);
      reportsCloseTimer.current = null;
    }
    setProfileMenuOpen(false);
    setNotifOpen(false);
    setReportsOpen(true);
  };

  const scheduleCloseReportsPreview = () => {
    if (reportsCloseTimer.current) {
      window.clearTimeout(reportsCloseTimer.current);
    }
    reportsCloseTimer.current = window.setTimeout(() => {
      setReportsOpen(false);
    }, 180);
  };

  const handleNotifItemClick = async (item) => {
    setNotifOpen(false);
    if (!Number(item.isRead)) {
      try {
        await markNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === item.id ? { ...n, isRead: 1 } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        /* ignore */
      }
    }
    if (item.relatedPetId) {
      navigate(`/adopt/${item.relatedPetId}`);
      return;
    }
    navigate("/profile?tab=notifications");
  };

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
          role: tokenPayload.role || "",
          isAdmin: isAdminRole(tokenPayload.role),
        }
      : {
          username: "Guest",
          fallbackInitial: "G",
          avatarUrl: "",
          role: "",
          isAdmin: false,
        });

  const avatarSrc = user.avatarUrl || "";
  const isAdminChip = Boolean(user.isAdmin || navUser?.isAdmin);

  const linkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`;

  const goToNotifications = () => {
    setProfileMenuOpen(false);
    setNotifOpen(false);
    navigate("/profile?tab=notifications");
  };

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
    setReportsOpen(false);
    navigate("/admin");
  };

  const goToAdminReports = () => {
    setProfileMenuOpen(false);
    setReportsOpen(false);
    setNotifOpen(false);
    navigate("/admin?section=reports");
  };

  const handleReportItemClick = (report) => {
    setReportsOpen(false);
    if (report.relatedPetId) {
      navigate(`/adopt/${report.relatedPetId}`);
      return;
    }
    navigate("/admin?section=reports");
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
            {isAdminChip && (
              <div
                className={styles.notifWrap}
                onMouseEnter={openReportsPreview}
                onMouseLeave={scheduleCloseReportsPreview}
              >
                <button
                  type="button"
                  className={`${styles.notifBellBtn} ${styles.reportsBellBtn}`}
                  onClick={goToAdminReports}
                  onFocus={openReportsPreview}
                  aria-expanded={reportsOpen}
                  aria-haspopup="true"
                  aria-label={
                    pendingReportsCount > 0
                      ? `${pendingReportsCount} pending reports`
                      : "Reports"
                  }
                  title="Reports"
                >
                  <Flag size={18} strokeWidth={2.2} />
                  {pendingReportsCount > 0 && (
                    <span className={styles.notifBadge}>
                      {pendingReportsCount > 99
                        ? "99+"
                        : pendingReportsCount}
                    </span>
                  )}
                </button>

                {reportsOpen && (
                  <div className={styles.notifDropdown} role="menu">
                    <div className={styles.notifDropdownHeader}>
                      <strong>Reports</strong>
                      {pendingReportsCount > 0 ? (
                        <span>{pendingReportsCount} pending</span>
                      ) : (
                        <span>No pending reports</span>
                      )}
                    </div>

                    {pendingReports.length === 0 ? (
                      <p className={styles.notifEmpty}>
                        No new reports to review.
                      </p>
                    ) : (
                      <ul className={styles.notifList}>
                        {pendingReports.map((report) => (
                          <li key={report.id}>
                            <button
                              type="button"
                              className={`${styles.notifItem} ${styles.notifItemUnread}`}
                              onClick={() => handleReportItemClick(report)}
                            >
                              <strong>
                                {report.targetType === "comment"
                                  ? "Comment report"
                                  : "Listing report"}
                              </strong>
                              <p>
                                {report.reason}
                                {report.targetPreview
                                  ? ` — ${report.targetPreview}`
                                  : ""}
                              </p>
                              <span>
                                {report.createdAt
                                  ? new Date(
                                      report.createdAt,
                                    ).toLocaleString()
                                  : ""}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      type="button"
                      className={styles.notifViewAll}
                      onClick={goToAdminReports}
                    >
                      Open reports inbox
                    </button>
                  </div>
                )}
              </div>
            )}

            <div
              className={styles.notifWrap}
              ref={notifWrapRef}
              onMouseEnter={openNotifPreview}
              onMouseLeave={scheduleCloseNotifPreview}
            >
              <button
                type="button"
                className={styles.notifBellBtn}
                onClick={goToNotifications}
                onFocus={openNotifPreview}
                aria-expanded={notifOpen}
                aria-haspopup="true"
                aria-label={
                  unreadCount > 0
                    ? `${unreadCount} unread notifications`
                    : "Notifications"
                }
                title="Notifications"
              >
                <Bell size={18} strokeWidth={2.2} />
                {unreadCount > 0 && (
                  <span className={styles.notifBadge}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className={styles.notifDropdown} role="menu">
                  <div className={styles.notifDropdownHeader}>
                    <strong>Notifications</strong>
                    {unreadCount > 0 ? (
                      <span>{unreadCount} unread</span>
                    ) : (
                      <span>All caught up</span>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className={styles.notifEmpty}>No notifications yet.</p>
                  ) : (
                    <ul className={styles.notifList}>
                      {notifications.map((item) => {
                        const unread = !Number(item.isRead);
                        const type = String(item.type || "").toLowerCase();
                        const isWarning = type === "admin_warning";
                        const visual = getNotificationVisual(type);
                        const toneClass =
                          type === "pet_comment"
                            ? styles.notifItemComment
                            : type === "pet_like"
                              ? styles.notifItemLike
                              : type === "adoption_request"
                                ? styles.notifItemAdopt
                                : type === "application_update"
                                  ? styles.notifItemUpdate
                                  : "";
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              className={`${styles.notifItem} ${unread ? styles.notifItemUnread : ""} ${isWarning ? styles.notifItemWarning : ""} ${toneClass}`}
                              onClick={() => handleNotifItemClick(item)}
                            >
                              <div className={styles.notifItemRow}>
                                <NotificationTypeIcon type={type} />
                                <div className={styles.notifItemCopy}>
                                  <span className={styles.notifTypeLabel}>
                                    {visual.label}
                                  </span>
                                  <strong>{item.title}</strong>
                                  <p>{item.body}</p>
                                  <span>
                                    {item.createdAt
                                      ? new Date(
                                          item.createdAt,
                                        ).toLocaleString()
                                      : ""}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <button
                    type="button"
                    className={styles.notifViewAll}
                    onClick={goToNotifications}
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>

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
                <button type="button" className={styles.profileDropdownItem} onClick={goToNotifications}>
                  Notifications
                  {unreadCount > 0 ? ` (${unreadCount})` : ""}
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
