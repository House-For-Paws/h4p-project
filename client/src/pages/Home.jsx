import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import { useNavigate } from "react-router-dom";

const pets = [
  {
    id: 1,
    name: "Max",
    breed: "Golden Retriever",
    age: "2 years",
    location: "Tel Aviv",
    type: "dog",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    gender: "Male",
  },
  {
    id: 2,
    name: "Luna",
    breed: "British Shorthair",
    age: "1 year",
    location: "Haifa",
    type: "cat",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400",
    gender: "Female",
  },
  {
    id: 3,
    name: "Charlie",
    breed: "Labrador",
    age: "3 years",
    location: "Jerusalem",
    type: "dog",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
    gender: "Male",
  },
  {
    id: 4,
    name: "Milo",
    breed: "Persian Cat",
    age: "2 years",
    location: "Tel Aviv",
    type: "cat",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    gender: "Male",
  },
  {
    id: 5,
    name: "Bella",
    breed: "Beagle",
    age: "1 year",
    location: "Eilat",
    type: "dog",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400",
    gender: "Female",
  },
  {
    id: 6,
    name: "Oliver",
    breed: "Maine Coon",
    age: "4 years",
    location: "Haifa",
    type: "cat",
    image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400",
    gender: "Male",
  },
  {
    id: 7,
    name: "Rocky",
    breed: "German Shepherd",
    age: "2 years",
    location: "Tel Aviv",
    type: "dog",
    image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400",
    gender: "Male",
  },
  {
    id: 8,
    name: "Whiskers",
    breed: "Siamese",
    age: "1 year",
    location: "Haifa",
    type: "cat",
    image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400",
    gender: "Female",
  },
];

const filters = [
  { id: "all", label: "All Pets", icon: "all" },
  { id: "dog", label: "Dogs", icon: "dog" },
  { id: "cat", label: "Cats", icon: "cat" },
];

function Home() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [likedPets, setLikedPets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      const interval = setInterval(() => {
        setShowPopup(true);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

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

  const filteredPets = pets.filter((pet) => {
    const matchesFilter = activeFilter === "all" || pet.type === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleLike = (id) => {
    setLikedPets((prev) =>
      prev.includes(id) ? prev.filter((petId) => petId !== id) : [...prev, id],
    );
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    localStorage.setItem("token", "logged_in");
    setIsLoading(false);
    setShowPopup(false);
    setUsername("");
    setPassword("");
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
            Showing <strong>{filteredPets.length}</strong> pets available for
            adoption
          </p>

          {filteredPets.length === 0 ? (
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
              {filteredPets.map((pet) => (
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
