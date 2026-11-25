/**
 * =============================================================================
 * FILE: client/src/Components/layout/Footer.jsx
 * ROLE: Site footer — brand, links, social, terms, report-a-bug
 * =============================================================================
 */
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/footer.module.css";
import PawIcon from "../features/PawIcon";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { createBugReport } from "../../services/reportService";

const BUG_REASON_OPTIONS = [
  "Broken page / crash",
  "Something looks wrong",
  "Feature not working",
  "Performance issue",
  "Other",
];

const MAX_SCREENSHOT_BYTES = 1_500_000;

function Footer() {
  const navigate = useNavigate();
  const screenshotInputRef = useRef(null);
  const [bugOpen, setBugOpen] = useState(false);
  const [reason, setReason] = useState(BUG_REASON_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  const resetBugForm = () => {
    setReason(BUG_REASON_OPTIONS[0]);
    setDescription("");
    setScreenshot("");
    setError("");
    setSuccess("");
    if (screenshotInputRef.current) screenshotInputRef.current.value = "";
  };

  const openBugForm = () => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    resetBugForm();
    setBugOpen(true);
  };

  const closeBugForm = () => {
    if (sending) return;
    setBugOpen(false);
    setError("");
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) {
      setScreenshot("");
      return;
    }
    if (!String(file.type || "").startsWith("image/")) {
      setError("Screenshot must be an image file.");
      e.target.value = "";
      setScreenshot("");
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError("Screenshot is too large (max about 1.5 MB).");
      e.target.value = "";
      setScreenshot("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!dataUrl.startsWith("data:image/")) {
        setError("Could not read that image.");
        setScreenshot("");
        return;
      }
      setScreenshot(dataUrl);
    };
    reader.onerror = () => {
      setError("Could not read that image.");
      setScreenshot("");
    };
    reader.readAsDataURL(file);
  };

  const clearScreenshot = () => {
    setScreenshot("");
    if (screenshotInputRef.current) screenshotInputRef.current.value = "";
  };

  const handleSubmitBug = async () => {
    const details = String(description || "").trim();
    if (details.length < 10) {
      setError("Please describe what went wrong (at least a few words).");
      return;
    }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const pageHint =
        typeof window !== "undefined" ? window.location.pathname : "";
      const res = await createBugReport({
        reason,
        description: pageHint
          ? `${details}\n\n(Page: ${pageHint})`
          : details,
        screenshot: screenshot || undefined,
      });
      setSuccess(
        res.data?.message ||
          "Bug report submitted. Thanks — an admin will look into it.",
      );
      setTimeout(() => {
        setBugOpen(false);
        resetBugForm();
      }, 1400);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(
        err.response?.data?.message || "Could not submit bug report.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerBrand}>
          <div className={styles.logoRow}>
            <div className={styles.footerLogoMark}>
              <PawIcon size={20} color="#ffffff" circleColor="#ff9800" />
            </div>
            <h2>House For Paws</h2>
          </div>

          <p>
            Connecting loving families with pets in need of homes since 2026.
          </p>
        </div>

        <div className={styles.footerCol}>
          <h3>Explore</h3>
          <Link to="/">Find pets</Link>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className={styles.footerCol}>
          <h3>Learn</h3>
          <Link to="/about">About us</Link>
          <Link to="/how-it-works">Adoption guide</Link>
          <Link to="/contact">Shelters &amp; partners</Link>
        </div>

        <div className={styles.footerCol}>
          <h3>Support</h3>
          <button
            type="button"
            className={styles.footerTextBtn}
            onClick={openBugForm}
          >
            Report a bug
          </button>
          <Link to="/contact">Contact support</Link>
          <div className={styles.socials}>
            <a
              className={styles.socialsLinkWrapper}
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook size={34} color="#1877F2" aria-hidden />
            </a>
            <a
              className={styles.socialsLinkWrapper}
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <FaXTwitter size={34} color="#0f1419" aria-hidden />
            </a>
            <a
              className={styles.socialsLinkWrapper}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram size={34} color="#E4405F" aria-hidden />
            </a>
            <a
              className={styles.socialsLinkWrapper}
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube size={34} color="#FF0000" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <Link to="/eula" className={styles.footerTerms}>
          Terms and conditions
        </Link>
        <p className={styles.footerCopyright}>
          © {new Date().getFullYear()} <span>House For Paws</span>. All rights
          reserved. Made with love for pets.
        </p>
      </div>

      {bugOpen &&
        createPortal(
          <div
            className={styles.bugOverlay}
            onClick={closeBugForm}
            role="presentation"
          >
            <div
              className={styles.bugModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="bug-report-title"
              onClick={(e) => e.stopPropagation()}
            >
              <p className={styles.bugEyebrow}>Feedback</p>
              <h2 id="bug-report-title" className={styles.bugTitle}>
                Report a bug
              </h2>
              <p className={styles.bugBody}>
                Tell us what broke. Admins see this in the Reports queue.
              </p>

              <label className={styles.bugField}>
                <span>What kind of issue?</span>
                <select
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError("");
                  }}
                  disabled={sending}
                >
                  {BUG_REASON_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.bugField}>
                <span>What happened?</span>
                <textarea
                  rows={4}
                  placeholder="Steps to reproduce, what you expected, what you saw…"
                  value={description}
                  maxLength={1000}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError("");
                  }}
                  disabled={sending}
                />
              </label>

              <div className={styles.bugField}>
                <span>Screenshot (optional)</span>
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.bugFileInput}
                  onChange={handleScreenshotChange}
                  disabled={sending}
                />
                {screenshot ? (
                  <div className={styles.bugScreenshotPreview}>
                    <img src={screenshot} alt="Bug screenshot preview" />
                    <button
                      type="button"
                      className={styles.bugRemoveShot}
                      onClick={clearScreenshot}
                      disabled={sending}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <p className={styles.bugFileHint}>
                    PNG, JPG, or WebP — helps admins see the issue.
                  </p>
                )}
              </div>

              {error ? <p className={styles.bugError}>{error}</p> : null}
              {success ? <p className={styles.bugSuccess}>{success}</p> : null}

              <div className={styles.bugActions}>
                <button
                  type="button"
                  className={styles.bugCancelBtn}
                  disabled={sending}
                  onClick={closeBugForm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.bugSubmitBtn}
                  disabled={sending}
                  onClick={handleSubmitBug}
                >
                  {sending ? "Sending..." : "Submit bug report"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </footer>
  );
}

export default Footer;
