import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import styles from "../styles/register.module.css";
import { FaPaw } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await API.post("/auth/register", {
        username,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      alert("Register failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className={styles.registerContainer}>
        <div className={styles.registerCard}>
          <h1>
            Create Account <FaPaw className={styles.pawIcon} />
          </h1>

          <p className={styles.subtitle}>
            Join our community and help pets find a home
          </p>

          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email address"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="Phone Number"
            placeholder="Phone Number..."
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="Birthday"
            placeholder="When were you born?"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="First Name"
            placeholder="First Name..."
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="Last Name"
            placeholder="Last Name..."
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="Gender"
            placeholder="Your gender..."
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.registerBtn} onClick={handleRegister}>
            Create Account
          </button>

          <div className={styles.eulaAcceptContainer}>
            <label className={styles.eulaCheckbox}>
              <input type="checkbox" />
            </label>

            <span
              className={styles.acceptText}
              onClick={() => window.open("/EULA.pdf", "_blank")}
            >
              Do you accept our terms and conditions?
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Register;
