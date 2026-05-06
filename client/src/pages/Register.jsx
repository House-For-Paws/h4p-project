import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import styles from "../styles/register.module.css";
import PawIcon from "../components/features/PawIcon";

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

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleRegister = async () => {
    if (!acceptedTerms) {
      alert("Please accept the terms and conditions");
      return;
    }
    // Add your registration logic here
    console.log("Registering:", formData);
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
                  I accept the{" "}
                  <a
                    href="/EULA.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.termsLink}
                  >
                    terms and conditions
                  </a>
                </span>
              </label>
            </div>

            <button className={styles.registerBtn} onClick={handleRegister}>
              <span>Create Account</span>
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
    </>
  );
}

export default Register;
