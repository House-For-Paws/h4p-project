import { useState } from "react";
import API from "../services/api";
import Navbar from "../components/layout/Navbar";
import "./login.css";

import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { FiMail, FiLock } from "react-icons/fi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      alert("Logged in!");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="login-container">
        {/* LEFT */}
        <div className="login-left">
          <div className="left-content">
            <h1>
              Welcome back! <span>🐾</span>
            </h1>

            <p>
              Login to continue your journey
              <br />
              and help more animals find a home.
            </p>
          </div>

          {/* Paw decoration */}
          <svg
            className="paw-decoration paw-1"
            viewBox="0 0 100 100"
            fill="#d4a574"
          >
            <ellipse cx="35" cy="65" rx="12" ry="15" />
            <ellipse cx="65" cy="65" rx="12" ry="15" />
            <ellipse cx="20" cy="40" rx="10" ry="12" />
            <ellipse cx="50" cy="30" rx="10" ry="12" />
            <ellipse cx="80" cy="40" rx="10" ry="12" />
            <ellipse cx="50" cy="75" rx="25" ry="20" />
          </svg>

          <div className="image-container">
            <img
              src="https://images.unsplash.com/photo-1601758003122-58c1c3a9c7a1?w=600"
              alt="pets"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-card">
            <h2>Login</h2>

            <p className="subtitle">We’re happy to see you again!</p>

            {/* EMAIL */}
            <div className="input-group">
              <FiMail />
              <input
                type="email"
                placeholder="Email address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div className="input-group">
              <FiLock />
              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="forgot">Forgot password?</span>
            </div>

            <div className="remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </div>

            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <div className="socials">
              <button>
                <FcGoogle /> Google
              </button>

              <button>
                <FaFacebookF /> Facebook
              </button>
            </div>

            <p className="signup-text">
              Don’t have an account? <span>Sign up</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
