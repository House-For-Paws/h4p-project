/**
 * =============================================================================
 * FILE: client/src/pages/AdminDashboard.jsx
 * ROLE: Admin panel — stats, users, bans/warns, reports, comments, applications
 * =============================================================================
 * Sections: LOAD | NAV | APPLICATIONS | COMMENTS | REPORTS | USERS | BAN/WARN
 * =============================================================================
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  Download,
  Eye,
  FileText,
  Flag,
  Heart,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  PawPrint,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import {
  deleteAdminApplication,
  deleteAdminComment,
  deleteAdminPet,
  getAdminApplications,
  getAdminComments,
  deleteAdminReport,
  getAdminReportMessages,
  getAdminReports,
  getAdminStats,
  getAdminUsers,
  setAdminUserBanned,
  updateAdminApplicationStatus,
  updateAdminReportStatus,
  warnAdminUser,
} from "../services/adminService";
import { getProfile } from "../services/authService";
import styles from "../styles/adminDashboard.module.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "animals", label: "Animals", icon: PawPrint },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "reports", label: "Reports", icon: Flag },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

const APP_STATUS_OPTIONS = [
  { value: "pending", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const BAN_REASON_OPTIONS = [
  "Spam / abuse",
  "Inappropriate content",
  "Harassment",
  "Fake account",
  "Scam / fraud",
  "Terms of service violation",
  "Other",
];

const WARNING_REASON_OPTIONS = [
  "Spam / abuse",
  "Inappropriate content",
  "Harassment",
  "Misleading information",
  "Community guidelines",
  "Other",
];

const REPORT_REASON_FILTER_OPTIONS = [
  "Spam",
  "Inappropriate content",
  "Harassment",
  "Misleading information",
  "Scam / fraud",
  "Harassment / bullying",
  "Spam / scam",
  "Inappropriate messages",
  "Threats / abuse",
  "Broken page / crash",
  "Something looks wrong",
  "Feature not working",
  "Performance issue",
  "Other",
];

const DATE_PRESET_OPTIONS = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "custom", label: "Custom range" },
];

/** Build inclusive start/end for a date preset. */
function getPresetRange(preset) {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  if (preset === "today") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      to: end,
    };
  }
  if (preset === "7d") {
    const from = new Date(end);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return { from, to: end };
  }
  if (preset === "30d") {
    const from = new Date(end);
    from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);
    return { from, to: end };
  }
  return { from: null, to: null };
}

/** True when dateValue falls in the selected preset / custom range. */
function matchesDateFilter(dateValue, preset, customFrom, customTo) {
  if (!preset || preset === "all") return true;
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) return false;

  let from = null;
  let to = null;
  if (preset === "custom") {
    if (customFrom) {
      from = new Date(customFrom);
      from.setHours(0, 0, 0, 0);
    }
    if (customTo) {
      to = new Date(customTo);
      to.setHours(23, 59, 59, 999);
    }
  } else {
    ({ from, to } = getPresetRange(preset));
  }

  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function formatAppStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === "pending") return "Under Review";
  if (value === "approved") return "Approved";
  if (value === "rejected") return "Rejected";
  if (value === "cancelled") return "Cancelled";
  return status || "Unknown";
}

function statusBadgeClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "approved" || value === "adopted" || value === "available") {
    return styles.badgeGreen;
  }
  if (value === "rejected" || value === "cancelled") return styles.badgeRed;
  if (value === "pending") return styles.badgeYellow;
  return styles.badgeGray;
}

function formatDelta(value) {
  const num = Number(value || 0);
  if (num > 0) return `+${num} from last month`;
  if (num < 0) return `${num} from last month`;
  return "No change from last month";
}

function petThumb(pet) {
  if (!pet) return "";
  if (Array.isArray(pet.images) && pet.images[0]) return pet.images[0];
  if (typeof pet.images === "string") {
    try {
      const parsed = JSON.parse(pet.images);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      /* ignore */
    }
  }
  return pet.image || pet.petImage || "";
}

