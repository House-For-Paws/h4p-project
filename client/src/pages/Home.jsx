/**
 * =============================================================================
 * FILE: client/src/pages/Home.jsx
 * ROLE: Browse adoptable pets (filter / search / sort / like / favorite)
 * =============================================================================
 * Sections: STATE | LOAD PETS | LIKE | FAVORITE | ADOPT / LOGIN POPUP | RENDER
 * =============================================================================
 */
import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import {
  getPets,
  togglePetFavorite,
  togglePetLike,
} from "../services/userService";
import { getAvailablePetsCount } from "../services/statsService";
import { notifyAuthTokenChanged } from "../utils/authEvents";
import PetImageCarousel from "../Components/features/PetImageCarousel";
import { PET_TRAIT_OPTIONS } from "../utils/createPetValidation";

const filters = [
  { id: "all", label: "All Pets", icon: "all" },
  { id: "dog", label: "Dogs", icon: "dog" },
  { id: "cat", label: "Cats", icon: "cat" },
];

const sortOptions = [
  { id: "", label: "Default" },
  { id: "likes", label: "Most liked" },
  { id: "comments", label: "Most comments" },
  { id: "views", label: "Most viewed" },
];

function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id != null ? Number(payload.id) : null;
  } catch {
    return null;
  }
}

