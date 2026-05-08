import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { getPets } from "../services/userService";
import { getAvailablePetsCount } from "../services/statsService";

const filters = [
  { id: "all", label: "All Pets", icon: "all" },
  { id: "dog", label: "Dogs", icon: "dog" },
  { id: "cat", label: "Cats", icon: "cat" },
];

function Home() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [pets, setPets] = useState([]);
  const [likedPets, setLikedPets] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem("favoritedPets");
    return saved ? JSON.parse(saved) : [];
  });
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [petsLoading, setPetsLoading] = useState(true);
  const [petsError, setPetsError] = useState("");
  const [availablePetsCount, setAvailablePetsCount] = useState(0);
  const [loginError, setLoginError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  const navigate = useNavigate();

  useEffect(() => {
    const loadPets = async () => {
      setPetsLoading(true);
      setPetsError("");

      try {
        const res = await getPets({
          type: activeFilter,
          search: searchQuery,
        });
        setPets(res.data);
      } catch (err) {
        setPetsError(err.response?.data?.message || "Could not load pets");
      } finally {
        setPetsLoading(false);
      }
    };

    loadPets();
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    const loadAvailablePetsCount = async () => {
      try {
        const res = await getAvailablePetsCount();
        setAvailablePetsCount(res.count);
      } catch (err) {
        console.error("Failed to load available pets count:", err);
      }
    };

    loadAvailablePetsCount();
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      const hasToken = Boolean(localStorage.getItem("token"));
      setIsAuthenticated(hasToken);
    };

    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  useEffect(() => {
    if (isAuthenticated) return;

    const maybeShowPopup = () => {
      const hasToken = Boolean(localStorage.getItem("token"));
      if (hasToken) {
        setIsAuthenticated(true);
        setShowPopup(false);
        return;
      }
      setShowPopup(true);
    };

    const timer = setTimeout(maybeShowPopup, 3000);
    const interval = setInterval(maybeShowPopup, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    document.body.style.overflow = showPopup ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPopup]);

  const closePopup = () => {
    setShowPopup(false);
    setLoginError("");
  };

  const toggleLike = (id) => {
    setLikedPets((prev) => {
      const newLikedPets = prev.includes(id)
        ? prev.filter((petId) => petId !== id)
        : [...prev, id];

      // Save to localStorage
      localStorage.setItem("favoritedPets", JSON.stringify(newLikedPets));

      return newLikedPets;
    });
  };

  const handleAdoptClick = (pet) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowPopup(true);
      return;
    }

    navigate(`/adopt/${pet.id}`);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      const res = await login({ email: username, username, password });
      localStorage.setItem("token", res.data.token);
      setIsAuthenticated(true);
      setShowPopup(false);
      setUsername("");
      setPassword("");
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const FilterIcon = ({ type }) => {
    if (type === "all") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      );
    }
    if (type === "dog") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
          <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
          <path d="M8 14v.5" />
          <path d="M16 14v.5" />
          <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
          <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
        </svg>
      );
    }
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z" />
        <path d="M8 14v.5" />
        <path d="M16 14v.5" />
        <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
      </svg>
    );
  };

  return (
    <>
      <Navbar />

      <div className={`${styles.wrapper} ${showPopup ? styles.blur : ""}`}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Find Your Perfect Companion</h1>
            <p className={styles.subtitle}>
              Browse adorable pets waiting for their forever home
            </p>
          </div>

          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0-7.78z" />
                  <path d="M8 14v.5" />
                  <path d="M16 14v.5" />
                  <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
                </svg>
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>15,000+</h3>
                <p className={styles.statLabel}>Pets Adopted</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 9-9 9-7 9 9-7-9-7-9-9zm9 0a9 9 0 0 1 9 0 9 9 0 0 1-9 0zm-9 0v2h18v-2H3z" />
                  <path d="M12 15l-2 5-9-9v4h18v-4l-7 7z" />
                </svg>
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>500+</h3>
                <p className={styles.statLabel}>Partner Shelters</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4z" />
                  <path d="M16 3.13a4 4 0 0 1 4.87 4.13c0-.39.04-.79.08-1.17.13l-2.9 2.9a4 4 0 0 0-5.65 2.33l.13.13c.39-.05.79-.08 1.17-.13l2.9-2.9a4 4 0 0 0 5.65-2.33l-.13-.13c-.39.04-.79.08-1.17.13z" />
                  <path d="M12 16v.5" />
                  <path d="M16 16v.5" />
                </svg>
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>50,000+</h3>
                <p className={styles.statLabel}>Happy Families</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{availablePetsCount}</h3>
                <p className={styles.statLabel}>Available Now</p>
              </div>
            </div>
          </div>

          <div className={styles.searchWrapper}>
            <div className={styles.searchBox}>
              <svg
                className={styles.searchIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, breed, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className={styles.filters}>
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`${styles.filterBtn} ${
                  activeFilter === filter.id ? styles.active : ""
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <span className={styles.filterIcon}>
                  <FilterIcon type={filter.icon} />
                </span>
                {filter.label}
              </button>
            ))}
          </div>

          <p className={styles.resultsCount}>
            Showing <strong>{pets.length}</strong> pets available for adoption
          </p>

          {petsLoading ? (
            <div className={styles.emptyState}>
              <h3>Loading pets...</h3>
            </div>
          ) : petsError ? (
            <div className={styles.emptyState}>
              <h3>{petsError}</h3>
              <button onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          ) : pets.length === 0 ? (
            <div className={styles.emptyState}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <h3>No pets found</h3>
              <p>
                Try adjusting your search or filter to find your perfect
                companion
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className={styles.feed}>
              {pets.map((pet) => (
                <div key={pet.id} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className={styles.image}
                      loading="lazy"
                    />

                    <button
                      className={`${styles.likeBtn} ${
                        likedPets.includes(pet.id) ? styles.liked : ""
                      }`}
                      onClick={() => toggleLike(pet.id)}
                      aria-label={
                        likedPets.includes(pet.id) ? "Unlike" : "Like"
                      }
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={
                          likedPets.includes(pet.id) ? "currentColor" : "none"
                        }
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    <span className={styles.typeBadge}>
                      {pet.type === "dog" ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          width="16"
                          height="16"
                        >
                          <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
                          <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
                          <path d="M8 14v.5" />
                          <path d="M16 14v.5" />
                          <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
                          <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          width="16"
                          height="16"
                        >
                          <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z" />
                          <path d="M8 14v.5" />
                          <path d="M16 14v.5" />
                          <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
                        </svg>
                      )}
                    </span>

                    <span
                      className={styles.genderBadge}
                      data-gender={pet.gender.toLowerCase()}
                    >
                      {pet.gender}
                    </span>
                  </div>

                  <div className={styles.info}>
                    <h3 className={styles.name}>{pet.name}</h3>
                    <p className={styles.breed}>{pet.breed}</p>

                    <div className={styles.details}>
                      <span className={styles.detail}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          width="14"
                          height="14"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {pet.age}
                      </span>
                      <span className={styles.detail}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          width="14"
                          height="14"
                        >
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {pet.location}
                      </span>
                    </div>

                    <button
                      className={styles.adoptBtn}
                      onClick={() => handleAdoptClick(pet)}
                    >
                      Adopt {pet.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPopup && (
        <div className={styles.popupOverlay} onClick={closePopup}>
          <div
            className={`${styles.popupBox} ${styles.popupAdopt}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.closePopup} onClick={closePopup}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="20"
                height="20"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </span>

            <div className={styles.popupHeader}>
              <div className={styles.popupIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
                  <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
                  <path d="M8 14v.5" />
                  <path d="M16 14v.5" />
                  <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
                  <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
                </svg>
              </div>
              <h2>Welcome Back</h2>
              <p>Sign in to adopt your new best friend</p>
            </div>

            {loginError && (
              <div className={styles.errorMessage}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="16"
                  height="16"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {loginError}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyPress}
                className={styles.popupInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                className={styles.popupInput}
              />
            </div>

            <button
              onClick={handleLogin}
              className={styles.popupLoginBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.loadingSpinner}></span>
              ) : (
                "Sign In"
              )}
            </button>

            <div className={styles.popupFooter}>
              <p>
                {"Don't have an account? "}
                <a href="/register">Create one</a>
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Home;
