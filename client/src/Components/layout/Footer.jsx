import { Link } from "react-router-dom";
import styles from "../../Styles/footer.module.css";
import PawIcon from "../features/PawIcon";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Left */}
        <div className={styles.footerBrand}>
          <div className={styles.logoRow}>
            <PawIcon />
            <h2>House For Paws</h2>
          </div>

          <p>
            Connecting loving families with pets in need of homes since 2026.
          </p>
        </div>

        {/* Adopt */}
        <div className={styles.footerCol}>
          <h3>Adopt</h3>
          <Link to="#">Dogs</Link>
          <Link to="#">Cats</Link>
          <Link to="#">Other Pets</Link>
          <Link to="#">Shelters Near You</Link>
        </div>

        {/* Resources */}
        <div className={styles.footerCol}>
          <h3>Resources</h3>
          <Link to="#">Adoption Guide</Link>
          <Link to="#">Pet Care Tips</Link>
          <Link to="#">FAQs</Link>
          <Link to="#">Contact Us</Link>
        </div>

        {/* Social */}
        <div className={styles.footerCol}>
          <h3>Follow Us</h3>
          <div className={styles.socials}>
            <div className={styles.socialIcon}><FaFacebook color="#1877F2" /></div>
            <div className={styles.socialIcon}><FaTwitter color="#1DA1F2" /></div>
            <div className={styles.socialIcon}><FaInstagram color="#E4405F" /></div>
            <div className={styles.socialIcon}><FaYoutube color="#FF0000" /></div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        2024 PawFinder. All rights reserved. Made with love for pets.
      </div>
    </footer>
  );
}

export default Footer;
