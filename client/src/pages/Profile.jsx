import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/profile.module.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getProfile } from "../services/authService";
import { getPets } from "../services/userService";
import FavoritedPets from "../components/profile/FavoritedPets";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [myPets, setMyPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [profileRes, petsRes] = await Promise.all([
          getProfile(),
          getPets(),
        ]);
        const profileUser = profileRes.data.user;

        setUser(profileUser);
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

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const displayName =
    user && [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

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
                    {(user?.firstname || user?.username || user?.email)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                </div>
                <h2 className={styles.userName}>
                  {user?.firstname && user?.lastname
                    ? `${user.firstname} ${user.lastname}`
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
                  <div className={styles.infoItem}>
                    <span className={styles.roleLabel}>Account role</span>
                    <span className={styles.roleValue}>
                      {user?.role || "user"}
                    </span>
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
                  <span>My Pets</span>
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
                  <h2 className={styles.sectionTitle}>Profile Settings</h2>
                  <div className={styles.settingsGrid}>
                    <div className={styles.settingGroup}>
                      <h3>Personal Information</h3>
                      <div className={styles.settingItem}>
                        <label>First Name</label>
                        <input
                          type="text"
                          defaultValue={user?.firstname || ""}
                          placeholder="Not set"
                        />
                      </div>
                      <div className={styles.settingItem}>
                        <label>Last Name</label>
                        <input
                          type="text"
                          defaultValue={user?.lastname || ""}
                          placeholder="Not set"
                        />
                      </div>
                      <div className={styles.settingItem}>
                        <label>Email</label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          readOnly
                        />
                      </div>
                      <div className={styles.settingItem}>
                        <label>Phone</label>
                        <input
                          type="tel"
                          defaultValue={user?.phone || ""}
                          placeholder="Not set"
                        />
                      </div>
                      <div className={styles.settingItem}>
                        <label>Gender</label>
                        <select defaultValue={user?.gender || ""}>
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.settingGroup}>
                      <h3>Account Settings</h3>
                      <div className={styles.settingItem}>
                        <label>Username</label>
                        <input
                          type="text"
                          value={user?.username || ""}
                          readOnly
                        />
                      </div>
                      <div className={styles.settingItem}>
                        <label>Account Role</label>
                        <input
                          type="text"
                          value={user?.role || "user"}
                          readOnly
                        />
                      </div>
                      <div className={styles.settingItem}>
                        <label>Member Since</label>
                        <input
                          type="text"
                          value={
                            user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "Unknown"
                          }
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.actionButtons}>
                    <button className={styles.saveButton}>Save Changes</button>
                    <button className={styles.cancelButton}>Cancel</button>
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
                          <h3>{pet.name}</h3>
                          <p>{pet.breed}</p>
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
