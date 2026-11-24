/**
 * =============================================================================
 * FILE: client/src/Components/profile/FavoritedPets.jsx
 * ROLE: Profile tab — pets saved via favorites API (not likes)
 * =============================================================================
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/favoritedPets.module.css";
import {
  getMyFavoritePets,
  togglePetFavorite,
} from "../../services/userService";

const FavoritedPets = () => {
  const navigate = useNavigate();
  const [favoritedPets, setFavoritedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const loadFavoritedPets = async () => {
      try {
        const response = await getMyFavoritePets();
        let pets = response.data || [];
        const existingIds = new Set(pets.map((pet) => Number(pet.id)));

        // One-time migrate leftover localStorage favorites into the API.
        const legacyIds = JSON.parse(
          localStorage.getItem("favoritedPets") || "[]",
        );
        if (Array.isArray(legacyIds) && legacyIds.length) {
          const toAdd = legacyIds
            .map((id) => Number(id))
            .filter((id) => id && !existingIds.has(id));
          if (toAdd.length) {
            await Promise.allSettled(
              toAdd.map((id) => togglePetFavorite(id)),
            );
            const refreshed = await getMyFavoritePets();
            pets = refreshed.data || [];
          }
          localStorage.removeItem("favoritedPets");
        }

        setFavoritedPets(pets);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load favorited pets",
        );
      } finally {
        setLoading(false);
      }
    };

    loadFavoritedPets();
  }, []);

  const removeFavorite = async (petId) => {
    setBusyId(petId);
    try {
      await togglePetFavorite(petId);
      setFavoritedPets((prev) => prev.filter((pet) => pet.id !== petId));
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not remove from favorites",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading favorited pets...</p>
        </div>
      </div>
    );
  }

  if (error && favoritedPets.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (favoritedPets.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h3>No favorited pets yet</h3>
          <p>Browse pets and tap the bookmark to save them here.</p>
          <button
            className={styles.browseBtn}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Browse Pets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Favorited Pets</h2>
        <p className={styles.subtitle}>
          You have {favoritedPets.length} favorited pet
          {favoritedPets.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className={styles.grid}>
        {favoritedPets.map((pet) => (
          <div key={pet.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img
                src={pet.image}
                alt={pet.name}
                className={styles.image}
                loading="lazy"
              />

              <button
                className={`${styles.likeBtn} ${styles.liked}`}
                onClick={() => removeFavorite(pet.id)}
                disabled={busyId === pet.id}
                aria-label="Remove from favorites"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              <span className={styles.typeBadge}>
                {pet.type === "dog" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
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
                data-gender={String(pet.gender || "").toLowerCase()}
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
                onClick={() => navigate(`/adopt/${pet.id}`)}
              >
                Adopt {pet.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritedPets;
