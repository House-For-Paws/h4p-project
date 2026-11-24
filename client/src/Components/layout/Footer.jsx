/**
 * =============================================================================
 * FILE: client/src/Components/layout/Footer.jsx
 * ROLE: Site footer — brand, links, social, terms (/eula)
 * =============================================================================
 */
import { Link } from "react-router-dom";
import styles from "../../styles/footer.module.css";
import PawIcon from "../features/PawIcon";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function Footer() {
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
          <h3>Follow us</h3>
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
    </footer>
  );
}

export default Footer;
