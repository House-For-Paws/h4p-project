import styles from "../../styles/authPopup.module.css";
import { useEffect, useState } from "react";
import { login } from "../../services/authService";

function AuthPopup({ isOpen, onClose, title, subtitle }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError("Please fill in all fields");
      return;
    }

    setLoginError("");
    setIsLoading(true);

    try {
      const res = await login({ email: username, username, password });
      localStorage.setItem("token", res.data.token);
      onClose();
      window.location.reload();
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div
        className={`${styles.popupBox} ${styles.popupAdopt}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button className={styles.closePopup} onClick={onClose}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="20"
            height="20"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* HEADER */}
        <div className={styles.popupHeader}>
          <div className={styles.popupIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
              <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
              <path d="M8 14v.5" />
              <path d="M16 14v.5" />
              <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
              <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
            </svg>
          </div>

          <h2>{title || "Welcome Back"}</h2>

          <p>{subtitle || "Sign in to continue your adoption journey"}</p>
        </div>

        {/* ERROR */}
        {loginError && (
          <div className={styles.errorMessage}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>

            {loginError}
          </div>
        )}

        {/* USERNAME */}
        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>

          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            className={styles.popupInput}
          />
        </div>

        {/* PASSWORD */}
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            className={styles.popupInput}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className={styles.popupLoginBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.loadingSpinner}></span>
          ) : (
            "Sign In"
          )}
        </button>

        {/* FOOTER */}
        <div className={styles.popupFooter}>
          <p>
            Don't have an account?
            <a href="/register"> Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPopup;
