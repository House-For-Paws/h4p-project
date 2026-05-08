import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import TermsBody from "./TermsBody";
import styles from "../../styles/termsModal.module.css";

function TermsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close terms"
        >
          ×
        </button>
        <div className={styles.header}>
          <h2 id="terms-modal-title" className={styles.title}>
            Terms &amp; Conditions
          </h2>
        </div>
        <div className={styles.scroll}>
          <TermsBody />
        </div>
        <div className={styles.footer}>
          <Link
            to="/eula"
            className={styles.fullPageLink}
            onClick={onClose}
          >
            Open full page
          </Link>
          <button type="button" className={styles.primaryBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default TermsModal;
