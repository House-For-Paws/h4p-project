/**
 * =============================================================================
 * FILE: client/src/Components/features/PetImageCarousel.jsx
 * ROLE: Multi-image carousel for pet cards / listing gallery
 * =============================================================================
 */
import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/petImageCarousel.module.css";

function PetImageCarousel({
  images = [],
  alt = "Pet",
  className = "",
  fit = "cover",
}) {
  const slides = useMemo(
    () => (Array.isArray(images) ? images : []).filter(Boolean),
    [images],
  );
  const [index, setIndex] = useState(0);
  const slideKey = `${slides.length}:${slides[0]?.slice?.(0, 48) || ""}:${slides[slides.length - 1]?.slice?.(-24) || ""}`;
  const fitClass = fit === "contain" ? styles.fitContain : styles.fitCover;

  useEffect(() => {
    setIndex(0);
  }, [slideKey]);

  if (!slides.length) {
    return (
      <div className={`${styles.carousel} ${className}`.trim()}>
        <div className={styles.empty}>No photo</div>
      </div>
    );
  }

  const goTo = (next, event) => {
    event?.stopPropagation();
    event?.preventDefault();
    setIndex((prev) => {
      const total = slides.length;
      return (prev + next + total) % total;
    });
  };

  const showControls = slides.length > 1;
  const safeIndex = Math.min(index, slides.length - 1);

  return (
    <div className={`${styles.carousel} ${className}`.trim()}>
      <img
        key={`${safeIndex}-${slides[safeIndex]?.slice?.(0, 32) || "img"}`}
        src={slides[safeIndex]}
        alt={`${alt} photo ${safeIndex + 1}`}
        className={`${styles.image} ${fitClass}`}
        loading="lazy"
      />

      {showControls && (
        <>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={(e) => goTo(-1, e)}
            aria-label="Previous photo"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14.5 6.5 9 12l5.5 5.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={(e) => goTo(1, e)}
            aria-label="Next photo"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9.5 6.5 15 12l-5.5 5.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export default PetImageCarousel;
