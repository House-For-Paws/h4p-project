/**
 * =============================================================================
 * FILE: client/src/pages/Login.jsx
 * ROLE: Login + forgot-password modal; stores JWT in localStorage
 * =============================================================================
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
import {
  getLoginFieldError,
  isLoginIdentifierValid,
  isLoginPasswordValid,
  validateForgotPasswordForm,
  validateLoginForm,
} from "../utils/loginValidation";

function Login() {
  const rememberedEmail = localStorage.getItem("h4pRememberedEmail") || "";

  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [banNotice, setBanNotice] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetFieldErrors, setResetFieldErrors] = useState({});
  const [socialMessage, setSocialMessage] = useState("");

  const navigate = useNavigate();
  const passwordInputRef = useRef(null);
  const modalRef = useRef(null);
  const resetEmailInputRef = useRef(null);

  const canSubmit =
    isLoginIdentifierValid(email) &&
    isLoginPasswordValid(password) &&
    !isLoggingIn;

  const updateFieldError = (field, value, extra = {}) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: getLoginFieldError(field, value, { email, password, ...extra }),
    }));
  };

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
    const errors = validateLoginForm({ email, password });
    setFieldErrors(errors);
    setTouched({ email: true, password: true });

    if (Object.keys(errors).length) {
      setLoginError("Please fix the highlighted fields before signing in.");
      return;
    }

    setLoginError("");
    setBanNotice(null);
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
      const data = err.response?.data;
      if (data?.banned) {
        setBanNotice({
          reason: data.banReason || "Not specified",
          description: data.banDescription || "",
        });
        setLoginError("");
      } else {
        setBanNotice(null);
        setLoginError(data?.message || "Login failed");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setResetMessage("");
    setResetError("");
    setResetFieldErrors({});
    setResetEmail(email || "");
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetLoading(false);
    setResetMessage("");
    setResetError("");
    setResetFieldErrors({});
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errors = validateForgotPasswordForm({
      resetEmail,
      newPassword,
      confirmNewPassword,
    });
    setResetFieldErrors(errors);

    if (Object.keys(errors).length) {
      setResetError("Please fix the highlighted fields.");
      return;
    }

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
                    type="text"
                    placeholder="Email or username"
                    value={email}
                    className={fieldErrors.email ? styles.inputInvalid : undefined}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);
                      setLoginError("");
                      setBanNotice(null);
                      if (touched.email || fieldErrors.email) {
                        updateFieldError("email", value);
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, email: true }));
                      updateFieldError("email", email);
                    }}
                  />
                  {fieldErrors.email && (
                    <p className={styles.fieldError}>{fieldErrors.email}</p>
                  )}

                  <div className={styles.passwordFieldWrap}>
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      className={
                        fieldErrors.password ? styles.inputInvalid : undefined
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setPassword(value);
                        setLoginError("");
                        setBanNotice(null);
                        if (touched.password || fieldErrors.password) {
                          updateFieldError("password", value);
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, password: true }));
                        updateFieldError("password", password);
                      }}
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
                  {fieldErrors.password && (
                    <p className={styles.fieldError}>{fieldErrors.password}</p>
                  )}

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

                  {banNotice && (
                    <div className={styles.banNotice} role="alert">
                      <strong>This account has been banned</strong>
                      <p>
                        <span>Reason:</span> {banNotice.reason}
                      </p>
                      {banNotice.description ? (
                        <p className={styles.banDescription}>
                          {banNotice.description}
                        </p>
                      ) : null}
                      <p className={styles.banSupport}>
                        Contact support if you think this is a mistake.
                      </p>
                    </div>
                  )}

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
                className={
                  resetFieldErrors.resetEmail ? styles.inputInvalid : undefined
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setResetEmail(value);
                  setResetError("");
                  setResetFieldErrors((prev) => ({
                    ...prev,
                    resetEmail: getLoginFieldError("resetEmail", value),
                  }));
                }}
                required
              />
              {resetFieldErrors.resetEmail && (
                <p className={styles.fieldError}>{resetFieldErrors.resetEmail}</p>
              )}
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                className={
                  resetFieldErrors.newPassword ? styles.inputInvalid : undefined
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setNewPassword(value);
                  setResetError("");
                  setResetFieldErrors((prev) => ({
                    ...prev,
                    newPassword: getLoginFieldError("newPassword", value),
                    confirmNewPassword: getLoginFieldError(
                      "confirmNewPassword",
                      confirmNewPassword,
                      { newPassword: value },
                    ),
                  }));
                }}
                required
              />
              {resetFieldErrors.newPassword && (
                <p className={styles.fieldError}>
                  {resetFieldErrors.newPassword}
                </p>
              )}
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                className={
                  resetFieldErrors.confirmNewPassword
                    ? styles.inputInvalid
                    : undefined
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setConfirmNewPassword(value);
                  setResetError("");
                  setResetFieldErrors((prev) => ({
                    ...prev,
                    confirmNewPassword: getLoginFieldError(
                      "confirmNewPassword",
                      value,
                      { newPassword },
                    ),
                  }));
                }}
                required
              />
              {resetFieldErrors.confirmNewPassword && (
                <p className={styles.fieldError}>
                  {resetFieldErrors.confirmNewPassword}
                </p>
              )}
              <p className={styles.resetHint}>
                Use at least 6 characters with letters and numbers.
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