function Home() {
  const [activeFilter, setActiveFilter] = useState(
    () => localStorage.getItem("homeActiveFilter") || "all",
  );
  const [sortBy, setSortBy] = useState(
    () => localStorage.getItem("homeSortBy") || "",
  );
  const [pets, setPets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    () => localStorage.getItem("homeSearchQuery") || "",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [petsLoading, setPetsLoading] = useState(true);
  const [petsError, setPetsError] = useState("");
  const [availablePetsCount, setAvailablePetsCount] = useState(0);
  const [loginError, setLoginError] = useState("");
  const [favoriteToast, setFavoriteToast] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const hasActiveSearch = searchQuery.trim().length > 0;
  const hasActiveTypeFilter = activeFilter !== "all";
  const hasActiveSort = Boolean(sortBy);
  const hasActiveFilters =
    hasActiveSearch || hasActiveTypeFilter || hasActiveSort;

  const resetFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
    setSortBy("");
  };

  useEffect(() => {
    localStorage.setItem("homeSortBy", sortBy);
  }, [sortBy]);

  useEffect(() => {
    const loadPets = async () => {
      setPetsLoading(true);
      setPetsError("");

      try {
        const res = await getPets({
          status: "available",
          type: activeFilter,
          search: searchQuery,
          ...(sortBy ? { sort: sortBy } : {}),
        });
        setPets(res.data);
      } catch (err) {
        setPetsError(err.response?.data?.message || "Could not load pets");
      } finally {
        setPetsLoading(false);
      }
    };

    loadPets();
  }, [activeFilter, searchQuery, sortBy]);

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
    localStorage.setItem("homeActiveFilter", activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    localStorage.setItem("homeSearchQuery", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!favoriteToast) return undefined;
    const timer = setTimeout(() => setFavoriteToast(""), 1800);
    return () => clearTimeout(timer);
  }, [favoriteToast]);

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

  /** Toggle like (heart) — engagement count only; not favorites. */
  // ======================== LIKE ========================
  const toggleLike = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowPopup(true);
      return;
    }

    const target = pets.find((pet) => pet.id === id);
    const wasLiked = Boolean(target?.likedByMe);
    setPets((prev) =>
      prev.map((pet) =>
        pet.id === id
          ? {
              ...pet,
              likedByMe: !wasLiked,
              likeCount: Math.max(
                0,
                Number(pet.likeCount || 0) + (wasLiked ? -1 : 1),
              ),
            }
          : pet,
      ),
    );

    try {
      const res = await togglePetLike(id);
      setPets((prev) =>
        prev.map((pet) =>
          pet.id === id
            ? {
                ...pet,
                likedByMe: Boolean(res.data?.liked),
                likeCount: Number(res.data?.likeCount ?? pet.likeCount),
              }
            : pet,
        ),
      );
      setFavoriteToast(res.data?.liked ? "Liked" : "Like removed");
    } catch (err) {
      setPets((prev) =>
        prev.map((pet) =>
          pet.id === id
            ? {
                ...pet,
                likedByMe: wasLiked,
                likeCount: Math.max(
                  0,
                  Number(pet.likeCount || 0) + (wasLiked ? 1 : -1),
                ),
              }
            : pet,
        ),
      );
      setFavoriteToast(err.response?.data?.message || "Could not update like");
    }
  };

  // ======================== FAVORITE ========================
  /** Bookmark — saved list in profile; independent of likes. */
  const toggleFavorite = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowPopup(true);
      return;
    }

    const target = pets.find((pet) => pet.id === id);
    const wasFavorited = Boolean(target?.favoritedByMe);
    setPets((prev) =>
      prev.map((pet) =>
        pet.id === id ? { ...pet, favoritedByMe: !wasFavorited } : pet,
      ),
    );

    try {
      const res = await togglePetFavorite(id);
      setPets((prev) =>
        prev.map((pet) =>
          pet.id === id
            ? { ...pet, favoritedByMe: Boolean(res.data?.favorited) }
            : pet,
        ),
      );
      setFavoriteToast(
        res.data?.favorited ? "Saved to favorites" : "Removed from favorites",
      );
    } catch (err) {
      setPets((prev) =>
        prev.map((pet) =>
          pet.id === id ? { ...pet, favoritedByMe: wasFavorited } : pet,
        ),
      );
      setFavoriteToast(
        err.response?.data?.message || "Could not update favorite",
      );
    }
  };

  /** Start adoption flow; enforce sign-in first. */
  // ======================== NAV / LOGIN POPUP ========================
  const handleAdoptClick = (pet) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowPopup(true);
      return;
    }

    navigate(`/adopt/${pet.id}`);
  };

  /** Open create-post page; guests must sign in first. */
  const handleCreatePostClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowPopup(true);
      return;
    }
    navigate("/create-post");
  };

  /** Login popup submit handler (inline auth from home page). */
  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.token);
      notifyAuthTokenChanged();
      setIsAuthenticated(true);
      setShowPopup(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      const data = err.response?.data;
      if (data?.banned) {
        const reason = data.banReason || "Not specified";
        const detail = data.banDescription
          ? ` — ${data.banDescription}`
          : "";
        setLoginError(`This account has been banned. Reason: ${reason}${detail}`);
      } else {
        setLoginError(data?.message || "Login failed");
      }
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

  const getPetStatusLabel = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "available") return "Looking for a home";
    if (normalized === "adopted") return "Found a loving home";
    if (normalized === "pending") return "Adoption in progress";
    return "Looking for a home";
  };

  const renderSkeletonCards = () =>
    Array.from({ length: 6 }).map((_, index) => (
      <div key={`skeleton-${index}`} className={`${styles.card} ${styles.skeletonCard}`}>
        <div className={styles.skeletonImage} />
        <div className={styles.info}>
          <div className={styles.skeletonLineLg} />
          <div className={styles.skeletonLineMd} />
          <div className={styles.skeletonMetaRow}>
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
          </div>
          <div className={styles.skeletonButton} />
        </div>
      </div>
    ));

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
            <p className={styles.trustNote}>
              House For Paws is adoption-focused only. No buying or selling of animals.
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
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M9 22V12h6v10" />
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

          <div className={styles.futurePostCta}>
            <div className={styles.futurePostText}>
              <h3>Create Adoption Post</h3>
              <p>
                Publish a pet profile with photos and details so adopters can
                find them faster.
              </p>
            </div>
            <button
              type="button"
              className={styles.futurePostButton}
              onClick={handleCreatePostClick}
            >
              Create Post
            </button>
          </div>

          <div className={styles.discoveryBar}>
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

            <div className={styles.sortRow}>
              <span className={styles.sortLabel}>Sort by</span>
              <div className={styles.sortOptions}>
                {sortOptions.map((option) => (
                  <button
                    key={option.id || "default"}
                    type="button"
                    className={`${styles.sortBtn} ${
                      sortBy === option.id ? styles.sortBtnActive : ""
                    }`}
                    onClick={() => setSortBy(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className={styles.activeFilterChips}>
              {hasActiveTypeFilter && (
                <button
                  className={styles.filterChip}
                  onClick={() => setActiveFilter("all")}
                >
                  Type: {activeFilter} ✕
                </button>
              )}
              {hasActiveSearch && (
                <button
                  className={styles.filterChip}
                  onClick={() => setSearchQuery("")}
                >
                  Search: {searchQuery} ✕
                </button>
              )}
              {hasActiveSort && (
                <button
                  className={styles.filterChip}
                  onClick={() => setSortBy("")}
                >
                  Sort:{" "}
                  {sortOptions.find((o) => o.id === sortBy)?.label || sortBy} ✕
                </button>
              )}
              <button className={styles.clearAllChip} onClick={resetFilters}>
                Clear all
              </button>
            </div>
          )}

          <p className={styles.resultsCount}>
            Showing <strong>{pets.length}</strong> pets available for adoption
          </p>

          {petsLoading ? (
            <div className={styles.feed}>{renderSkeletonCards()}</div>
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
              <button onClick={resetFilters}>
                Clear filters
              </button>
              <div className={styles.suggestedActions}>
                <button onClick={() => setActiveFilter("dog")}>Try Dogs</button>
                <button onClick={() => setActiveFilter("cat")}>Try Cats</button>
                <button onClick={() => setSearchQuery("tel aviv")}>
                  Search "tel aviv"
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.feed}>
              {pets.map((pet) => (
                <div key={pet.id} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <PetImageCarousel
                      images={
                        Array.isArray(pet.images) && pet.images.length
                          ? pet.images
                          : [pet.image].filter(Boolean)
                      }
                      alt={pet.name}
                      fit="cover"
                    />

                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.favoriteBtn} ${
                          pet.favoritedByMe ? styles.favorited : ""
                        }`}
                        onClick={() => toggleFavorite(pet.id)}
                        aria-label={
                          pet.favoritedByMe
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={pet.favoritedByMe ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                      <button
                        className={`${styles.likeBtn} ${
                          pet.likedByMe ? styles.liked : ""
                        }`}
                        onClick={() => toggleLike(pet.id)}
                        aria-label={pet.likedByMe ? "Unlike" : "Like"}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={pet.likedByMe ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>

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
                    <div className={styles.statusRow}>
                      {(() => {
                        const statusValue = String(pet.status || "").toLowerCase();
                        const isAvailable = statusValue === "available";
                        return (
                      <span
                        className={`${styles.statusBadge} ${
                          isAvailable ? styles.statusAvailable : styles.statusPending
                        }`}
                      >
                        {getPetStatusLabel(statusValue)}
                      </span>
                        );
                      })()}
                      {pet.requestedByMe ? (
                        <span className={styles.requestedBadge}>Requested</span>
                      ) : null}
                    </div>

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

                    {(() => {
                      const activeTraits = PET_TRAIT_OPTIONS.filter(
                        (trait) => pet.traits?.[trait.id],
                      );
                      if (!activeTraits.length) return null;
                      const visible = activeTraits.slice(0, 3);
                      const extra = activeTraits.length - visible.length;
                      return (
                        <ul className={styles.traitTags}>
                          {visible.map((trait) => (
                            <li key={trait.id}>{trait.label}</li>
                          ))}
                          {extra > 0 ? (
                            <li className={styles.traitMore}>+{extra} more</li>
                          ) : null}
                        </ul>
                      );
                    })()}

                    <div className={styles.engagementRow}>
                      <span title="Likes" className={styles.engagementStat}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {Number(pet.likeCount || 0)}
                      </span>
                      <span title="Comments" className={styles.engagementStat}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                        </svg>
                        {Number(pet.commentCount || 0)}
                      </span>
                      <span title="Views" className={styles.engagementStat}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {Number(pet.viewCount || 0)}
                      </span>
                    </div>

                    <button
                      className={styles.adoptBtn}
                      onClick={() => handleAdoptClick(pet)}
                    >
                      {currentUserId != null &&
                      Number(pet.ownerId) === currentUserId
                        ? "View listing"
                        : pet.requestedByMe
                          ? "View request"
                          : `Adopt ${pet.name}`}
                    </button>
                    {!isAuthenticated && (
                      <p className={styles.adoptGuardrail}>
                        You will need an account to continue.
                      </p>
                    )}
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
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

      <div
        className={`${styles.favoriteToast} ${
          favoriteToast ? styles.favoriteToastVisible : ""
        }`}
        role="status"
        aria-live="polite"
      >
        {favoriteToast}
      </div>

      <Footer />
    </>
  );
}

export default Home;
