import "./footer.css";
import { FaPaw } from "react-icons/fa";
function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="logo-row">
            <FaPaw className="logo-icon" />
            <span className="logo-text">House For Paws</span>
          </div>
          <p>Making tails wag since 2018</p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h5>Adopt</h5>
            <a>Dogs</a>
            <a>Cats</a>
            <a>Other Pets</a>
          </div>

          <div className="footer-column">
            <h5>About</h5>
            <a>Our Story</a>
            <a>Team</a>
            <a>Careers</a>
          </div>

          <div className="footer-column">
            <h5>Support</h5>
            <a>FAQ</a>
            <a>Contact</a>
            <a>Donate</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 House For Paws. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
