/**
 * =============================================================================
 * FILE: client/src/pages/Profile.jsx
 * ROLE: User hub — profile, listings, favorites, requests, notifications, settings
 * =============================================================================
 * Sections: LOAD DATA | NOTIFICATIONS | REQUESTS | LISTINGS
 *           PROFILE EDIT | EMAIL / PASSWORD | AVATAR | RENDER TABS
 * =============================================================================
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/profile.module.css";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import {
  changeEmail,
  changePassword,
  deleteAccount,
  getProfile,
  updateNotificationSettings,
  updateProfile,
  updateProfilePicture,
} from "../services/authService";
import { deletePet, getPets } from "../services/userService";
import {
  getIncomingApplications,
  getMyApplications,
  updateIncomingApplicationStatus,
} from "../services/applicationService";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import FavoritedPets from "../Components/profile/FavoritedPets";
import NotificationTypeIcon from "../Components/features/NotificationTypeIcon";
import { notifyAuthTokenChanged } from "../utils/authEvents";

const getFriendlyRole = (role) => {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "admin") return "Administrator";
  if (
    normalizedRole === "association" ||
    normalizedRole === "adoption_center" ||
    normalizedRole === "adoption-center"
  ) {
    return "Adoption Center / Association";
  }
  return "Paw Seeker";
};

/** Main profile container with tabbed content and async form actions. */
const Profile = () => {
  const [user, setUser] = useState(null);
  const [myPets, setMyPets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myRequestsLoading, setMyRequestsLoading] = useState(false);
  const [myRequestsError, setMyRequestsError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState("");
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [requestActionMessage, setRequestActionMessage] = useState("");
  const [removeListingPrompt, setRemoveListingPrompt] = useState(null);
  const [isRemovingListing, setIsRemovingListing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    currentPassword: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    notifyNewPets: true,
    notifyApplicationUpdates: true,
  });
  const [deleteForm, setDeleteForm] = useState({
    currentPassword: "",
    confirmationText: "",
  });
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    birthday: "",
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  /** Load user profile + owned pets in parallel for initial render. */
  // ======================== LOAD DATA ========================
  const loadProfile = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [profileRes, petsRes] = await Promise.all([getProfile(), getPets()]);
      const profileUser = profileRes.data.user;

      setUser(profileUser);
      setProfileForm({
        firstName: profileUser?.firstName || profileUser?.firstname || "",
        lastName: profileUser?.lastName || profileUser?.lastname || "",
        phone: profileUser?.phone || "",
        gender: profileUser?.gender || "",
        birthday: profileUser?.birthday || "",
      });
      setNotificationForm({
        notifyNewPets: Boolean(profileUser?.notify_new_pets ?? true),
        notifyApplicationUpdates: Boolean(
          profileUser?.notify_application_updates ?? true,
        ),
      });
      setMyPets(
        petsRes.data.filter(
          (pet) => Number(pet.ownerId) === Number(profileUser.id),
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInbox = async () => {
    setInboxLoading(true);
    setInboxError("");
    try {
      const [notifRes, requestsRes, unreadRes] = await Promise.all([
        getNotifications(),
        getIncomingApplications(),
        getUnreadNotificationCount(),
      ]);
      setNotifications(notifRes.data || []);
      setIncomingRequests(requestsRes.data || []);
      setUnreadCount(Number(unreadRes.data?.count || 0));
    } catch (err) {
      setInboxError(
        err.response?.data?.message || "Could not load notifications.",
      );
    } finally {
      setInboxLoading(false);
    }
  };

  const loadMyRequests = async () => {
    setMyRequestsLoading(true);
    setMyRequestsError("");
    try {
      const res = await getMyApplications();
      setMyRequests(res.data || []);
    } catch (err) {
      setMyRequestsError(
        err.response?.data?.message || "Could not load your adoption requests.",
      );
    } finally {
      setMyRequestsLoading(false);
    }
  };

  const formatRequestStatus = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "pending") return "Under Review";
    if (value === "approved") return "Approved";
    if (value === "rejected") return "Rejected";
    if (value === "cancelled") return "Cancelled";
    return status || "Unknown";
  };

  const ownerLabel = (req) => {
    const first = req?.ownerFirstName || "";
    const last = req?.ownerLastName || "";
    const full = `${first} ${last}`.trim();
    return full || req?.ownerUsername || req?.ownerEmail || "";
  };

  useEffect(() => {
    loadProfile();
    getUnreadNotificationCount()
      .then((res) => setUnreadCount(Number(res.data?.count || 0)))
      .catch(() => {});
    getMyApplications()
      .then((res) => setMyRequests(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab === "settings") {
      setActiveTab("settings");
    }
    if (tab === "notifications") {
      setActiveTab("notifications");
    }
    if (tab === "requests") {
      setActiveTab("requests");
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab === "notifications") {
      loadInbox();
    }
    if (activeTab === "requests") {
      loadMyRequests();
    }
  }, [activeTab]);

  // ======================== NOTIFICATIONS ========================
  const handleMarkNotificationRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: 1 } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* keep list as-is if mark-read fails */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: 1 })),
      );
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  // ======================== ADOPTION REQUESTS ========================
  const handleIncomingStatus = async (req, status) => {
    setUpdatingRequestId(req.id);
    setRequestActionMessage("");
    try {
      await updateIncomingApplicationStatus(req.id, status);
      setIncomingRequests((prev) =>
        prev.map((item) =>
          item.id === req.id ? { ...item, status } : item,
        ),
      );
      setRequestActionMessage(
        status === "approved"
          ? `Approved ${req.fullName}'s request for ${req.petName}.`
          : status === "rejected"
            ? `Rejected ${req.fullName}'s request for ${req.petName}.`
            : "Request updated.",
      );
      // Refresh unread count after related notifications are marked read.
      const unreadRes = await getUnreadNotificationCount();
      setUnreadCount(Number(unreadRes.data?.count || 0));
      const notifRes = await getNotifications();
      setNotifications(notifRes.data || []);

      if (status === "approved" && req.petId) {
        setRemoveListingPrompt({
          petId: req.petId,
          petName: req.petName || "this pet",
          applicantName: req.fullName || "the applicant",
        });
      }
    } catch (err) {
      setRequestActionMessage(
        err.response?.data?.message || "Could not update this request.",
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  // ======================== REMOVE LISTING ========================
  const handleConfirmRemoveListing = async () => {
    if (!removeListingPrompt?.petId) return;
    setIsRemovingListing(true);
    try {
      await deletePet(removeListingPrompt.petId);
      setIncomingRequests((prev) =>
        prev.filter(
          (item) => Number(item.petId) !== Number(removeListingPrompt.petId),
        ),
      );
      setMyPets((prev) =>
        prev.filter(
          (pet) => Number(pet.id) !== Number(removeListingPrompt.petId),
        ),
      );
      setRequestActionMessage(
        `Removed the listing for ${removeListingPrompt.petName}.`,
      );
      setRemoveListingPrompt(null);
    } catch (err) {
      setRequestActionMessage(
        err.response?.data?.message || "Could not remove the listing.",
      );
    } finally {
      setIsRemovingListing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    notifyAuthTokenChanged();
    navigate("/login");
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "Unknown";
  const firstName = user?.firstName || user?.firstname || "";
  const lastName = user?.lastName || user?.lastname || "";
  const normalizedUserRole = String(user?.role || "").toLowerCase();
  const friendlyRole = getFriendlyRole(normalizedUserRole);

  const handleEditInput = (field) => (e) => {
    setProfileForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  /** Switch profile card to editable mode. */
  const startEditing = () => {
    setIsEditing(true);
    setSaveMessage("");
    setSaveError("");
  };

  /** Revert profile edits back to current persisted user values. */
  const cancelEditing = () => {
    setIsEditing(false);
    setSaveMessage("");
    setSaveError("");
    setProfileForm({
      firstName,
      lastName,
      phone: user?.phone || "",
      gender: user?.gender || "",
      birthday: user?.birthday || "",
    });
  };

  /** Persist profile details and refresh JWT/user snapshot. */
  // ======================== PROFILE EDIT ========================
  const handleSaveProfile = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setSaveError("First name and last name are required.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveMessage("");

    try {
      const res = await updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        gender: profileForm.gender,
        birthday: profileForm.birthday,
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        notifyAuthTokenChanged();
      }
      setUser(res.data.user);
      setIsEditing(false);
      setSaveMessage("Profile updated successfully.");
    } catch (err) {
      setSaveError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailInput = (field) => (e) => {
    setEmailForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePasswordInput = (field) => (e) => {
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleNotificationToggle = (field) => (e) => {
    setNotificationForm((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const handleDeleteInput = (field) => (e) => {
    setDeleteForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  /** Persist email change (requires current password). */
  // ======================== EMAIL / PASSWORD / SETTINGS ========================
  const handleChangeEmail = async () => {
    if (!emailForm.newEmail.trim() || !emailForm.currentPassword) {
      setSettingsError("New email and current password are required.");
      setSettingsSuccess("");
      return;
    }

    setIsUpdatingEmail(true);
    setSettingsError("");
    setSettingsSuccess("");

    try {
      const res = await changeEmail({
        newEmail: emailForm.newEmail,
        currentPassword: emailForm.currentPassword,
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        notifyAuthTokenChanged();
      }
      if (res.data?.user) {
        setUser(res.data.user);
      }

      setEmailForm({ newEmail: "", currentPassword: "" });
      setSettingsSuccess("Email updated successfully.");
    } catch (err) {
      setSettingsError(err.response?.data?.message || "Could not update email.");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  /** Persist password change with current/new/confirm validation. */
  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmNewPassword
    ) {
      setSettingsError("Please fill all password fields.");
      setSettingsSuccess("");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setSettingsError("New passwords do not match.");
      setSettingsSuccess("");
      return;
    }

    setIsUpdatingPassword(true);
    setSettingsError("");
    setSettingsSuccess("");

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setSettingsSuccess("Password updated successfully.");
    } catch (err) {
      setSettingsError(
        err.response?.data?.message || "Could not update password.",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /** Persist notification toggles in account settings. */
  const handleSaveNotifications = async () => {
    setIsUpdatingNotifications(true);
    setSettingsError("");
    setSettingsSuccess("");

    try {
      const res = await updateNotificationSettings(notificationForm);
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        notifyAuthTokenChanged();
      }
      if (res.data?.user) {
        setUser(res.data.user);
      }
      setSettingsSuccess("Notification preferences updated.");
    } catch (err) {
      setSettingsError(
        err.response?.data?.message || "Could not update notifications.",
      );
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  /** Permanently delete account after password + DELETE confirmation. */
  const handleDeleteAccount = async () => {
    if (!deleteForm.currentPassword || !deleteForm.confirmationText) {
      setSettingsError("Please fill password and confirmation text.");
      setSettingsSuccess("");
      return;
    }

    setIsDeletingAccount(true);
    setSettingsError("");
    setSettingsSuccess("");

    try {
      await deleteAccount(deleteForm);
      localStorage.removeItem("token");
      notifyAuthTokenChanged();
      navigate("/register");
    } catch (err) {
      setSettingsError(err.response?.data?.message || "Could not delete account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  /** Trigger hidden file input for avatar upload. */
  // ======================== AVATAR ========================
  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  /** Validate image file, convert to data URL, and upload as profile picture. */
  const handleAvatarFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSettingsError("Please choose a valid image file.");
      setSettingsSuccess("");
      return;
    }

    setIsUploadingPicture(true);
    setSettingsError("");
    setSettingsSuccess("");

    try {
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read image file"));
        reader.readAsDataURL(file);
      });

      const res = await updateProfilePicture({ imageData });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        notifyAuthTokenChanged();
      }
      if (res.data?.user) {
        setUser(res.data.user);
      }

      setSettingsSuccess("Profile picture updated successfully.");
    } catch (err) {
      setSettingsError(
        err.response?.data?.message || "Could not update profile picture.",
      );
    } finally {
      event.target.value = "";
      setIsUploadingPicture(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {isLoading ? (
          <div className={styles.profileCard}>
            <h2 className={styles.userName}>Loading profile...</h2>
          </div>
        ) : error ? (
          <div className={styles.profileCard}>
            <h2 className={styles.userName}>{error}</h2>
            <button
              className={styles.editProfileButton}
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>
        ) : (
          <div className={styles.mainLayout}>
            <aside className={styles.sidebar}>
              <div className={styles.profileCard}>
                <div className={styles.avatarWrapper}>
                  {user?.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatar}>
                      {(firstName || user?.username || user?.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <button
                    className={styles.editAvatarButton}
                    onClick={handleChooseAvatar}
                    type="button"
                    title="Upload profile picture"
                    disabled={isUploadingPicture}
                  >
                    {isUploadingPicture ? "..." : "+"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className={styles.hiddenFileInput}
                    onChange={handleAvatarFileChange}
                  />
                </div>
                <h2 className={styles.userName}>
                  {firstName && lastName
                    ? `${firstName} ${lastName}`
                    : user?.username || "User"}
                </h2>
                <p className={styles.userEmail}>{user?.email}</p>
                <div className={styles.userInfo}>
                  <div className={styles.infoItem}>
                    <span>{user?.phone || "No phone saved"}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span>{user?.gender || "No gender saved"}</span>
                  </div>
                  <div className={`${styles.infoItem} ${styles.roleRow}`}>
                    <span className={styles.roleLabel}>Account role</span>
                    <span className={styles.roleValue}>{friendlyRole}</span>
                  </div>
                </div>
              </div>

              <nav className={styles.nav}>
                <button
                  className={`${styles.navItem} ${activeTab === "profile" ? styles.navItemActive : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <span>My Profile</span>
                </button>
                <button
                  className={`${styles.navItem} ${activeTab === "pets" ? styles.navItemActive : ""}`}
                  onClick={() => setActiveTab("pets")}
                >
                  <span>My Pets ({myPets.length})</span>
                </button>
                <button
                  className={`${styles.navItem} ${activeTab === "favorites" ? styles.navItemActive : ""}`}
                  onClick={() => setActiveTab("favorites")}
                >
                  <span>Favorited pets</span>
                </button>
                <button
                  className={`${styles.navItem} ${activeTab === "requests" ? styles.navItemActive : ""}`}
                  onClick={() => setActiveTab("requests")}
                >
                  <span>
                    My Requests
                    {myRequests.length > 0 ? ` (${myRequests.length})` : ""}
                  </span>
                </button>
                <button
                  className={`${styles.navItem} ${activeTab === "notifications" ? styles.navItemActive : ""}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <span>
                    Notifications
                    {unreadCount > 0 ? ` (${unreadCount})` : ""}
                  </span>
                </button>
                <button
                  className={`${styles.navItem} ${activeTab === "settings" ? styles.navItemActive : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <span>Settings</span>
                </button>

                {normalizedUserRole === "admin" ||
                normalizedUserRole === "administrator" ||
                normalizedUserRole === "superadmin" ? (
                  <button
                    className={styles.navItem}
                    onClick={() => navigate("/admin")}
                  >
                    <span>Admin Dashboard</span>
                  </button>
                ) : null}
              </nav>

              <button className={styles.logoutButton} onClick={handleLogout}>
                <span>Log Out</span>
              </button>
            </aside>

            <main className={styles.mainContent}>
              {activeTab === "profile" && (
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionTitle}>Profile Overview</h2>
                  <div className={styles.overviewCards}>
                    <div className={styles.overviewCard}>
                      <span className={styles.overviewLabel}>Listed pets</span>
                      <strong className={styles.overviewValue}>{myPets.length}</strong>
                    </div>
                    <div className={styles.overviewCard}>
                      <span className={styles.overviewLabel}>Role</span>
                      <strong className={styles.overviewValue}>
                        {friendlyRole}
                      </strong>
                    </div>
                    <div className={styles.overviewCard}>
                      <span className={styles.overviewLabel}>Member since</span>
                      <strong className={styles.overviewValue}>{memberSince}</strong>
                    </div>
                  </div>

                  <div className={styles.settingsGrid}>
                    <div className={styles.settingGroup}>
                      <h3>Personal Information</h3>
                      <div className={styles.readonlyItem}>
                        <span>First Name</span>
                        {isEditing ? (
                          <input
                            className={styles.inlineInput}
                            value={profileForm.firstName}
                            onChange={handleEditInput("firstName")}
                            placeholder="First name"
                          />
                        ) : (
                          <strong>{firstName || "Not set"}</strong>
                        )}
                      </div>
                      <div className={styles.readonlyItem}>
                        <span>Last Name</span>
                        {isEditing ? (
                          <input
                            className={styles.inlineInput}
                            value={profileForm.lastName}
                            onChange={handleEditInput("lastName")}
                            placeholder="Last name"
                          />
                        ) : (
                          <strong>{lastName || "Not set"}</strong>
                        )}
                      </div>
                      <div className={styles.readonlyItem}>
                        <span>Email</span>
                        <strong>{user?.email || "Not set"}</strong>
                      </div>
                      <div className={styles.readonlyItem}>
                        <span>Phone</span>
                        {isEditing ? (
                          <input
                            className={styles.inlineInput}
                            value={profileForm.phone}
                            onChange={handleEditInput("phone")}
                            placeholder="Phone"
                          />
                        ) : (
                          <strong>{user?.phone || "Not set"}</strong>
                        )}
                      </div>
                      <div className={styles.readonlyItem}>
                        <span>Gender</span>
                        {isEditing ? (
                          <select
                            className={styles.inlineInput}
                            value={profileForm.gender}
                            onChange={handleEditInput("gender")}
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">
                              Prefer not to say
                            </option>
                          </select>
                        ) : (
                          <strong>{user?.gender || "Not set"}</strong>
                        )}
                      </div>
                      <div className={styles.readonlyItem}>
                        <span>Birthday</span>
                        {isEditing ? (
                          <input
                            type="date"
                            className={styles.inlineInput}
                            value={profileForm.birthday}
                            onChange={handleEditInput("birthday")}
                          />
                        ) : (
                          <strong>{user?.birthday || "Not set"}</strong>
                        )}
                      </div>
                    </div>

                    <div className={styles.settingGroup}>
                      <h3>Account Details</h3>
                      <div className={styles.readonlyItem}>
                        <span>Username</span>
                        <strong>{user?.username || "Unknown"}</strong>
                      </div>
                      <div className={styles.readonlyItem}>
                        <span>Account Role</span>
                        <strong>{friendlyRole}</strong>
                      </div>
                      <div className={styles.readonlyItem}>
                        <span>Member Since</span>
                        <strong>{memberSince}</strong>
                      </div>
                    </div>
                  </div>

                  <div className={styles.actionButtons}>
                    {saveError && (
                      <span className={styles.formMessageError}>{saveError}</span>
                    )}
                    {saveMessage && (
                      <span className={styles.formMessageSuccess}>
                        {saveMessage}
                      </span>
                    )}
                    {!isEditing ? (
                      <>
                        <button
                          className={styles.saveButton}
                          onClick={startEditing}
                        >
                          Edit profile
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={loadProfile}
                        >
                          Refresh profile
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={styles.saveButton}
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={cancelEditing}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "pets" && (
                <div className={styles.profileCard}>
                  <h2 className={styles.sectionTitle}>My Pets</h2>
                  {myPets.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>You haven't listed any pets for adoption yet.</p>
                      <button
                        className={styles.actionButton}
                        onClick={() => navigate("/create-post")}
                      >
                        Add Your First Pet
                      </button>
                    </div>
                  ) : (
                    <div className={styles.petsGrid}>
                      {myPets.map((pet) => (
                        <button
                          key={pet.id}
                          type="button"
                          className={styles.petCard}
                          onClick={() => navigate(`/adopt/${pet.id}`)}
                        >
                          <img
                            src={
                              (Array.isArray(pet.images) && pet.images[0]) ||
                              pet.image
                            }
                            alt={pet.name}
                            className={styles.petImage}
                          />
                          <div className={styles.petMeta}>
                            <h3>{pet.name}</h3>
                            <p>{pet.breed}</p>
                            <span className={styles.petStatus}>
                              {String(pet.status || "").toLowerCase() ===
                                "adopted" || pet.adopted
                                ? "Adopted"
                                : "Available"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "favorites" && <FavoritedPets />}

              {activeTab === "requests" && (
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionTitle}>My Adoption Requests</h2>
                  <p className={styles.inboxHint}>
                    Requests you sent to adopt pets and their current status.
                  </p>

                  {myRequestsLoading && (
                    <p className={styles.inboxHint}>Loading your requests...</p>
                  )}
                  {!myRequestsLoading && myRequestsError && (
                    <p className={styles.requestError}>{myRequestsError}</p>
                  )}
                  {!myRequestsLoading && !myRequestsError && (
                    <>
                      {myRequests.length === 0 ? (
                        <div className={styles.emptyState}>
                          <p>You haven&apos;t sent any adoption requests yet.</p>
                          <button
                            className={styles.actionButton}
                            type="button"
                            onClick={() => navigate("/")}
                          >
                            Browse pets
                          </button>
                        </div>
                      ) : (
                        <ul className={styles.inboxList}>
                          {myRequests.map((req) => (
                            <li key={req.id} className={styles.inboxItem}>
                              <div className={styles.inboxItemHeader}>
                                <strong>
                                  Request for {req.petName || "a pet"}
                                </strong>
                                <span
                                  className={`${styles.statusPill} ${styles[`status_${String(req.status || "pending").toLowerCase()}`] || ""}`}
                                >
                                  {formatRequestStatus(req.status)}
                                </span>
                              </div>
                              <p className={styles.inboxBody}>{req.message}</p>
                              <div className={styles.inboxMeta}>
                                Sent{" "}
                                {req.createdAt
                                  ? new Date(req.createdAt).toLocaleString()
                                  : "—"}
                                {req.petBreed ? ` · ${req.petBreed}` : ""}
                                {req.petType
                                  ? ` · ${String(req.petType).charAt(0).toUpperCase()}${String(req.petType).slice(1).toLowerCase()}`
                                  : ""}
                                {ownerLabel(req)
                                  ? ` · Posted by ${ownerLabel(req)}`
                                  : ""}
                              </div>
                              <div className={styles.inboxActions}>
                                {req.petId ? (
                                  <button
                                    type="button"
                                    className={styles.inboxLinkBtn}
                                    onClick={() =>
                                      navigate(`/adopt/${req.petId}`)
                                    }
                                  >
                                    View pet
                                  </button>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "notifications" && (
                <div className={styles.contentCard}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Notifications</h2>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className={styles.markAllReadBtn}
                        onClick={handleMarkAllRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {inboxLoading && (
                    <p className={styles.inboxHint}>Loading notifications...</p>
                  )}
                  {!inboxLoading && inboxError && (
                    <p className={styles.requestError}>{inboxError}</p>
                  )}

                  {!inboxLoading && !inboxError && (
                    <>
                      <h3 className={styles.inboxSubtitle}>
                        Requests for your pets
                      </h3>
                      {requestActionMessage && (
                        <p className={styles.inboxHint}>{requestActionMessage}</p>
                      )}
                      {incomingRequests.length === 0 ? (
                        <p className={styles.inboxHint}>
                          No adoption requests for your pets yet.
                        </p>
                      ) : (
                        <ul className={styles.inboxList}>
                          {incomingRequests.map((req) => {
                            const status = String(
                              req.status || "pending",
                            ).toLowerCase();
                            const busy = updatingRequestId === req.id;
                            return (
                              <li key={req.id} className={styles.inboxItem}>
                                <div className={styles.inboxItemHeader}>
                                  <strong>
                                    {req.fullName} wants to adopt {req.petName}
                                  </strong>
                                  <span
                                    className={`${styles.statusPill} ${styles[`status_${status}`] || ""}`}
                                  >
                                    {formatRequestStatus(status)}
                                  </span>
                                </div>
                                <p className={styles.inboxBody}>{req.message}</p>
                                <div className={styles.inboxMetaBlock}>
                                  {req.email ? (
                                    <div className={styles.inboxMetaRow}>
                                      <span>Email</span>
                                      <strong>{req.email}</strong>
                                    </div>
                                  ) : null}
                                  {req.phone ? (
                                    <div className={styles.inboxMetaRow}>
                                      <span>Phone</span>
                                      <strong>{req.phone}</strong>
                                    </div>
                                  ) : null}
                                  {req.createdAt ? (
                                    <div className={styles.inboxMetaRow}>
                                      <span>Received</span>
                                      <strong>
                                        {new Date(req.createdAt).toLocaleString()}
                                      </strong>
                                    </div>
                                  ) : null}
                                </div>
                                <div className={styles.inboxActions}>
                                  {req.petId ? (
                                    <button
                                      type="button"
                                      className={styles.inboxLinkBtn}
                                      onClick={() =>
                                        navigate(`/adopt/${req.petId}`)
                                      }
                                    >
                                      View pet
                                    </button>
                                  ) : null}
                                  {req.email ? (
                                    <button
                                      type="button"
                                      className={styles.inboxLinkBtn}
                                      onClick={() => {
                                        const subject = encodeURIComponent(
                                          `About adopting ${req.petName || "your pet"}`,
                                        );
                                        window.location.href = `mailto:${String(req.email).trim()}?subject=${subject}`;
                                      }}
                                    >
                                      Email applicant
                                    </button>
                                  ) : null}
                                  {status !== "approved" && (
                                    <button
                                      type="button"
                                      className={styles.approveBtn}
                                      disabled={busy}
                                      onClick={() =>
                                        handleIncomingStatus(req, "approved")
                                      }
                                    >
                                      {busy ? "Saving..." : "Approve"}
                                    </button>
                                  )}
                                  {status !== "rejected" && (
                                    <button
                                      type="button"
                                      className={styles.rejectBtn}
                                      disabled={busy}
                                      onClick={() =>
                                        handleIncomingStatus(req, "rejected")
                                      }
                                    >
                                      Reject
                                    </button>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      <h3 className={styles.inboxSubtitle}>
                        All notifications
                      </h3>
                      {notifications.length === 0 ? (
                        <p className={styles.inboxHint}>
                          You&apos;re all caught up.
                        </p>
                      ) : (
                        <ul className={styles.inboxList}>
                          {notifications.map((item) => {
                            const unread = !Number(item.isRead);
                            const type = String(item.type || "").toLowerCase();
                            const isWarning = type === "admin_warning";
                            const isReport = type === "content_report";
                            const toneClass =
                              type === "pet_comment"
                                ? styles.inboxItemComment
                                : type === "pet_like"
                                  ? styles.inboxItemLike
                                  : type === "adoption_request"
                                    ? styles.inboxItemAdopt
                                    : type === "application_update"
                                      ? styles.inboxItemUpdate
                                      : "";
                            return (
                              <li
                                key={item.id}
                                className={`${styles.inboxItem} ${unread ? styles.inboxItemUnread : ""} ${isWarning || isReport ? styles.inboxItemWarning : ""} ${toneClass}`}
                              >
                                <div className={styles.inboxItemTop}>
                                  <NotificationTypeIcon
                                    type={type}
                                    showLabel
                                  />
                                  <span className={styles.inboxMeta}>
                                    {item.createdAt
                                      ? new Date(
                                          item.createdAt,
                                        ).toLocaleString()
                                      : ""}
                                  </span>
                                </div>
                                <div className={styles.inboxItemHeader}>
                                  <strong>{item.title}</strong>
                                </div>
                                <p className={styles.inboxBody}>{item.body}</p>
                                <div className={styles.inboxActions}>
                                  {item.relatedPetId ? (
                                    <button
                                      type="button"
                                      className={styles.inboxLinkBtn}
                                      onClick={() =>
                                        navigate(
                                          `/adopt/${item.relatedPetId}`,
                                        )
                                      }
                                    >
                                      {type === "pet_comment"
                                        ? "View comment"
                                        : type === "pet_like"
                                          ? "View post"
                                          : type === "adoption_request" ||
                                              type === "application_update"
                                            ? "View listing"
                                            : "View pet"}
                                    </button>
                                  ) : null}
                                  {unread && (
                                    <button
                                      type="button"
                                      className={styles.inboxLinkBtn}
                                      onClick={() =>
                                        handleMarkNotificationRead(item.id)
                                      }
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionTitle}>Settings</h2>
                  <div className={styles.settingsGrid}>
                    <div className={styles.settingGroup}>
                      <h3>Change Email</h3>
                      <div className={styles.settingItem}>
                        <label>Current email</label>
                        <input type="email" value={user?.email || ""} readOnly />
                      </div>
                      <div className={styles.settingItem}>
                        <label>New email</label>
                        <input
                          type="email"
                          value={emailForm.newEmail}
                          onChange={handleEmailInput("newEmail")}
                          placeholder="Enter new email"
                        />
                      </div>
                      <div className={styles.settingItem}>
                        <label>Current password</label>
                        <input
                          type="password"
                          value={emailForm.currentPassword}
                          onChange={handleEmailInput("currentPassword")}
                          placeholder="Confirm with your password"
                        />
                      </div>
                      <div className={styles.settingsActions}>
                        <button
                          className={styles.saveButton}
                          onClick={handleChangeEmail}
                          disabled={isUpdatingEmail}
                        >
                          {isUpdatingEmail ? "Updating..." : "Change email"}
                        </button>
                      </div>
                    </div>

                    <div className={styles.settingGroup}>
                      <h3>Change Password</h3>
                      <div className={styles.settingItem}>
                        <label>Current password</label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordInput("currentPassword")}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className={styles.settingItem}>
                        <label>New password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordInput("newPassword")}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className={styles.settingItem}>
                        <label>Confirm new password</label>
                        <input
                          type="password"
                          value={passwordForm.confirmNewPassword}
                          onChange={handlePasswordInput("confirmNewPassword")}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <div className={styles.settingsActions}>
                        <button
                          className={styles.saveButton}
                          onClick={handleChangePassword}
                          disabled={isUpdatingPassword}
                        >
                          {isUpdatingPassword ? "Updating..." : "Change password"}
                        </button>
                      </div>
                    </div>

                    <div className={styles.settingGroup}>
                      <h3>Notification Preferences</h3>
                      <label className={styles.toggleRow}>
                        <span>New pets matching my interests</span>
                        <input
                          type="checkbox"
                          checked={notificationForm.notifyNewPets}
                          onChange={handleNotificationToggle("notifyNewPets")}
                        />
                      </label>
                      <label className={styles.toggleRow}>
                        <span>Application status updates</span>
                        <input
                          type="checkbox"
                          checked={notificationForm.notifyApplicationUpdates}
                          onChange={handleNotificationToggle(
                            "notifyApplicationUpdates",
                          )}
                        />
                      </label>
                      <div className={styles.settingsActions}>
                        <button
                          className={styles.saveButton}
                          onClick={handleSaveNotifications}
                          disabled={isUpdatingNotifications}
                        >
                          {isUpdatingNotifications
                            ? "Saving..."
                            : "Save Notification Settings"}
                        </button>
                      </div>
                    </div>

                    <div className={styles.settingGroup}>
                      <h3>Delete account</h3>
                      <p className={styles.dangerText}>
                        This permanently removes your account. Enter your password
                        and type DELETE to confirm.
                      </p>
                      <div className={styles.settingItem}>
                        <label>Current password</label>
                        <input
                          type="password"
                          value={deleteForm.currentPassword}
                          onChange={handleDeleteInput("currentPassword")}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className={styles.settingItem}>
                        <label>Type DELETE to confirm</label>
                        <input
                          type="text"
                          value={deleteForm.confirmationText}
                          onChange={handleDeleteInput("confirmationText")}
                          placeholder="DELETE"
                        />
                      </div>
                      <div className={styles.settingsActions}>
                        <button
                          className={styles.dangerButton}
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount}
                        >
                          {isDeletingAccount ? "Deleting..." : "Delete account"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionButtons}>
                    {settingsError && (
                      <span className={styles.formMessageError}>
                        {settingsError}
                      </span>
                    )}
                    {settingsSuccess && (
                      <span className={styles.formMessageSuccess}>
                        {settingsSuccess}
                      </span>
                    )}
                    <button className={styles.cancelButton} onClick={handleLogout}>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
      <Footer />

      {removeListingPrompt &&
        createPortal(
          <div
            className={styles.confirmOverlay}
            onClick={() =>
              !isRemovingListing ? setRemoveListingPrompt(null) : null
            }
            role="presentation"
          >
            <div
              className={styles.confirmModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="remove-listing-title"
              onClick={(e) => e.stopPropagation()}
            >
              <p className={styles.confirmEyebrow}>Adoption approved</p>
              <h2 id="remove-listing-title" className={styles.confirmTitle}>
                Remove this listing?
              </h2>
              <p className={styles.confirmBody}>
                You approved{" "}
                <strong>{removeListingPrompt.applicantName}</strong> to adopt{" "}
                <strong>{removeListingPrompt.petName}</strong>. Would you like
                to remove the adoption post now?
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmKeepBtn}
                  disabled={isRemovingListing}
                  onClick={() => setRemoveListingPrompt(null)}
                >
                  Keep listing
                </button>
                <button
                  type="button"
                  className={styles.confirmRemoveBtn}
                  disabled={isRemovingListing}
                  onClick={handleConfirmRemoveListing}
                >
                  {isRemovingListing ? "Removing..." : "Remove listing"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Profile;
