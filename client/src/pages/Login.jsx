import { useState } from "react";
import API from "../services/api";
import Navbar from "../components/layout/Navbar";
import "./login.css";
import { FaPaw } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";







function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 const navigate = useNavigate();
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
    <>
    <Navbar />  
    <div className="page-wrapper">
      {/* 🔥 עוטף את כל הדף */}

      <div className="page-container">
        {/* 🔥 הקונטיינר המרכזי */}

        

        <div className="login-container">
          {/* LEFT */}
          <div className="login-left">
            <div className="hero-text">
              <h1>
                Welcome back!
                <FaPaw className="paw-icon" />
              </h1>

              <p>
                Login to continue your journey <br />
                and help more animals find a home.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="login-right">
            <div className="login-card">
              <h2>Login</h2>

              <p className="subtitle">We’re happy to see you again!</p>

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

              <div className="password-actions">
                <label className="remember">
                  <input type="checkbox" />
                  Remember me
                </label>

                <span className="forgot">Forgot password?</span>
              </div>

              <button className="login-btn" onClick={handleLogin}>
                Login
              </button>

              <p className="divider">or continue with</p>

              <div className="socials">
                <button>
                  <FaGoogle /> Google
                </button>
                <button>
                  <FaFacebook /> Facebook
                </button>
              </div>

              <p className="signup-text">
                Don’t have an account?{" "}
                <span onClick={() => navigate("/register")}>Sign up</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Login;
