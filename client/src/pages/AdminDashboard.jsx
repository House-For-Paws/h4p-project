import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getAdminStats } from "../services/adminService";
import styles from "../styles/adminDashboard.module.css";

const AdminDashboard = () => {
  console.log("AdminDashboard component rendered");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data);
      } catch (err) {
        console.log("AdminDashboard error:", err);
        if (err.response?.status === 403) {
          setError("Access denied. Admins only.");
        } else {
          setError(err.response?.data?.message || "Failed to load stats");
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Site analytics and overview</p>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading stats...</div>
        ) : error ? (
          <div className={styles.errorCard}>
            <p>{error}</p>
            <button
              className={styles.backBtn}
              onClick={() => navigate("/profile")}
            >
              Back to Profile
            </button>
          </div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Total Users</span>
                <span className={styles.statValue}>
                  {stats.stats.totalUsers}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Total Pets</span>
                <span className={styles.statValue}>
                  {stats.stats.totalPets}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Total Posts</span>
                <span className={styles.statValue}>
                  {stats.stats.totalPosts}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Total Comments</span>
                <span className={styles.statValue}>
                  {stats.stats.totalComments}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Available Pets</span>
                <span className={styles.statValue}>
                  {stats.stats.availablePets}
                </span>
              </div>
            </div>

            <div className={styles.tablesGrid}>
              <div className={styles.tableCard}>
                <h3 className={styles.tableTitle}>Recent Users</h3>
                {stats.recentUsers.length ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentUsers.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.username}</td>
                          <td>{u.email}</td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className={styles.empty}>No users yet.</p>
                )}
              </div>

              <div className={styles.tableCard}>
                <h3 className={styles.tableTitle}>Recent Pets</h3>
                {stats.recentPets.length ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Breed</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentPets.map((p) => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.name}</td>
                          <td>{p.breed}</td>
                          <td>{p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className={styles.empty}>No pets yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
