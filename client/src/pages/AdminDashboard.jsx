import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
  getAdminComments,
  getAdminPosts,
  getAdminStats,
  getAdminUsers,
} from "../services/adminService";
import styles from "../styles/adminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [activeList, setActiveList] = useState("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const navigate = useNavigate();

  const loadStats = async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, usersRes, postsRes, commentsRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminPosts(),
        getAdminComments(),
      ]);

      setStats(statsRes.data);
      setAllUsers(usersRes.data || []);
      setAllPosts(postsRes.data || []);
      setAllComments(commentsRes.data || []);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Access denied. Admins only.");
      } else {
        setError(err.response?.data?.message || "Failed to load stats");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statItems = stats
    ? [
        {
          label: "Total Users",
          value: stats.stats.totalUsers,
          hint: "Registered accounts",
        },
        {
          label: "Total Pets",
          value: stats.stats.totalPets,
          hint: "Pets listed in system",
        },
        {
          label: "Available Pets",
          value: stats.stats.availablePets,
          hint: "Ready for adoption",
          highlighted: true,
        },
        {
          label: "Total Posts",
          value: stats.stats.totalPosts,
          hint: "Community discussions",
        },
        {
          label: "Total Comments",
          value: stats.stats.totalComments,
          hint: "Engagement activity",
        },
      ]
    : [];

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleString();
  };

  const buildTableHtml = (title, columns, rows) => {
    const thead = columns
      .map((column) => `<th>${escapeHtml(column.label)}</th>`)
      .join("");
    const tbody = rows.length
      ? rows
          .map((row) => {
            const cells = columns
              .map((column) => `<td>${escapeHtml(row[column.key])}</td>`)
              .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("")
      : `<tr><td colspan="${columns.length}">No data</td></tr>`;

    return `
      <section class="report-section">
        <h2>${escapeHtml(title)}</h2>
        <table>
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </section>
    `;
  };

  const handleExportPdf = () => {
    if (!stats) return;

    const now = new Date().toLocaleString();
    const usersRows = allUsers.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      registered: formatDate(user.createdAt),
    }));
    const postsRows = allPosts.map((post) => ({
      id: post.id,
      title: post.title,
      author: post.username,
      created: formatDate(post.createdAt),
    }));
    const commentsRows = allComments.map((comment) => ({
      id: comment.id,
      postId: comment.postId,
      user: comment.username,
      comment: comment.text,
      created: formatDate(comment.createdAt),
    }));

    const reportHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Admin Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #222; margin: 24px; }
            h1 { margin: 0; font-size: 24px; }
            .meta { margin: 8px 0 24px; color: #666; font-size: 13px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 20px; }
            .stat { border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
            .stat-label { font-size: 12px; color: #666; display: block; margin-bottom: 4px; }
            .stat-value { font-size: 18px; font-weight: 700; }
            .report-section { margin-top: 24px; page-break-inside: avoid; }
            h2 { margin: 0 0 8px; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; text-align: left; vertical-align: top; word-break: break-word; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>House For Paws - Admin Report</h1>
          <p class="meta">Generated: ${escapeHtml(now)}</p>
          <div class="stats-grid">
            ${statItems
              .map(
                (item) => `
                  <div class="stat">
                    <span class="stat-label">${escapeHtml(item.label)}</span>
                    <span class="stat-value">${escapeHtml(item.value)}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
          ${buildTableHtml(
            "Recent Users",
            [
              { key: "id", label: "ID" },
              { key: "username", label: "Username" },
              { key: "email", label: "Email" },
              { key: "joined", label: "Joined" },
            ],
            (stats.recentUsers || []).map((u) => ({
              id: u.id,
              username: u.username,
              email: u.email,
              joined: formatDate(u.createdAt),
            })),
          )}
          ${buildTableHtml(
            "Recent Pets",
            [
              { key: "id", label: "ID" },
              { key: "name", label: "Name" },
              { key: "breed", label: "Breed" },
              { key: "status", label: "Status" },
            ],
            (stats.recentPets || []).map((p) => ({
              id: p.id,
              name: p.name,
              breed: p.breed,
              status: p.status,
            })),
          )}
          ${buildTableHtml(
            "All Users",
            [
              { key: "id", label: "ID" },
              { key: "username", label: "Username" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role" },
              { key: "registered", label: "Registered" },
            ],
            usersRows,
          )}
          ${buildTableHtml(
            "All Posts",
            [
              { key: "id", label: "ID" },
              { key: "title", label: "Title" },
              { key: "author", label: "Author" },
              { key: "created", label: "Created" },
            ],
            postsRows,
          )}
          ${buildTableHtml(
            "All Comments",
            [
              { key: "id", label: "ID" },
              { key: "postId", label: "Post ID" },
              { key: "user", label: "User" },
              { key: "comment", label: "Comment" },
              { key: "created", label: "Created" },
            ],
            commentsRows,
          )}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const toCsvValue = (value) => {
    const stringValue = String(value ?? "");
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const downloadCsv = (filename, lines) => {
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!stats) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const csvLines = [];
    const addSection = (title, headers, rows) => {
      csvLines.push(toCsvValue(title));
      csvLines.push(headers.map((header) => toCsvValue(header)).join(","));
      if (rows.length) {
        rows.forEach((row) =>
          csvLines.push(row.map((cell) => toCsvValue(cell)).join(",")),
        );
      } else {
        csvLines.push(toCsvValue("No data"));
      }
      csvLines.push("");
    };

    csvLines.push(toCsvValue("House For Paws - Admin Export"));
    csvLines.push(`Generated At,${toCsvValue(new Date().toLocaleString())}`);
    csvLines.push("");

    addSection(
      "Stats",
      ["Metric", "Value"],
      statItems.map((item) => [item.label, item.value]),
    );

    addSection(
      "Users",
      ["ID", "Username", "Email", "Role", "Registered"],
      allUsers.map((user) => [
        user.id,
        user.username,
        user.email,
        user.role,
        formatDate(user.createdAt),
      ]),
    );

    addSection(
      "Posts",
      ["ID", "Title", "Author", "Created"],
      allPosts.map((post) => [
        post.id,
        post.title,
        post.username,
        formatDate(post.createdAt),
      ]),
    );

    addSection(
      "Comments",
      ["ID", "Post ID", "User", "Comment", "Created"],
      allComments.map((comment) => [
        comment.id,
        comment.postId,
        comment.username,
        comment.text,
        formatDate(comment.createdAt),
      ]),
    );

    downloadCsv(`admin-full-export-${timestamp}.csv`, csvLines);
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Site analytics and overview</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.secondaryBtn} onClick={() => navigate("/profile")}>
              Back to Profile
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={handleExportPdf}
              disabled={loading || !stats}
            >
              Export PDF
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={handleExportCsv}
              disabled={loading || !stats}
            >
              Export CSV
            </button>
            <button className={styles.primaryBtn} onClick={loadStats} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
        {lastUpdated && !loading && !error && (
          <p className={styles.lastUpdated}>Last updated: {lastUpdated}</p>
        )}

        {loading ? (
          <div className={styles.loadingCard}>
            <div className={styles.loader}></div>
            <p>Loading admin insights...</p>
          </div>
        ) : error ? (
          <div className={styles.errorCard}>
            <p>{error}</p>
            <div className={styles.errorActions}>
              <button className={styles.secondaryBtn} onClick={() => navigate("/profile")}>
                Back to Profile
              </button>
              <button className={styles.primaryBtn} onClick={loadStats}>
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              {statItems.map((item) => (
                <div
                  key={item.label}
                  className={`${styles.statCard} ${item.highlighted ? styles.statCardHighlight : ""}`}
                >
                  <span className={styles.statLabel}>{item.label}</span>
                  <span className={styles.statValue}>{item.value}</span>
                  <span className={styles.statHint}>{item.hint}</span>
                </div>
              ))}
            </div>

            <div className={styles.tablesGrid}>
              <div className={styles.tableCard}>
                <h3 className={styles.tableTitle}>Recent Users</h3>
                {stats.recentUsers.length ? (
                  <div className={styles.tableWrapper}>
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
                  </div>
                ) : (
                  <p className={styles.empty}>No users yet.</p>
                )}
              </div>

              <div className={styles.tableCard}>
                <h3 className={styles.tableTitle}>Recent Pets</h3>
                {stats.recentPets.length ? (
                  <div className={styles.tableWrapper}>
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
                            <td>
                              <span className={styles.statusBadge}>{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={styles.empty}>No pets yet.</p>
                )}
              </div>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.listHeader}>
                <h3 className={styles.tableTitle}>Management Lists</h3>
                <div className={styles.listTabs}>
                  <button
                    className={`${styles.listTabBtn} ${activeList === "users" ? styles.listTabBtnActive : ""}`}
                    onClick={() => setActiveList("users")}
                  >
                    Users ({allUsers.length})
                  </button>
                  <button
                    className={`${styles.listTabBtn} ${activeList === "posts" ? styles.listTabBtnActive : ""}`}
                    onClick={() => setActiveList("posts")}
                  >
                    Posts ({allPosts.length})
                  </button>
                  <button
                    className={`${styles.listTabBtn} ${activeList === "comments" ? styles.listTabBtnActive : ""}`}
                    onClick={() => setActiveList("comments")}
                  >
                    Comments ({allComments.length})
                  </button>
                </div>
              </div>

              {activeList === "users" && (
                <>
                  {allUsers.length ? (
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Registered</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUsers.map((user) => (
                            <tr key={user.id}>
                              <td>{user.id}</td>
                              <td>{user.username}</td>
                              <td>{user.email}</td>
                              <td>{user.role}</td>
                              <td>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className={styles.empty}>No registered users found.</p>
                  )}
                </>
              )}

              {activeList === "posts" && (
                <>
                  {allPosts.length ? (
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allPosts.map((post) => (
                            <tr key={post.id}>
                              <td>{post.id}</td>
                              <td>{post.title}</td>
                              <td>{post.username}</td>
                              <td>
                                {new Date(post.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className={styles.empty}>No posts found.</p>
                  )}
                </>
              )}

              {activeList === "comments" && (
                <>
                  {allComments.length ? (
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Post ID</th>
                            <th>User</th>
                            <th>Comment</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allComments.map((comment) => (
                            <tr key={comment.id}>
                              <td>{comment.id}</td>
                              <td>{comment.postId}</td>
                              <td>{comment.username}</td>
                              <td>{comment.text}</td>
                              <td>
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className={styles.empty}>No comments found.</p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
