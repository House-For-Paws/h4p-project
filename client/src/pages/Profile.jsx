import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/profile.module.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getProfile, updateProfile } from "../services/authService";
import { getPets } from "../services/userService";
import FavoritedPets from "../components/profile/FavoritedPets";

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

const Profile = () => {
  const [user, setUser] = useState(null);
  const [myPets, setMyPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    birthday: "",
  });
  const navigate = useNavigate();

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

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "Unknown";
  const firstName = user?.firstName || user?.firstname || "";
  const lastName = user?.lastName || user?.lastname || "";
  const friendlyRole = getFriendlyRole(user?.role);

  const handleEditInput = (field) => (e) => {
    setProfileForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const startEditing = () => {
    setIsEditing(true);
    setSaveMessage("");
    setSaveError("");
  };

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

      setUser(res.data.user);
      setIsEditing(false);
      setSaveMessage("Profile updated successfully.");
    } catch (err) {
      setSaveError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setIsSaving(false);
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
                  <div className={styles.avatar}>
                    {(firstName || user?.username || user?.email)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
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

                {user?.role === "admin" && (
                  <button
                    className={styles.navItem}
                    onClick={() => navigate("/admin")}
                  >
                    <span>Admin Dashboard</span>
                  </button>
                )}
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
                        onClick={() => navigate("/add-pet")}
                      >
                        Add Your First Pet
                      </button>
                    </div>
                  ) : (
                    <div className={styles.petsGrid}>
                      {myPets.map((pet) => (
                        <div key={pet.id} className={styles.petCard}>
                          <img
                            src={pet.image}
                            alt={pet.name}
                            className={styles.petImage}
                          />
                          <div className={styles.petMeta}>
                            <h3>{pet.name}</h3>
                            <p>{pet.breed}</p>
                            <span className={styles.petStatus}>
                              {pet.adopted ? "Adopted" : "Available"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "favorites" && <FavoritedPets />}
            </main>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Profile;
