/**
 * Standalone legal page wrapper for TermsBody content.
 */
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import TermsBody from "../Components/legal/TermsBody";
import styles from "../styles/eula.module.css";

function Eula() {
  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.inner}>
          <span className={styles.badge}>Legal</span>
          <TermsBody />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Eula;
