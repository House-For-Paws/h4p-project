import "./Navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <div className="logo">
        PawHome <span className="paw-icon">🐾</span>
      </div>

      <div className="nav-links">
        <a>Home</a>
        <a>Find pets</a>
        <a>About us</a>
        <a>How it works</a>
        <a>Contact</a>
      </div>

      <button className="signup-btn">Sign up</button>
    </div>
  );
}

export default Navbar;