function capitalizeFirst(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function displayName(user) {
  const first = user?.firstName || user?.firstname || "";
  const last = user?.lastName || user?.lastname || "";
  const full = `${first} ${last}`.trim();
  return full || user?.username || "Admin";
}

function ownerDisplayName(item) {
  const first = item?.ownerFirstName || "";
  const last = item?.ownerLastName || "";
  const full = `${first} ${last}`.trim();
  return full || item?.ownerUsername || "Unknown";
}

function DonutChart({ segments, total, centerLabel }) {
  const size = 160;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={styles.donutWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eee"
          strokeWidth={stroke}
        />
        {segments.map((seg) => {
          const value = Number(seg.value || 0);
          const length = total > 0 ? (value / total) * circumference : 0;
          const circle = (
            <circle
              key={seg.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += length;
          return circle;
        })}
        <text x="50%" y="46%" textAnchor="middle" className={styles.donutTotal}>
          {total}
        </text>
        <text x="50%" y="58%" textAnchor="middle" className={styles.donutLabel}>
          {centerLabel}
        </text>
      </svg>
    </div>
  );
}

function LineChart({ points }) {
  const width = 520;
  const height = 200;
  const padX = 28;
  const padY = 24;
  const values = points.map((p) => Number(p.count || 0));
  const max = Math.max(1, ...values);
  const stepX =
    points.length > 1
      ? (width - padX * 2) / (points.length - 1)
      : width - padX * 2;

  const coords = points.map((p, i) => {
    const x = padX + i * stepX;
    const y =
      height - padY - (Number(p.count || 0) / max) * (height - padY * 2);
    return { x, y, ...p };
  });

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  const labelIndexes = new Set(
    [0, Math.floor(points.length / 2), points.length - 1].filter((i) => i >= 0),
  );

  return (
    <svg
      className={styles.lineChart}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {[0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = height - padY - ratio * (height - padY * 2);
        return (
          <line
            key={ratio}
            x1={padX}
            y1={y}
            x2={width - padX}
            y2={y}
            className={styles.gridLine}
          />
        );
      })}
      <path d={path} className={styles.linePath} fill="none" />
      {coords.map((c) => (
        <circle
          key={c.date}
          cx={c.x}
          cy={c.y}
          r="3.5"
          className={styles.lineDot}
        />
      ))}
      {coords.map((c, i) =>
        labelIndexes.has(i) ? (
          <text
            key={`label-${c.date}`}
            x={c.x}
            y={height - 6}
            textAnchor="middle"
            className={styles.lineAxisLabel}
          >
            {c.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [section, setSection] = useState(() => {
    const fromQuery = new URLSearchParams(window.location.search).get(
      "section",
    );
    return fromQuery || "dashboard";
  });
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [reportScreenshot, setReportScreenshot] = useState(null);
  const [reportChat, setReportChat] = useState(null);
  const [reportChatLoading, setReportChatLoading] = useState(false);
  const [reportChatError, setReportChatError] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [messageModal, setMessageModal] = useState(null);
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState(BAN_REASON_OPTIONS[0]);
  const [banDescription, setBanDescription] = useState("");
  const [banError, setBanError] = useState("");
  const [warnModal, setWarnModal] = useState(null);
  const [warnReason, setWarnReason] = useState(WARNING_REASON_OPTIONS[0]);
  const [warnMessage, setWarnMessage] = useState("");
  const [warnError, setWarnError] = useState("");

  // ----- Section filters -----
  const [animalTypeFilter, setAnimalTypeFilter] = useState("all");
  const [animalStatusFilter, setAnimalStatusFilter] = useState("all");
  const [appDatePreset, setAppDatePreset] = useState("all");
  const [appDateFrom, setAppDateFrom] = useState("");
  const [appDateTo, setAppDateTo] = useState("");
  const [commentSearch, setCommentSearch] = useState("");
  const [commentDatePreset, setCommentDatePreset] = useState("all");
  const [commentDateFrom, setCommentDateFrom] = useState("");
  const [commentDateTo, setCommentDateTo] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [reportReasonFilter, setReportReasonFilter] = useState("all");
  const [reportDatePreset, setReportDatePreset] = useState("all");
  const [reportDateFrom, setReportDateFrom] = useState("");
  const [reportDateTo, setReportDateTo] = useState("");
  const [userDatePreset, setUserDatePreset] = useState("all");
  const [userDateFrom, setUserDateFrom] = useState("");
  const [userDateTo, setUserDateTo] = useState("");

  const closeMoreMenu = () => {
    setOpenMenuId(null);
  };

  const closeBanModal = () => {
    if (updatingId?.startsWith?.("user-")) return;
    setBanModal(null);
    setBanReason(BAN_REASON_OPTIONS[0]);
    setBanDescription("");
    setBanError("");
  };

  const closeWarnModal = () => {
    if (updatingId?.startsWith?.("warn-")) return;
    setWarnModal(null);
    setWarnReason(WARNING_REASON_OPTIONS[0]);
    setWarnMessage("");
    setWarnError("");
  };

  // ======================== LOAD DASHBOARD DATA ========================
  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, commentsRes, appsRes, reportsRes, profileRes] =
        await Promise.all([
          getAdminStats(),
          getAdminUsers(),
          getAdminComments(),
          getAdminApplications(),
          getAdminReports(),
          getProfile(),
        ]);

      setStats(statsRes.data);
      setAllUsers(usersRes.data || []);
      setAllComments(commentsRes.data || []);
      setAllApplications(appsRes.data || []);
      setAllReports(reportsRes.data || []);
      setAdminUser(profileRes.data?.user || null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Access denied. Admins only.");
      } else {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const fromQuery = new URLSearchParams(location.search).get("section");
    if (fromQuery) setSection(fromQuery);
  }, [location.search]);

  useEffect(() => {
    if (openMenuId == null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeMoreMenu();
    };
    const onScroll = () => closeMoreMenu();
    document.addEventListener("click", closeMoreMenu);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", closeMoreMenu);
    return () => {
      document.removeEventListener("click", closeMoreMenu);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", closeMoreMenu);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (!messageModal) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeMessageModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [messageModal]);

  useEffect(() => {
    if (!banModal) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeBanModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [banModal, updatingId]);

  useEffect(() => {
    if (!warnModal) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeWarnModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [warnModal, updatingId]);

  const pets = stats?.allPets || [];

  const animalTypeOptions = useMemo(() => {
    const types = new Set();
    pets.forEach((pet) => {
      const type = String(pet.type || "").trim().toLowerCase();
      if (type) types.add(type);
    });
    ["dog", "cat"].forEach((type) => types.add(type));
    return ["all", ...Array.from(types).sort()];
  }, [pets]);

  const reportReasonOptions = useMemo(() => {
    const reasons = new Set(REPORT_REASON_FILTER_OPTIONS);
    allReports.forEach((report) => {
      const reason = String(report.reason || "").trim();
      if (reason) reasons.add(reason);
    });
    return ["all", ...Array.from(reasons)];
  }, [allReports]);

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const typeOk =
        animalTypeFilter === "all" ||
        String(pet.type || "").trim().toLowerCase() === animalTypeFilter;
      const statusOk =
        animalStatusFilter === "all" ||
        String(pet.status || "").trim().toLowerCase() === animalStatusFilter;
      return typeOk && statusOk;
    });
  }, [pets, animalTypeFilter, animalStatusFilter]);

  const filteredApplications = useMemo(
    () =>
      allApplications.filter((app) =>
        matchesDateFilter(
          app.createdAt,
          appDatePreset,
          appDateFrom,
          appDateTo,
        ),
      ),
    [allApplications, appDatePreset, appDateFrom, appDateTo],
  );

  const filteredComments = useMemo(() => {
    const query = commentSearch.trim().toLowerCase();
    return allComments.filter((comment) => {
      if (
        !matchesDateFilter(
          comment.createdAt,
          commentDatePreset,
          commentDateFrom,
          commentDateTo,
        )
      ) {
        return false;
      }
      if (!query) return true;
      const author = displayName(comment).toLowerCase();
      const username = String(comment.username || "").toLowerCase();
      const email = String(comment.email || "").toLowerCase();
      const petName = String(comment.petName || "").toLowerCase();
      const text = String(comment.text || "").toLowerCase();
      return (
        author.includes(query) ||
        username.includes(query) ||
        email.includes(query) ||
        petName.includes(query) ||
        text.includes(query)
      );
    });
  }, [
    allComments,
    commentSearch,
    commentDatePreset,
    commentDateFrom,
    commentDateTo,
  ]);

  const filteredReports = useMemo(
    () =>
      allReports.filter((report) => {
        const type = String(report.targetType || "").toLowerCase();
        if (reportTypeFilter !== "all") {
          const wanted =
            reportTypeFilter === "listing" ? "pet" : reportTypeFilter;
          if (type !== wanted) return false;
        }
        if (
          reportReasonFilter !== "all" &&
          String(report.reason || "").trim() !== reportReasonFilter
        ) {
          return false;
        }
        return matchesDateFilter(
          report.createdAt,
          reportDatePreset,
          reportDateFrom,
          reportDateTo,
        );
      }),
    [
      allReports,
      reportTypeFilter,
      reportReasonFilter,
      reportDatePreset,
      reportDateFrom,
      reportDateTo,
    ],
  );

  const filteredUsers = useMemo(
    () =>
      allUsers.filter((user) =>
        matchesDateFilter(
          user.createdAt,
          userDatePreset,
          userDateFrom,
          userDateTo,
        ),
      ),
    [allUsers, userDatePreset, userDateFrom, userDateTo],
  );

  const dateRangeLabel = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d) =>
      d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    return `${fmt(start)} - ${fmt(end)}`;
  }, []);

  const animalSegments = useMemo(() => {
    const data = stats?.animalsByStatus || {};
    return [
      {
        key: "available",
        label: "Available",
        value: data.available || 0,
        color: "#43a047",
      },
      {
        key: "pending",
        label: "Pending",
        value: data.pending || 0,
        color: "#ff9800",
      },
      {
        key: "adopted",
        label: "Adopted",
        value: data.adopted || 0,
        color: "#e53935",
      },
      {
        key: "notAvailable",
        label: "Not Available",
        value: data.notAvailable || 0,
        color: "#9e9e9e",
      },
    ];
  }, [stats]);

  const applicationSegments = useMemo(() => {
    const data = stats?.applicationsByStatus || {};
    return [
      {
        key: "pending",
        label: "Under Review",
        value: data.pending || 0,
        color: "#ffb300",
      },
      {
        key: "approved",
        label: "Approved",
        value: data.approved || 0,
        color: "#43a047",
      },
      {
        key: "rejected",
        label: "Rejected",
        value: data.rejected || 0,
        color: "#e53935",
      },
      {
        key: "cancelled",
        label: "Cancelled",
        value: data.cancelled || 0,
        color: "#9e9e9e",
      },
    ];
  }, [stats]);

  const animalTotal = animalSegments.reduce((s, x) => s + x.value, 0);
  const applicationTotal = applicationSegments.reduce((s, x) => s + x.value, 0);

  const handleNav = (id) => {
    if (id === "settings") {
      navigate("/profile?tab=settings");
      return;
    }
    setSection(id);
    setActionMessage("");
  };

  const refreshAfterMutation = async (message) => {
    const [statsRes, appsRes] = await Promise.all([
      getAdminStats(),
      getAdminApplications(),
    ]);
    setStats(statsRes.data);
    setAllApplications(appsRes.data || []);
    setActionMessage(message);
  };

  // ======================== APPLICATIONS ========================
  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    setActionMessage("");
    closeMoreMenu();
    try {
      await updateAdminApplicationStatus(id, status);
      await refreshAfterMutation("Application status updated.");
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || "Could not update application status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveApplication = async (app) => {
    closeMoreMenu();
    const ok = window.confirm(
      `Remove the adoption request from ${app.fullName} for ${app.petName || "this pet"}?`,
    );
    if (!ok) return;
    setUpdatingId(app.id);
    try {
      await deleteAdminApplication(app.id);
      await refreshAfterMutation("Application removed.");
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || "Could not remove application.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemovePetListing = async (app) => {
    closeMoreMenu();
    if (!app.petId) {
      setActionMessage("This request has no linked pet listing.");
      return;
    }
    const ok = window.confirm(
      `Permanently remove the pet listing "${app.petName || "Pet"}" and all its applications?`,
    );
    if (!ok) return;
    setUpdatingId(app.id);
    try {
      await deleteAdminPet(app.petId);
      await refreshAfterMutation("Pet listing removed.");
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || "Could not remove pet listing.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveAnimal = async (pet) => {
    if (!pet?.id) return;
    const ok = window.confirm(
      `Permanently remove "${pet.name || "this pet"}" and related applications?`,
    );
    if (!ok) return;
    setUpdatingId(`pet-${pet.id}`);
    try {
      await deleteAdminPet(pet.id);
      await refreshAfterMutation("Pet listing removed.");
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || "Could not remove pet listing.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ======================== COMMENTS ========================
  const handleRemoveComment = async (comment) => {
    const author = displayName(comment);
    const ok = window.confirm(
      `Remove comment by ${author} on ${comment.petName || "this pet"}?`,
    );
    if (!ok) return;
    setUpdatingId(`comment-${comment.id}`);
    try {
      await deleteAdminComment(comment.id);
      setAllComments((prev) => prev.filter((item) => item.id !== comment.id));
      setActionMessage("Comment removed.");
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || "Could not remove comment.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openBanModal = (user) => {
    setBanModal(user);
    setBanReason(BAN_REASON_OPTIONS[0]);
    setBanDescription("");
    setBanError("");
  };

  const openWarnModal = (user) => {
    setWarnModal(user);
    setWarnReason(WARNING_REASON_OPTIONS[0]);
    setWarnMessage("");
    setWarnError("");
  };

  // ======================== WARN USER ========================
  const handleConfirmWarnUser = async () => {
    if (!warnModal) return;
    const reason = String(warnReason || "").trim();
    const message = String(warnMessage || "").trim();
    if (!reason) {
      setWarnError("Choose a warning reason.");
      return;
    }
    if (!message) {
      setWarnError("Add a short warning message.");
      return;
    }

    setWarnError("");
    setUpdatingId(`warn-${warnModal.id}`);
    try {
      const res = await warnAdminUser(warnModal.id, { reason, message });
      setAllUsers((prev) =>
        prev.map((item) =>
          item.id === warnModal.id
            ? {
                ...item,
                warningCount: Number(
                  res.data?.warningCount ?? Number(item.warningCount || 0) + 1,
                ),
              }
            : item,
        ),
      );
      setActionMessage(res.data?.message || "Warning sent.");
      setWarnModal(null);
      setWarnReason(WARNING_REASON_OPTIONS[0]);
      setWarnMessage("");
    } catch (err) {
      setWarnError(
        err.response?.data?.message || "Could not send warning.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openMoreMenuAt = (e, menuId) => {
    e.stopPropagation();
    if (openMenuId === menuId) {
      closeMoreMenu();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 200;
    const gap = 6;
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8,
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 280;
    setMenuPos({
      top: openUp ? undefined : rect.bottom + gap,
      bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
      left,
    });
    setOpenMenuId(menuId);
  };

  // ======================== REPORTS ========================
  const handleUpdateReportStatus = async (report, status) => {
    closeMoreMenu();
    setUpdatingId(`report-${report.id}`);
    try {
      await updateAdminReportStatus(report.id, status);
      setAllReports((prev) =>
        prev.map((item) =>
          item.id === report.id ? { ...item, status } : item,
        ),
      );
      setActionMessage(
        status === "dismissed"
          ? "Report dismissed."
          : status === "pending"
            ? "Report reopened."
            : "Report marked reviewed.",
      );
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || "Could not update report.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenReportChat = async (report) => {
    closeMoreMenu();
    setReportChat(null);
    setReportChatError("");
    setReportChatLoading(true);
    try {
      const res = await getAdminReportMessages(report.id);
      setReportChat(res.data || null);
    } catch (err) {
      setReportChatError(
        err.response?.data?.message || "Could not load chat history.",
      );
      setReportChat({ errorOnly: true });
    } finally {
      setReportChatLoading(false);
    }
  };

  const handleDeleteReport = async (report) => {
    closeMoreMenu();
    const ok = window.confirm(
      "Permanently delete this report? This cannot be undone.",
    );
    if (!ok) return;

    setUpdatingId(`report-${report.id}`);
    try {
      await deleteAdminReport(report.id);
      setAllReports((prev) => prev.filter((item) => item.id !== report.id));
      if (reportChat && !reportChat.errorOnly && reportChat.report?.id === report.id) {
        setReportChat(null);
      }
      setActionMessage("Report deleted.");
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || "Could not delete report.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ======================== BAN / UNBAN ========================
  const handleUnbanUser = async (user) => {
    const label = displayName(user);
    const ok = window.confirm(`Unban @${user.username || label}?`);
    if (!ok) return;
    setUpdatingId(`user-${user.id}`);
    try {
      const res = await setAdminUserBanned(user.id, { banned: false });
      setAllUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                isBanned: false,
                banReason: null,
                banDescription: null,
                bannedAt: null,
              }
            : item,
        ),
      );
      setActionMessage(res.data?.message || "User unbanned.");
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || "Could not unban this user.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmBanUser = async () => {
    if (!banModal) return;
    const reason = String(banReason || "").trim();
    const description = String(banDescription || "").trim();
    if (!reason) {
      setBanError("Choose a ban reason.");
      return;
    }
    if (!description) {
      setBanError("Add a short description for this ban.");
      return;
    }

    setBanError("");
    setUpdatingId(`user-${banModal.id}`);
    try {
      const res = await setAdminUserBanned(banModal.id, {
        banned: true,
        reason,
        description,
      });
      setAllUsers((prev) =>
        prev.map((item) =>
          item.id === banModal.id
            ? {
                ...item,
                isBanned: true,
                banReason: res.data?.banReason || reason,
                banDescription: res.data?.banDescription || description,
                bannedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      setActionMessage(res.data?.message || "User banned.");
      setBanModal(null);
      setBanReason(BAN_REASON_OPTIONS[0]);
      setBanDescription("");
    } catch (err) {
      setBanError(
        err.response?.data?.message || "Could not ban this user.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEmailApplicant = (app) => {
    closeMoreMenu();
    if (!app.email) {
      setActionMessage("No email on this application.");
      return;
    }
    const subject = encodeURIComponent(
      `About your adoption request for ${app.petName || "a pet"}`,
    );
    window.location.href = `mailto:${app.email}?subject=${subject}`;
  };

  const handleCopyEmail = async (app) => {
    closeMoreMenu();
    if (!app.email) {
      setActionMessage("No email on this application.");
      return;
    }
    try {
      await navigator.clipboard.writeText(app.email);
      setActionMessage("Applicant email copied.");
    } catch {
      setActionMessage(app.email);
    }
  };

  const handleViewMessage = (app) => {
    closeMoreMenu();
    setMessageModal(app);
  };

  const closeMessageModal = () => setMessageModal(null);

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const handleExportReport = () => {
    if (!stats) return;
    const now = new Date().toLocaleString();
    const kpi = stats.stats || {};
    const rows = (allApplications.length
      ? allApplications
      : stats.recentApplications || []
    )
      .map(
        (app) => `
        <tr>
          <td>${escapeHtml(app.petName)}</td>
          <td>${escapeHtml(app.fullName)}</td>
          <td>${escapeHtml(app.email)}</td>
          <td>${escapeHtml(formatAppStatus(app.status))}</td>
          <td>${escapeHtml(app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "")}</td>
        </tr>`,
      )
      .join("");

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>H4P Admin Report</title>
          <style>
            body { font-family: Segoe UI, Arial, sans-serif; margin: 24px; color: #222; }
            h1 { margin: 0 0 4px; }
            .meta { color: #666; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
            .card { border: 1px solid #ddd; border-radius: 10px; padding: 12px; }
            .label { font-size: 12px; color: #777; }
            .value { font-size: 22px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>House For Paws — Admin Report</h1>
          <p class="meta">Generated: ${escapeHtml(now)} · Range: ${escapeHtml(dateRangeLabel)}</p>
          <div class="grid">
            <div class="card"><div class="label">Animals</div><div class="value">${escapeHtml(kpi.totalPets)}</div></div>
            <div class="card"><div class="label">Applications</div><div class="value">${escapeHtml(kpi.totalApplications)}</div></div>
            <div class="card"><div class="label">Adoptions</div><div class="value">${escapeHtml(kpi.totalAdoptions)}</div></div>
            <div class="card"><div class="label">Users</div><div class="value">${escapeHtml(kpi.totalUsers)}</div></div>
          </div>
          <h2>Applications</h2>
          <table>
            <thead>
              <tr><th>Animal</th><th>Applicant</th><th>Email</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>${rows || "<tr><td colspan='5'>No applications</td></tr>"}</tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const renderApplicationsTable = (
    rows,
    { showActions = true, limit, emptyText = "No applications yet." } = {},
  ) => {
    const list = typeof limit === "number" ? rows.slice(0, limit) : rows;
    if (!list.length) {
      return <p className={styles.empty}>{emptyText}</p>;
    }

    return (
      <div className={styles.tableScroll}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Animal</th>
              <th>Posted by</th>
              <th>Applicant</th>
              <th>Date</th>
              <th>Status</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((app) => (
              <tr key={app.id}>
                <td>
                  <div className={styles.personCell}>
                    {petThumb(app) ? (
                      <img
                        src={petThumb(app)}
                        alt=""
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarFallback}>
                        <PawPrint size={14} />
                      </div>
                    )}
                    <div>
                      <strong>{app.petName || "Pet"}</strong>
                      <span>
                        {capitalizeFirst(app.petType) ||
                          app.petBreed ||
                          "Animal"}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.personCell}>
                    {app.ownerAvatar ? (
                      <img
                        src={app.ownerAvatar}
                        alt=""
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {ownerDisplayName(app).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <strong>{ownerDisplayName(app)}</strong>
                      <span>{app.ownerEmail || app.ownerUsername || "—"}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.personCell}>
                    {app.applicantAvatar ? (
                      <img
                        src={app.applicantAvatar}
                        alt=""
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {(app.fullName || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <strong>{app.fullName}</strong>
                      <span>{app.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  {app.createdAt
                    ? new Date(app.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                <td>
                  {showActions ? (
                    <select
                      className={`${styles.statusSelect} ${statusBadgeClass(app.status)}`}
                      value={String(app.status || "pending").toLowerCase()}
                      disabled={updatingId === app.id}
                      onChange={(e) =>
                        handleStatusChange(app.id, e.target.value)
                      }
                    >
                      {APP_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`${styles.badge} ${statusBadgeClass(app.status)}`}
                    >
                      {formatAppStatus(app.status)}
                    </span>
                  )}
                </td>
                {showActions && (
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => navigate(`/adopt/${app.petId}`)}
                        title="View pet"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <div className={styles.moreWrap}>
                        <button
                          type="button"
                          className={styles.moreBtn}
                          title="More"
                          aria-expanded={openMenuId === app.id}
                          aria-haspopup="menu"
                          disabled={updatingId === app.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openMenuId === app.id) {
                              closeMoreMenu();
                              return;
                            }
                            const rect = e.currentTarget.getBoundingClientRect();
                            const menuWidth = 200;
                            const gap = 6;
                            const left = Math.min(
                              Math.max(8, rect.right - menuWidth),
                              window.innerWidth - menuWidth - 8,
                            );
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const openUp = spaceBelow < 280;
                            setMenuPos({
                              top: openUp
                                ? undefined
                                : rect.bottom + gap,
                              bottom: openUp
                                ? window.innerHeight - rect.top + gap
                                : undefined,
                              left,
                            });
                            setOpenMenuId(app.id);
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenuId === app.id &&
                          createPortal(
                            <div
                              className={styles.moreMenu}
                              role="menu"
                              style={{
                                top: menuPos.top,
                                bottom: menuPos.bottom,
                                left: menuPos.left,
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleViewMessage(app)}
                              >
                                View message
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleEmailApplicant(app)}
                              >
                                Email applicant
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleCopyEmail(app)}
                              >
                                Copy email
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() =>
                                  handleStatusChange(app.id, "approved")
                                }
                              >
                                Approve request
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() =>
                                  handleStatusChange(app.id, "rejected")
                                }
                              >
                                Reject request
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className={styles.moreMenuDanger}
                                onClick={() => handleRemoveApplication(app)}
                              >
                                Remove request
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className={styles.moreMenuDanger}
                                onClick={() => handleRemovePetListing(app)}
                              >
                                Remove pet listing
                              </button>
                            </div>,
                            document.body,
                          )}
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const kpi = stats?.stats;

  return (
    <>
      <Navbar />
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <div>
              <strong>Admin Panel</strong>
              <span>{displayName(adminUser)}</span>
            </div>
          </div>

          <nav className={styles.sideNav}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.navBtn} ${active ? styles.navBtnActive : ""}`}
                  onClick={() => handleNav(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className={styles.main}>
        {loading ? (
          <div className={styles.stateCard}>
            <div className={styles.loader} />
            <p>Loading admin dashboard...</p>
          </div>
        ) : error ? (
          <div className={styles.stateCard}>
            <p className={styles.errorText}>{error}</p>
            <div className={styles.stateActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => navigate("/profile")}
              >
                Back to Profile
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={loadDashboard}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <header className={styles.topBar}>
              <h1>
                {NAV_ITEMS.find((item) => item.id === section)?.label ||
                  "Dashboard"}
              </h1>
              <div className={styles.topActions}>
                <div className={styles.dateRange}>
                  <span>{dateRangeLabel}</span>
                </div>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleExportReport}
                >
                  <Download size={16} />
                  Export Report
                </button>
              </div>
            </header>

            {actionMessage && <p className={styles.toast}>{actionMessage}</p>}

            {section === "dashboard" && (
              <>
                <section className={styles.kpiGrid}>
                  <article className={styles.kpiCard}>
                    <div className={`${styles.kpiIcon} ${styles.kpiOrange}`}>
                      <PawPrint size={18} />
                    </div>
                    <div>
                      <span>Total Animals</span>
                      <strong>{kpi?.totalPets ?? 0}</strong>
                      <small>{formatDelta(kpi?.deltas?.animals)}</small>
                    </div>
                  </article>
                  <article className={styles.kpiCard}>
                    <div className={`${styles.kpiIcon} ${styles.kpiOrange}`}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <span>Applications</span>
                      <strong>{kpi?.totalApplications ?? 0}</strong>
                      <small>{formatDelta(kpi?.deltas?.applications)}</small>
                    </div>
                  </article>
                  <article className={styles.kpiCard}>
                    <div className={`${styles.kpiIcon} ${styles.kpiRed}`}>
                      <Heart size={18} />
                    </div>
                    <div>
                      <span>Adoptions</span>
                      <strong>{kpi?.totalAdoptions ?? 0}</strong>
                      <small>{formatDelta(kpi?.deltas?.adoptions)}</small>
                    </div>
                  </article>
                  <article className={styles.kpiCard}>
                    <div className={`${styles.kpiIcon} ${styles.kpiOrange}`}>
                      <Users size={18} />
                    </div>
                    <div>
                      <span>Users</span>
                      <strong>{kpi?.totalUsers ?? 0}</strong>
                      <small>{formatDelta(kpi?.deltas?.users)}</small>
                    </div>
                  </article>
                </section>

                <section className={styles.chartsRow}>
                  <article className={styles.panel}>
                    <h2>Adoptions Overview</h2>
                    <LineChart points={stats?.adoptionsOverview || []} />
                  </article>
                  <article className={styles.panel}>
                    <h2>Animals by Status</h2>
                    <div className={styles.donutBlock}>
                      <DonutChart
                        segments={animalSegments}
                        total={animalTotal}
                        centerLabel="Total"
                      />
                      <ul className={styles.legend}>
                        {animalSegments.map((seg) => (
                          <li key={seg.key}>
                            <span
                              className={styles.swatch}
                              style={{ background: seg.color }}
                            />
                            <span>{seg.label}</span>
                            <strong>
                              {seg.value}
                              {animalTotal
                                ? ` (${((seg.value / animalTotal) * 100).toFixed(1)}%)`
                                : ""}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                  <article className={styles.panel}>
                    <h2>Applications by Status</h2>
                    <div className={styles.donutBlock}>
                      <DonutChart
                        segments={applicationSegments}
                        total={applicationTotal}
                        centerLabel="Total"
                      />
                      <ul className={styles.legend}>
                        {applicationSegments.map((seg) => (
                          <li key={seg.key}>
                            <span
                              className={styles.swatch}
                              style={{ background: seg.color }}
                            />
                            <span>{seg.label}</span>
                            <strong>
                              {seg.value}
                              {applicationTotal
                                ? ` (${((seg.value / applicationTotal) * 100).toFixed(1)}%)`
                                : ""}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </section>

                <section className={styles.bottomRow}>
                  <article className={styles.panel}>
                    <div className={styles.panelHeader}>
                      <h2>Recent Applications</h2>
                    </div>
                    {renderApplicationsTable(stats?.recentApplications || [], {
                      showActions: true,
                      limit: 6,
                    })}
                    <button
                      type="button"
                      className={styles.viewAllBtn}
                      onClick={() => setSection("applications")}
                    >
                      View All Applications
                    </button>
                  </article>

                  <article className={styles.panel}>
                    <h2>Quick Actions</h2>
                    <div className={styles.quickActions}>
                      <button
                        type="button"
                        className={styles.quickBtn}
                        onClick={() => setSection("users")}
                      >
                        <Users size={16} />
                        View All Users
                      </button>
                      <button
                        type="button"
                        className={styles.quickBtn}
                        onClick={() => setSection("animals")}
                      >
                        <PawPrint size={16} />
                        View All Animals
                      </button>
                      <button
                        type="button"
                        className={styles.quickBtn}
                        onClick={() => setSection("applications")}
                      >
                        <FileText size={16} />
                        View All Applications
                      </button>
                      <button
                        type="button"
                        className={styles.quickBtn}
                        onClick={() => setSection("comments")}
                      >
                        <MessageSquare size={16} />
                        View All Comments
                      </button>
                    </div>
                  </article>
                </section>
              </>
            )}

            {section === "animals" && (
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>
                    All Animals ({filteredPets.length}
                    {filteredPets.length !== pets.length
                      ? ` of ${pets.length}`
                      : ""}
                    )
                  </h2>
                </div>
                <div className={styles.filterBar}>
                  <label className={styles.filterField}>
                    <span>Type</span>
                    <select
                      value={animalTypeFilter}
                      onChange={(e) => setAnimalTypeFilter(e.target.value)}
                    >
                      {animalTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type === "all" ? "All types" : capitalizeFirst(type)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.filterField}>
                    <span>Status</span>
                    <select
                      value={animalStatusFilter}
                      onChange={(e) => setAnimalStatusFilter(e.target.value)}
                    >
                      <option value="all">All statuses</option>
                      <option value="available">Available</option>
                      <option value="adopted">Adopted</option>
                    </select>
                  </label>
                </div>
                {!pets.length ? (
                  <p className={styles.empty}>No animals listed yet.</p>
                ) : !filteredPets.length ? (
                  <p className={styles.empty}>
                    No animals match these filters.
                  </p>
                ) : (
                  <div className={styles.cardsGrid}>
                    {filteredPets.map((pet) => (
                      <div key={pet.id} className={styles.entityCard}>
                        <button
                          type="button"
                          className={styles.entityCardMain}
                          onClick={() => navigate(`/adopt/${pet.id}`)}
                        >
                          {petThumb(pet) ? (
                            <img src={petThumb(pet)} alt={pet.name} />
                          ) : (
                            <div className={styles.entityPlaceholder}>
                              <PawPrint size={28} />
                            </div>
                          )}
                          <div>
                            <strong>{pet.name}</strong>
                            <span>
                              {pet.breed} · {capitalizeFirst(pet.type)}
                            </span>
                            <span>Posted by {ownerDisplayName(pet)}</span>
                            <em
                              className={`${styles.badge} ${statusBadgeClass(pet.status)}`}
                            >
                              {pet.status}
                            </em>
                          </div>
                        </button>
                        <div className={styles.entityCardActions}>
                          <button
                            type="button"
                            className={styles.dangerBtn}
                            disabled={updatingId === `pet-${pet.id}`}
                            onClick={() => handleRemoveAnimal(pet)}
                          >
                            <Trash2 size={14} />
                            {updatingId === `pet-${pet.id}`
                              ? "Removing…"
                              : "Remove"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {section === "applications" && (
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>
                    Applications ({filteredApplications.length}
                    {filteredApplications.length !== allApplications.length
                      ? ` of ${allApplications.length}`
                      : ""}
                    )
                  </h2>
                </div>
                <div className={styles.filterBar}>
                  <label className={styles.filterField}>
                    <span>Date</span>
                    <select
                      value={appDatePreset}
                      onChange={(e) => setAppDatePreset(e.target.value)}
                    >
                      {DATE_PRESET_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {appDatePreset === "custom" ? (
                    <>
                      <label className={styles.filterField}>
                        <span>From</span>
                        <input
                          type="date"
                          value={appDateFrom}
                          onChange={(e) => setAppDateFrom(e.target.value)}
                        />
                      </label>
                      <label className={styles.filterField}>
                        <span>To</span>
                        <input
                          type="date"
                          value={appDateTo}
                          onChange={(e) => setAppDateTo(e.target.value)}
                        />
                      </label>
                    </>
                  ) : null}
                </div>
                {renderApplicationsTable(filteredApplications, {
                  showActions: true,
                  emptyText: allApplications.length
                    ? "No applications match this date filter."
                    : "No applications yet.",
                })}
              </section>
            )}

            {section === "comments" && (
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>
                    Comments ({filteredComments.length}
                    {filteredComments.length !== allComments.length
                      ? ` of ${allComments.length}`
                      : ""}
                    )
                  </h2>
                </div>
                <div className={styles.filterBar}>
                  <label className={`${styles.filterField} ${styles.filterGrow}`}>
                    <span>Search</span>
                    <input
                      type="search"
                      placeholder="Author, listing, or comment text"
                      value={commentSearch}
                      onChange={(e) => setCommentSearch(e.target.value)}
                    />
                  </label>
                  <label className={styles.filterField}>
                    <span>Date</span>
                    <select
                      value={commentDatePreset}
                      onChange={(e) => setCommentDatePreset(e.target.value)}
                    >
                      {DATE_PRESET_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {commentDatePreset === "custom" ? (
                    <>
                      <label className={styles.filterField}>
                        <span>From</span>
                        <input
                          type="date"
                          value={commentDateFrom}
                          onChange={(e) => setCommentDateFrom(e.target.value)}
                        />
                      </label>
                      <label className={styles.filterField}>
                        <span>To</span>
                        <input
                          type="date"
                          value={commentDateTo}
                          onChange={(e) => setCommentDateTo(e.target.value)}
                        />
                      </label>
                    </>
                  ) : null}
                </div>
                {!allComments.length ? (
                  <p className={styles.empty}>No comments on listings yet.</p>
                ) : !filteredComments.length ? (
                  <p className={styles.empty}>No comments match these filters.</p>
                ) : (
                  <div className={styles.tableScroll}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Listing</th>
                          <th>Author</th>
                          <th>Comment</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComments.map((comment) => {
                          const thumb = petThumb({
                            image: comment.petImage,
                            images: comment.petImages,
                          });
                          const author = displayName(comment);
                          const busy = updatingId === `comment-${comment.id}`;
                          return (
                            <tr key={comment.id}>
                              <td>
                                <button
                                  type="button"
                                  className={styles.personCellBtn}
                                  onClick={() =>
                                    comment.petId
                                      ? navigate(`/adopt/${comment.petId}`)
                                      : null
                                  }
                                  disabled={!comment.petId}
                                >
                                  {thumb ? (
                                    <img
                                      src={thumb}
                                      alt=""
                                      className={styles.avatar}
                                    />
                                  ) : (
                                    <div className={styles.avatarFallback}>
                                      <PawPrint size={14} />
                                    </div>
                                  )}
                                  <div>
                                    <strong>
                                      {comment.petName || "Deleted listing"}
                                    </strong>
                                    <span>
                                      {capitalizeFirst(comment.petType) ||
                                        comment.petBreed ||
                                        "Pet"}
                                    </span>
                                  </div>
                                </button>
                              </td>
                              <td>
                                <div className={styles.personCell}>
                                  {comment.avatar ? (
                                    <img
                                      src={comment.avatar}
                                      alt=""
                                      className={styles.avatar}
                                    />
                                  ) : (
                                    <div className={styles.avatarFallback}>
                                      {author.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <strong>{author}</strong>
                                    <span>
                                      {comment.email ||
                                        `@${comment.username || "user"}`}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className={styles.commentCell}>
                                {comment.text}
                              </td>
                              <td>
                                {comment.createdAt
                                  ? new Date(
                                      comment.createdAt,
                                    ).toLocaleString()
                                  : "—"}
                              </td>
                              <td>
                                <div className={styles.rowActions}>
                                  {comment.petId ? (
                                    <button
                                      type="button"
                                      className={styles.iconBtn}
                                      title="View listing"
                                      onClick={() =>
                                        navigate(`/adopt/${comment.petId}`)
                                      }
                                    >
                                      <Eye size={16} />
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    className={styles.dangerIconBtn}
                                    title="Remove comment"
                                    disabled={busy}
                                    onClick={() =>
                                      handleRemoveComment(comment)
                                    }
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {section === "reports" && (
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>
                    Reports ({filteredReports.length}
                    {filteredReports.length !== allReports.length
                      ? ` of ${allReports.length}`
                      : ""}
                    )
                  </h2>
                </div>
                <div className={styles.filterBar}>
                  <label className={styles.filterField}>
                    <span>Type</span>
                    <select
                      value={reportTypeFilter}
                      onChange={(e) => setReportTypeFilter(e.target.value)}
                    >
                      <option value="all">All types</option>
                      <option value="listing">Listing</option>
                      <option value="comment">Comment</option>
                      <option value="user">Messaging user</option>
                      <option value="bug">Bug</option>
                    </select>
                  </label>
                  <label className={styles.filterField}>
                    <span>Reason</span>
                    <select
                      value={reportReasonFilter}
                      onChange={(e) => setReportReasonFilter(e.target.value)}
                    >
                      {reportReasonOptions.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason === "all" ? "All reasons" : reason}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.filterField}>
                    <span>Date</span>
                    <select
                      value={reportDatePreset}
                      onChange={(e) => setReportDatePreset(e.target.value)}
                    >
                      {DATE_PRESET_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {reportDatePreset === "custom" ? (
                    <>
                      <label className={styles.filterField}>
                        <span>From</span>
                        <input
                          type="date"
                          value={reportDateFrom}
                          onChange={(e) => setReportDateFrom(e.target.value)}
                        />
                      </label>
                      <label className={styles.filterField}>
                        <span>To</span>
                        <input
                          type="date"
                          value={reportDateTo}
                          onChange={(e) => setReportDateTo(e.target.value)}
                        />
                      </label>
                    </>
                  ) : null}
                </div>
                {!allReports.length ? (
                  <p className={styles.empty}>No reports yet.</p>
                ) : !filteredReports.length ? (
                  <p className={styles.empty}>No reports match these filters.</p>
                ) : (
                  <div className={styles.tableScroll}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Content</th>
                          <th>Reporter</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map((report) => {
                          const busy = updatingId === `report-${report.id}`;
                          const menuId = `report-${report.id}`;
                          const status = String(
                            report.status || "pending",
                          ).toLowerCase();
                          const reportType = String(
                            report.targetType || "",
                          ).toLowerCase();
                          const isComment = reportType === "comment";
                          const isBug = reportType === "bug";
                          const isUserReport = reportType === "user";
                          const preview =
                            report.targetPreview ||
                            (isBug
                              ? "Site bug"
                              : isUserReport
                                ? `User #${report.targetId}`
                                : `#${report.targetId}`);
                          const subtitle = isBug
                            ? report.reason || "Bug report"
                            : isUserReport
                              ? report.description ||
                                "Reported for bad messaging"
                              : report.description
                                ? report.description
                                : isComment
                                  ? "Reported comment"
                                  : "Reported listing";
                          const reportedUser = allUsers.find(
                            (u) =>
                              Number(u.id) === Number(report.targetOwnerId),
                          );
                          return (
                            <tr key={report.id}>
                              <td>
                                <span
                                  className={`${styles.badge} ${styles.badgeGray}`}
                                >
                                  {isBug
                                    ? "Bug"
                                    : isUserReport
                                      ? "User"
                                      : isComment
                                        ? "Comment"
                                        : "Listing"}
                                </span>
                              </td>
                              <td>
                                <div
                                  className={styles.reportContent}
                                  title={
                                    report.description
                                      ? `${preview}\n${report.description}`
                                      : preview
                                  }
                                >
                                  <strong>{preview}</strong>
                                  <span>{subtitle}</span>
                                </div>
                              </td>
                              <td>
                                <div className={styles.personCell}>
                                  <div>
                                    <strong>
                                      {displayName({
                                        firstName: report.reporterFirstName,
                                        lastName: report.reporterLastName,
                                        username: report.reporterUsername,
                                      })}
                                    </strong>
                                    <span>
                                      @
                                      {report.reporterUsername ||
                                        report.reporterEmail ||
                                        "user"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>{report.reason}</td>
                              <td>
                                <span
                                  className={`${styles.badge} ${
                                    status === "pending"
                                      ? styles.badgeYellow
                                      : status === "dismissed"
                                        ? styles.badgeGray
                                        : styles.badgeGreen
                                  }`}
                                >
                                  {status}
                                </span>
                              </td>
                              <td>
                                <div className={styles.rowActions}>
                                  {report.relatedPetId ? (
                                    <button
                                      type="button"
                                      className={styles.iconBtn}
                                      title="View related listing"
                                      onClick={() =>
                                        navigate(
                                          `/adopt/${report.relatedPetId}`,
                                        )
                                      }
                                    >
                                      <Eye size={16} />
                                    </button>
                                  ) : null}
                                  {report.screenshot ? (
                                    <button
                                      type="button"
                                      className={styles.iconBtn}
                                      title="View screenshot"
                                      onClick={() =>
                                        setReportScreenshot(report.screenshot)
                                      }
                                    >
                                      <ImageIcon size={16} />
                                    </button>
                                  ) : null}
                                  {isUserReport ? (
                                    <button
                                      type="button"
                                      className={styles.iconBtn}
                                      title="View chat history"
                                      onClick={() =>
                                        handleOpenReportChat(report)
                                      }
                                    >
                                      <MessageSquare size={16} />
                                    </button>
                                  ) : null}
                                  <div className={styles.moreWrap}>
                                    <button
                                      type="button"
                                      className={styles.moreBtn}
                                      title="More"
                                      aria-expanded={openMenuId === menuId}
                                      aria-haspopup="menu"
                                      disabled={busy}
                                      onClick={(e) =>
                                        openMoreMenuAt(e, menuId)
                                      }
                                    >
                                      <MoreHorizontal size={16} />
                                    </button>
                                    {openMenuId === menuId &&
                                      createPortal(
                                        <div
                                          className={styles.moreMenu}
                                          role="menu"
                                          style={{
                                            top: menuPos.top,
                                            bottom: menuPos.bottom,
                                            left: menuPos.left,
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {isUserReport ? (
                                            <button
                                              type="button"
                                              role="menuitem"
                                              onClick={() =>
                                                handleOpenReportChat(report)
                                              }
                                            >
                                              View chat history
                                            </button>
                                          ) : null}
                                          {report.screenshot ? (
                                            <button
                                              type="button"
                                              role="menuitem"
                                              onClick={() => {
                                                closeMoreMenu();
                                                setReportScreenshot(
                                                  report.screenshot,
                                                );
                                              }}
                                            >
                                              View screenshot
                                            </button>
                                          ) : null}
                                          {report.relatedPetId ? (
                                            <button
                                              type="button"
                                              role="menuitem"
                                              onClick={() => {
                                                closeMoreMenu();
                                                navigate(
                                                  `/adopt/${report.relatedPetId}`,
                                                );
                                              }}
                                            >
                                              View listing
                                            </button>
                                          ) : null}
                                          {status !== "reviewed" ? (
                                            <button
                                              type="button"
                                              role="menuitem"
                                              onClick={() =>
                                                handleUpdateReportStatus(
                                                  report,
                                                  "reviewed",
                                                )
                                              }
                                            >
                                              Mark reviewed
                                            </button>
                                          ) : null}
                                          {status !== "dismissed" ? (
                                            <button
                                              type="button"
                                              role="menuitem"
                                              className={styles.moreMenuDanger}
                                              onClick={() =>
                                                handleUpdateReportStatus(
                                                  report,
                                                  "dismissed",
                                                )
                                              }
                                            >
                                              Dismiss report
                                            </button>
                                          ) : null}
                                          {status !== "pending" ? (
                                            <button
                                              type="button"
                                              role="menuitem"
                                              onClick={() =>
                                                handleUpdateReportStatus(
                                                  report,
                                                  "pending",
                                                )
                                              }
                                            >
                                              Reopen as pending
                                            </button>
                                          ) : null}
                                          <button
                                            type="button"
                                            role="menuitem"
                                            className={styles.moreMenuDanger}
                                            onClick={() =>
                                              handleDeleteReport(report)
                                            }
                                          >
                                            Delete report
                                          </button>
                                          {reportedUser &&
                                          !reportedUser.isBanned ? (
                                            <button
                                              type="button"
                                              role="menuitem"
                                              onClick={() => {
                                                closeMoreMenu();
                                                openWarnModal(reportedUser);
                                              }}
                                            >
                                              Warn reported user
                                            </button>
                                          ) : null}
                                          {reportedUser ? (
                                            <button
                                              type="button"
                                              role="menuitem"
                                              className={styles.moreMenuDanger}
                                              onClick={() => {
                                                closeMoreMenu();
                                                if (reportedUser.isBanned) {
                                                  handleUnbanUser(reportedUser);
                                                } else {
                                                  openBanModal(reportedUser);
                                                }
                                              }}
                                            >
                                              {reportedUser.isBanned
                                                ? "Unban reported user"
                                                : "Ban reported user"}
                                            </button>
                                          ) : null}
                                        </div>,
                                        document.body,
                                      )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {section === "users" && (
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>
                    Users ({filteredUsers.length}
                    {filteredUsers.length !== allUsers.length
                      ? ` of ${allUsers.length}`
                      : ""}
                    )
                  </h2>
                </div>
                <div className={styles.filterBar}>
                  <label className={styles.filterField}>
                    <span>Joined</span>
                    <select
                      value={userDatePreset}
                      onChange={(e) => setUserDatePreset(e.target.value)}
                    >
                      {DATE_PRESET_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {userDatePreset === "custom" ? (
                    <>
                      <label className={styles.filterField}>
                        <span>From</span>
                        <input
                          type="date"
                          value={userDateFrom}
                          onChange={(e) => setUserDateFrom(e.target.value)}
                        />
                      </label>
                      <label className={styles.filterField}>
                        <span>To</span>
                        <input
                          type="date"
                          value={userDateTo}
                          onChange={(e) => setUserDateTo(e.target.value)}
                        />
                      </label>
                    </>
                  ) : null}
                </div>
                {!allUsers.length ? (
                  <p className={styles.empty}>No users found.</p>
                ) : !filteredUsers.length ? (
                  <p className={styles.empty}>No users match this date filter.</p>
                ) : (
                  <div className={styles.tableScroll}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => {
                          const isAdminUser =
                            String(user.role || "").toLowerCase() === "admin";
                          const isSelf =
                            adminUser?.id != null &&
                            Number(adminUser.id) === Number(user.id);
                          const busy = updatingId === `user-${user.id}`;
                          return (
                            <tr key={user.id}>
                              <td>
                                <div className={styles.personCell}>
                                  {user.profile_picture ? (
                                    <img
                                      src={user.profile_picture}
                                      alt=""
                                      className={styles.avatar}
                                    />
                                  ) : (
                                    <div className={styles.avatarFallback}>
                                      {displayName(user)
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <strong>{displayName(user)}</strong>
                                    <span>@{user.username}</span>
                                  </div>
                                </div>
                              </td>
                              <td>{user.email}</td>
                              <td>
                                <span
                                  className={`${styles.badge} ${styles.badgeGray}`}
                                >
                                  {user.role}
                                </span>
                              </td>
                              <td>
                                <div className={styles.statusStack}>
                                  <span
                                    className={`${styles.badge} ${
                                      user.isBanned
                                        ? styles.badgeRed
                                        : styles.badgeGreen
                                    }`}
                                  >
                                    {user.isBanned ? "Banned" : "Active"}
                                  </span>
                                  {user.isBanned && user.banReason ? (
                                    <span
                                      className={styles.banReasonHint}
                                      title={user.banDescription || ""}
                                    >
                                      {user.banReason}
                                    </span>
                                  ) : null}
                                  {!user.isBanned &&
                                  Number(user.warningCount || 0) > 0 ? (
                                    <span className={styles.banReasonHint}>
                                      {user.warningCount} warning
                                      {Number(user.warningCount) === 1
                                        ? ""
                                        : "s"}
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              <td>
                                {user.createdAt
                                  ? new Date(
                                      user.createdAt,
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td>
                                {isAdminUser || isSelf ? (
                                  <span className={styles.mutedAction}>—</span>
                                ) : (
                                  <div className={styles.rowActions}>
                                    {!user.isBanned ? (
                                      <button
                                        type="button"
                                        className={styles.iconBtn}
                                        title="Send warning before ban"
                                        disabled={busy}
                                        onClick={() => openWarnModal(user)}
                                      >
                                        <AlertTriangle size={16} />
                                        <span>Warn</span>
                                      </button>
                                    ) : null}
                                    <button
                                      type="button"
                                      className={
                                        user.isBanned
                                          ? styles.iconBtn
                                          : styles.dangerIconBtn
                                      }
                                      title={
                                        user.isBanned
                                          ? "Unban account"
                                          : "Ban account"
                                      }
                                      disabled={busy}
                                      onClick={() =>
                                        user.isBanned
                                          ? handleUnbanUser(user)
                                          : openBanModal(user)
                                      }
                                    >
                                      <Ban size={16} />
                                      <span>
                                        {busy
                                          ? "Saving..."
                                          : user.isBanned
                                            ? "Unban"
                                            : "Ban"}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

          </>
        )}
        </main>
      </div>
      <Footer />

      {reportScreenshot &&
        createPortal(
          <div
            className={styles.messageOverlay}
            onClick={() => setReportScreenshot(null)}
            role="presentation"
          >
            <div
              className={styles.screenshotModal}
              role="dialog"
              aria-modal="true"
              aria-label="Bug screenshot"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.messageClose}
                onClick={() => setReportScreenshot(null)}
                aria-label="Close"
              >
                ×
              </button>
              <p className={styles.messageEyebrow}>Bug report</p>
              <h2 className={styles.messageTitle}>Screenshot</h2>
              <img
                src={reportScreenshot}
                alt="Reported bug screenshot"
                className={styles.screenshotImage}
              />
            </div>
          </div>,
          document.body,
        )}

      {(reportChat || reportChatLoading) &&
        createPortal(
          <div
            className={styles.messageOverlay}
            onClick={() => {
              if (!reportChatLoading) {
                setReportChat(null);
                setReportChatError("");
              }
            }}
            role="presentation"
          >
            <div
              className={styles.chatHistoryModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-chat-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.messageClose}
                onClick={() => {
                  setReportChat(null);
                  setReportChatError("");
                }}
                aria-label="Close"
              >
                ×
              </button>
              <p className={styles.messageEyebrow}>Messaging report</p>
              <h2 id="report-chat-title" className={styles.messageTitle}>
                Chat history
              </h2>
              {reportChatLoading ? (
                <p className={styles.chatHistoryHint}>Loading conversation…</p>
              ) : reportChatError ? (
                <p className={styles.chatHistoryError}>{reportChatError}</p>
              ) : (
                <>
                  <p className={styles.chatHistoryMeta}>
                    <strong>
                      {reportChat?.thread?.petName || "Pet listing"}
                    </strong>
                    {" · "}
                    {reportChat?.report?.reason || "Report"}
                    {reportChat?.report?.description
                      ? ` — ${reportChat.report.description}`
                      : ""}
                  </p>
                  <div className={styles.chatHistoryScroll}>
                    {!reportChat?.messages?.length ? (
                      <p className={styles.chatHistoryHint}>
                        No messages in this conversation.
                      </p>
                    ) : (
                      reportChat.messages.map((msg) => {
                        const reportedId = Number(
                          reportChat?.report?.reportedUserId,
                        );
                        const isReported =
                          Number(msg.senderId) === reportedId;
                        const sender =
                          `${msg.senderFirstName || ""} ${msg.senderLastName || ""}`.trim() ||
                          msg.senderUsername ||
                          `User #${msg.senderId}`;
                        return (
                          <div
                            key={msg.id}
                            className={`${styles.chatHistoryBubble} ${
                              isReported
                                ? styles.chatHistoryBubbleReported
                                : styles.chatHistoryBubbleOther
                            }`}
                          >
                            <div className={styles.chatHistoryBubbleTop}>
                              <strong>{sender}</strong>
                              {isReported ? (
                                <span className={styles.chatHistoryTag}>
                                  Reported user
                                </span>
                              ) : null}
                              <span>
                                {msg.createdAt
                                  ? new Date(msg.createdAt).toLocaleString()
                                  : ""}
                              </span>
                            </div>
                            <p>{msg.body}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}

      {messageModal &&
        createPortal(
          <div
            className={styles.messageOverlay}
            onClick={closeMessageModal}
            role="presentation"
          >
            <div
              className={styles.messageModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-message-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.messageClose}
                onClick={closeMessageModal}
                aria-label="Close"
              >
                ×
              </button>
              <p className={styles.messageEyebrow}>Adoption request</p>
              <h2 id="admin-message-title" className={styles.messageTitle}>
                {messageModal.fullName || "Applicant"}
              </h2>
              <p className={styles.messageSubtitle}>
                wants to adopt{" "}
                <strong>{messageModal.petName || "this pet"}</strong>
              </p>

              <div className={styles.messageMetaGrid}>
                <div>
                  <span>Email</span>
                  <strong>{messageModal.email || "—"}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{messageModal.phone || "—"}</strong>
                </div>
                <div>
                  <span>Posted by</span>
                  <strong>{ownerDisplayName(messageModal)}</strong>
                </div>
                <div>
                  <span>Date</span>
                  <strong>
                    {messageModal.createdAt
                      ? new Date(messageModal.createdAt).toLocaleString()
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className={styles.messageBodyBox}>
                <span>Message</span>
                <p>{messageModal.message || "No message provided."}</p>
              </div>

              <div className={styles.messageFooter}>
                {messageModal.petId ? (
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => {
                      closeMessageModal();
                      navigate(`/adopt/${messageModal.petId}`);
                    }}
                  >
                    View pet
                  </button>
                ) : null}
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={closeMessageModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {banModal &&
        createPortal(
          <div
            className={styles.messageOverlay}
            onClick={closeBanModal}
            role="presentation"
          >
            <div
              className={styles.messageModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-ban-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.messageClose}
                onClick={closeBanModal}
                aria-label="Close"
                disabled={updatingId === `user-${banModal.id}`}
              >
                ×
              </button>
              <p className={styles.messageEyebrow}>Ban account</p>
              <h2 id="admin-ban-title" className={styles.messageTitle}>
                @{banModal.username || displayName(banModal)}
              </h2>
              <p className={styles.messageSubtitle}>
                Choose a reason and add details. They will not be able to sign
                in.
              </p>

              <label className={styles.banField}>
                <span>Reason</span>
                <select
                  value={banReason}
                  onChange={(e) => {
                    setBanReason(e.target.value);
                    setBanError("");
                  }}
                  disabled={updatingId === `user-${banModal.id}`}
                >
                  {BAN_REASON_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.banField}>
                <span>Description</span>
                <textarea
                  rows={4}
                  placeholder="Describe why this account is being banned..."
                  value={banDescription}
                  onChange={(e) => {
                    setBanDescription(e.target.value);
                    setBanError("");
                  }}
                  disabled={updatingId === `user-${banModal.id}`}
                />
              </label>

              {banError ? (
                <p className={styles.banError}>{banError}</p>
              ) : null}

              <div className={styles.messageFooter}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={closeBanModal}
                  disabled={updatingId === `user-${banModal.id}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={handleConfirmBanUser}
                  disabled={updatingId === `user-${banModal.id}`}
                >
                  {updatingId === `user-${banModal.id}`
                    ? "Banning..."
                    : "Ban account"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {warnModal &&
        createPortal(
          <div
            className={styles.messageOverlay}
            onClick={closeWarnModal}
            role="presentation"
          >
            <div
              className={styles.messageModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-warn-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.messageClose}
                onClick={closeWarnModal}
                aria-label="Close"
                disabled={updatingId === `warn-${warnModal.id}`}
              >
                ×
              </button>
              <p className={styles.messageEyebrow}>Warning before ban</p>
              <h2 id="admin-warn-title" className={styles.messageTitle}>
                @{warnModal.username || displayName(warnModal)}
              </h2>
              <p className={styles.messageSubtitle}>
                Send a critical warning before a ban. They&apos;ll see it in
                Notifications.
              </p>

              <label className={styles.banField}>
                <span>Reason</span>
                <select
                  value={warnReason}
                  onChange={(e) => {
                    setWarnReason(e.target.value);
                    setWarnError("");
                  }}
                  disabled={updatingId === `warn-${warnModal.id}`}
                >
                  {WARNING_REASON_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.banField}>
                <span>Message</span>
                <textarea
                  rows={4}
                  placeholder="Explain what needs to change..."
                  value={warnMessage}
                  onChange={(e) => {
                    setWarnMessage(e.target.value);
                    setWarnError("");
                  }}
                  disabled={updatingId === `warn-${warnModal.id}`}
                />
              </label>

              {warnError ? (
                <p className={styles.banError}>{warnError}</p>
              ) : null}

              <div className={styles.messageFooter}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={closeWarnModal}
                  disabled={updatingId === `warn-${warnModal.id}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleConfirmWarnUser}
                  disabled={updatingId === `warn-${warnModal.id}`}
                >
                  {updatingId === `warn-${warnModal.id}`
                    ? "Sending..."
                    : "Send warning"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default AdminDashboard;
