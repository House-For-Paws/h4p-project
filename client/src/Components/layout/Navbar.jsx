// קומפוננטת Navbar (סרגל עליון)
import "./Navbar.css";
import { FaPaw } from "react-icons/fa";
function Navbar() {
  return (
    <div className="navbar">
      <div className="logo">House For Paws 
        <FaPaw className="paw-icon" />
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