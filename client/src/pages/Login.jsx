import { useState } from "react";
import API from "../services/api";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import styles from "../styles/login.module.css";
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
      <div className={styles.pageWrapper}>
        {/* 🔥 עוטף את כל הדף */}

        <div className={styles.pageContainer}>
          {/* 🔥 הקונטיינר המרכזי */}

          <div className={styles.loginContainer}>
            {/* LEFT */}
            <div className={styles.loginLeft}>
              <div className={styles.heroText}>
                <h1>
                  Welcome back!
                  <FaPaw className={styles.pawIcon} />
                </h1>

                <p>
                  Login to continue your journey <br />
                  and help more animals find a home.
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className={styles.loginRight}>
              <div className={styles.loginCard}>
                <h2>Login</h2>

                <p className={styles.subtitle}>We’re happy to see you again!</p>

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

                <div className={styles.passwordActions}>
                  <label className={styles.remember}>
                    <input type="checkbox" />
                    Remember me
                  </label>

                  <span className={styles.forgot}>Forgot password?</span>
                </div>

                <button className={styles.loginBtn} onClick={handleLogin}>
                  Login
                </button>

                <p className={styles.divider}>or continue with</p>

                <div className={styles.socials}>
                  <button>
                    <FaGoogle /> Google
                  </button>
                  <button>
                    <FaFacebook /> Facebook
                  </button>
                </div>

                <p className={styles.signupText}>
                  Don’t have an account?{" "}
                  <span onClick={() => navigate("/register")}>Sign up</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
