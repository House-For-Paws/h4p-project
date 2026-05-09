/**
 * Registration page — collects profile/account fields and creates user.
 * Includes Terms modal flow: user can open terms and must accept before submit.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import styles from "../styles/register.module.css";
import PawIcon from "../Components/features/PawIcon";
import TermsModal from "../Components/legal/TermsModal";
import { notifyAuthTokenChanged } from "../utils/authEvents";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    birthday: "",
    firstName: "",
    lastName: "",
    gender: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  /** Returns an onChange callback for a specific field in formData. */
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  /** Submits registration after terms acceptance check. */
  const handleRegister = async () => {
    if (!acceptedTerms) {
      setTermsModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register({ ...formData });
      localStorage.setItem("token", res.data.token);
      notifyAuthTokenChanged();
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.registerContainer}>
        <div className={styles.decorativeBackground}></div>

        <div className={styles.registerCard}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <PawIcon className={styles.pawIcon} />
            </div>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>
              Join our community and help pets find a home
            </p>
          </div>

          <div className={styles.formContent}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>First Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Your first name"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Last Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Your last name"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Username</label>
              <input
                type="text"
                className={styles.input}
                placeholder="CatOwner123"
                value={formData.username}
                onChange={handleChange("username")}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="CatOwner123@gmail.com"
                value={formData.email}
                onChange={handleChange("email")}
              />
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Password</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange("password")}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Confirm Password</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                />
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Phone Number</label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Birthday</label>
                <input
                  type="date"
                  className={styles.input}
                  value={formData.birthday}
                  onChange={handleChange("birthday")}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Gender</label>
              <select
                className={styles.input}
                value={formData.gender}
                onChange={handleChange("gender")}
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className={styles.eulaAcceptContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span className={styles.checkboxCustom}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span className={styles.checkboxText}>
                  I agree to the{" "}
                  <button
                    type="button"
                    className={styles.termsLink}
                    onClick={() => setTermsModalOpen(true)}
                  >
                    terms and conditions
                  </button>
                </span>
              </label>
            </div>

            <button
              className={styles.registerBtn}
              onClick={handleRegister}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "Creating..." : "Create Account"}</span>
              <svg
                className={styles.btnIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <p className={styles.loginLink}>
              Already have an account?{" "}
              <a href="/login" className={styles.loginLinkText}>
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />
    </>
  );
}

export default Register;
