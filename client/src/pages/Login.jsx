/**
 * Login page — authenticates user and stores JWT in localStorage.
 * Includes accessible forgot-password modal and friendly inline feedback.
 */
import { useEffect, useRef, useState } from "react";
import { forgotPassword, login } from "../services/authService";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import styles from "../styles/login.module.css";
import {
  FaPaw,
  FaGoogle,
  FaFacebook,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { notifyAuthTokenChanged } from "../utils/authEvents";

function Login() {
  const rememberedEmail = localStorage.getItem("h4pRememberedEmail") || "";

  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [socialMessage, setSocialMessage] = useState("");

  const navigate = useNavigate();
  const passwordInputRef = useRef(null);
  const modalRef = useRef(null);
  const resetEmailInputRef = useRef(null);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = isEmailValid && password.trim().length >= 6 && !isLoggingIn;

  useEffect(() => {
    if (!socialMessage) {
      return undefined;
    }
    const toastTimer = setTimeout(() => setSocialMessage(""), 2200);
    return () => clearTimeout(toastTimer);
  }, [socialMessage]);

  useEffect(() => {
    if (!showForgotModal) {
      return undefined;
    }

    requestAnimationFrame(() => resetEmailInputRef.current?.focus());

    const handleModalKeys = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeForgotModal();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusable = Array.from(
        modalRef.current.querySelectorAll(
          'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleModalKeys);
    return () => document.removeEventListener("keydown", handleModalKeys);
  }, [showForgotModal]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setLoginError("Please enter a valid email and password.");
      return;
    }

    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await login({ email, password });

      localStorage.setItem("token", res.data.token);
      if (rememberMe) {
        localStorage.setItem("h4pRememberedEmail", email.trim());
      } else {
        localStorage.removeItem("h4pRememberedEmail");
      }
      notifyAuthTokenChanged();
      navigate("/profile");
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setResetMessage("");
    setResetError("");
    setResetEmail(email || "");
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetLoading(false);
    setResetMessage("");
    setResetError("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage("");
    setResetError("");

    try {
      const res = await forgotPassword({
        email: resetEmail,
        newPassword,
        confirmNewPassword,
      });
      setResetMessage(
        res.data?.message || "Password reset successful. You can now log in.",
      );
      setEmail(resetEmail);
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        closeForgotModal();
        passwordInputRef.current?.focus();
      }, 1600);
    } catch (err) {
      setResetError(err.response?.data?.message || "Could not reset password");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    setSocialMessage(`${provider} login coming soon`);
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.pageContainer}>
          <div className={styles.loginContainer}>
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

            <div className={styles.loginRight}>
              <div className={styles.loginCard}>
                <h2>Login</h2>
                <p className={styles.subtitle}>We’re happy to see you again!</p>

                <form onSubmit={handleLogin}>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <div className={styles.passwordFieldWrap}>
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className={styles.passwordActions}>
                    <label className={styles.remember}>
                      <input
                        type="checkbox"
                        className={styles.rememberInput}
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        aria-label="Remember me"
                      />
                      <span className={styles.rememberPaw} aria-hidden="true">
                        <FaPaw />
                      </span>
                      <span className={styles.rememberText}>Remember me</span>
                    </label>

                    <button
                      type="button"
                      className={styles.forgot}
                      onClick={openForgotModal}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {loginError && <p className={styles.loginError}>{loginError}</p>}

                  <button
                    type="submit"
                    className={styles.loginBtn}
                    disabled={!canSubmit}
                  >
                    {isLoggingIn ? "Signing in..." : "Login"}
                  </button>
                </form>

                <p className={styles.divider}>or continue with</p>

                <div className={styles.socials}>
                  <button type="button" onClick={() => handleSocialClick("Google")}>
                    <FaGoogle /> Google
                  </button>
                  <button type="button" onClick={() => handleSocialClick("Facebook")}>
                    <FaFacebook /> Facebook
                  </button>
                </div>

                <p className={styles.signupText}>
                  Don’t have an account?{" "}
                  <span onClick={() => navigate("/register")}>Sign up</span>
                </p>
              </div>
            </div>
            <div className={styles.loginSupportStrip}>
              <p>
                Need help accessing your account?{" "}
                <a href="mailto:houseforpaws.info@gmail.com">Contact support</a>
              </p>
              <span
                role="button"
                tabIndex={0}
                onClick={() => navigate("/eula")}
                onKeyDown={(e) => e.key === "Enter" && navigate("/eula")}
              >
                Terms & Conditions
              </span>
            </div>
          </div>
        </div>
      </div>

      {showForgotModal && (
        <div className={styles.resetOverlay} onClick={closeForgotModal}>
          <div
            ref={modalRef}
            className={styles.resetModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
          >
            <button
              type="button"
              className={styles.resetClose}
              onClick={closeForgotModal}
              aria-label="Close reset password dialog"
            >
              ×
            </button>
            <div className={styles.resetHeader}>
              <span className={styles.resetBadge} aria-hidden="true">
                <FaShieldAlt />
              </span>
              <h3 id="reset-password-title">Reset your password</h3>
            </div>
            <p className={styles.resetSubtitle}>
              Enter your account email and choose a new password.
            </p>
            <form onSubmit={handleResetPassword}>
              <input
                ref={resetEmailInputRef}
                type="email"
                placeholder="Email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
              <p className={styles.resetHint}>
                Use at least 6 characters so your account stays secure.
              </p>

              {resetError && <p className={styles.resetError}>{resetError}</p>}
              {resetMessage && (
                <p className={styles.resetSuccess}>{resetMessage}</p>
              )}

              <div className={styles.resetActions}>
                <button
                  type="button"
                  className={styles.resetCancelBtn}
                  onClick={closeForgotModal}
                  disabled={resetLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.resetSubmitBtn}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {socialMessage && <div className={styles.socialToast}>{socialMessage}</div>}
      <Footer />
    </>
  );
}

export default Login;
