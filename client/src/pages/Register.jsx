import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/layout/Navbar";
import "./register.css";
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

      <div className="register-container">
        <div className="register-card">
          <h1>
            Create Account <FaPaw className="paw-icon" />
          </h1>

          <p className="subtitle">
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
          <button className="register-btn" onClick={handleRegister}>
            Create Account
          </button>

          <div className="eula-accept-container">
            <label className="eula-checkbox">
              <input type="checkbox" />
            </label>

            <span
              className="accept-text"
              onClick={() => window.open("/EULA.pdf", "_blank")}
            >
              Do you accept our terms and conditions?
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
