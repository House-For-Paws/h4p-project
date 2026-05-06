import React from "react";
import styles from "../styles/profile.module.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const Profile = () => {
  const user = {
    name: "Daniel Cohen",
    email: "danielcohen@email.com",
    phone: "052-1234567",
    location: "Tel Aviv, Israel",
    bio: "I believe every pet deserves a loving home.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  };

  const stats = [
    { label: "My Pets", value: 2, icon: "🐾" },
    { label: "Applications", value: 3, icon: "📋" },
    { label: "Saved Pets", value: 8, icon: "❤️" },
  ];

  const myPets = [
    {
      id: 1,
      name: "Bruno",
      age: "2 years old",
      type: "Dog",
      image:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop",
    },
    {
      id: 2,
      name: "Luna",
      age: "1 year old",
      type: "Cat",
      image:
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop",
    },
  ];

  const applications = [
    {
      id: 1,
      petName: "Charlie",
      petType: "Dog",
      date: "May 10, 2024",
      status: "Under Review",
      image:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=50&h=50&fit=crop",
    },
    {
      id: 2,
      petName: "Milo",
      petType: "Cat",
      date: "May 2, 2024",
      status: "Approved",
      image:
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=50&h=50&fit=crop",
    },
    {
      id: 3,
      petName: "Lizzi",
      petType: "Cat",
      date: "April 20, 2024",
      status: "Rejected",
      image:
        "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=50&h=50&fit=crop",
    },
  ];

  const navItems = [
    { icon: "person", label: "My Profile", active: true },
    { icon: "pets", label: "My Pets", active: false },
    { icon: "description", label: "My Applications", active: false },
    { icon: "favorite", label: "Saved Pets", active: false },

    { icon: "settings", label: "Settings", active: false },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return styles.statusApproved;
      case "Rejected":
        return styles.statusRejected;
      default:
        return styles.statusReview;
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.mainLayout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <nav className={styles.nav}>
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className={`${styles.navItem} ${item.active ? styles.navItemActive : ""}`}
                >
                  {item.icon === "person" && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                  {item.icon === "pets" && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="4.5" cy="9.5" r="2.5" />
                      <circle cx="9" cy="5.5" r="2.5" />
                      <circle cx="15" cy="5.5" r="2.5" />
                      <circle cx="19.5" cy="9.5" r="2.5" />
                      <path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z" />
                    </svg>
                  )}
                  {item.icon === "description" && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                  )}
                  {item.icon === "favorite" && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                 
                  {item.icon === "settings" && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                    </svg>
                  )}
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
            <a href="#" className={styles.logoutButton}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              <span>Log Out</span>
            </a>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            {/* Profile Card */}
            <div className={styles.profileCard}>
              <div className={styles.avatarWrapper}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={styles.avatar}
                />
                <button className={styles.editAvatarButton}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
              </div>
              <h2 className={styles.userName}>{user.name}</h2>
              <p className={styles.userEmail}>{user.email}</p>
              <div className={styles.userInfo}>
                <div className={styles.infoItem}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <span>{user.phone}</span>
                </div>
                <div className={styles.infoItem}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>{user.location}</span>
                </div>
              </div>
              <div className={styles.bio}>
                <span className={styles.bioLabel}>Animal lover 🐾</span>
                <p>{user.bio}</p>
              </div>
              <button className={styles.editProfileButton}>Edit Profile</button>
            </div>

            {/* Right Content */}
            <div className={styles.rightContent}>
              {/* Overview Stats */}
              <section className={styles.overview}>
                <h3 className={styles.sectionTitle}>Overview</h3>
                <div className={styles.statsGrid}>
                  {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>{stat.label}</span>
                        <span className={styles.statValue}>{stat.value}</span>
                      </div>
                      <div className={styles.statIcon}>{stat.icon}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* My Pets Section */}
              <section className={styles.petsSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>My Pets</h3>
                  <a href="#" className={styles.viewAllLink}>
                    View all
                  </a>
                </div>
                <div className={styles.petsGrid}>
                  {myPets.map((pet) => (
                    <div key={pet.id} className={styles.petCard}>
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className={styles.petImage}
                      />
                      <div className={styles.petInfo}>
                        <h4 className={styles.petName}>{pet.name}</h4>
                        <p className={styles.petAge}>{pet.age}</p>
                        <p className={styles.petType}>
                          <span className={styles.pawIcon}>🐾</span>
                          {pet.type}
                        </p>
                        <button className={styles.viewProfileButton}>
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Applications */}
              <section className={styles.applicationsSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Recent Applications</h3>
                  <a href="#" className={styles.viewAllLink}>
                    View all
                  </a>
                </div>
                <div className={styles.applicationsTable}>
                  <div className={styles.tableHeader}>
                    <span>Pet</span>
                    <span>Date</span>
                    <span>Status</span>
                  </div>
                  {applications.map((app) => (
                    <div key={app.id} className={styles.tableRow}>
                      <div className={styles.petCell}>
                        <img
                          src={app.image}
                          alt={app.petName}
                          className={styles.appPetImage}
                        />
                        <div>
                          <span className={styles.appPetName}>
                            {app.petName}
                          </span>
                          <span className={styles.appPetType}>
                            {app.petType}
                          </span>
                        </div>
                      </div>
                      <span className={styles.dateCell}>{app.date}</span>
                      <span
                        className={`${styles.statusBadge} ${getStatusClass(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
