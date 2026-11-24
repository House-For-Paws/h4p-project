/**
 * =============================================================================
 * FILE: client/src/pages/Register.jsx
 * ROLE: Sign-up form + terms acceptance → POST /auth/register
 * =============================================================================
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { getPets } from "../services/userService";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import styles from "../styles/register.module.css";
import PawIcon from "../Components/features/PawIcon";
import TermsModal from "../Components/legal/TermsModal";
import { notifyAuthTokenChanged } from "../utils/authEvents";
import {
  REGISTER_REGEX,
  getRegisterFieldError,
  validateRegisterForm,
} from "../utils/registerValidation";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [showcaseImages, setShowcaseImages] = useState([]);
  const [imagePool, setImagePool] = useState([]);
  const [imageSwapTick, setImageSwapTick] = useState(0);
  const [petStats, setPetStats] = useState({
    availableNow: 128,
    newThisWeek: 24,
    happyTails: 780,
  });

  const navigate = useNavigate();
  const passwordLengthOk = formData.password.length >= 6;
  const passwordHasLetter = REGISTER_REGEX.passwordLetter.test(formData.password);
  const passwordHasNumber = REGISTER_REGEX.passwordNumber.test(formData.password);
  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  /** Returns an onChange callback for a specific field in formData. */
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (touched[field] || fieldErrors[field]) {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          [field]: getRegisterFieldError(field, value, next),
          ...(field === "password"
            ? {
                confirmPassword: getRegisterFieldError(
                  "confirmPassword",
                  next.confirmPassword,
                  next,
                ),
              }
            : {}),
        }));
      }
      return next;
    });
    setFormError("");
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      [field]: getRegisterFieldError(field, formData[field], formData),
    }));
  };

  const inputClass = (field) =>
    `${styles.input}${fieldErrors[field] ? ` ${styles.inputInvalid}` : ""}`;

  const pickRandomImages = (images, count = 4) =>
    [...images].sort(() => Math.random() - 0.5).slice(0, count);

  useEffect(() => {
    let active = true;

    const loadShowcaseImages = async () => {
      try {
        const res = await getPets();
        const pets = Array.isArray(res.data) ? res.data : [];
        const validImages = pets
          .map((pet) => String(pet?.image || "").trim())
          .filter(Boolean);

        const now = Date.now();
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        const availableNow = pets.filter(
          (pet) => String(pet?.status || "").toLowerCase() === "available",
        ).length;
        const newThisWeek = pets.filter((pet) => {
          const createdAt = new Date(pet?.createdAt || 0).getTime();
          return createdAt && now - createdAt <= oneWeekMs;
        }).length;
        const happyTails = Math.max(availableNow * 3 + newThisWeek * 5, 120);

        if (active) {
          setImagePool(validImages);
          setShowcaseImages(pickRandomImages(validImages));
          setPetStats({
            availableNow: availableNow || 128,
            newThisWeek: newThisWeek || 24,
            happyTails,
          });
        }
      } catch (error) {
        if (active) {
          setShowcaseImages([]);
        }
      }
    };

    loadShowcaseImages();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (imagePool.length <= 4) {
      return undefined;
    }

    const rotation = setInterval(() => {
      setShowcaseImages(pickRandomImages(imagePool));
      setImageSwapTick((prev) => prev + 1);
    }, 4800);

    return () => clearInterval(rotation);
  }, [imagePool]);

  /** Submits registration after regex + terms checks. */
  const handleRegister = async () => {
    const errors = validateRegisterForm(formData);
    setFieldErrors(errors);
    setTouched({
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      phoneNumber: true,
    });

    if (Object.keys(errors).length) {
      setFormError("Please fix the highlighted fields before continuing.");
      return;
    }

    if (!acceptedTerms) {
      setTermsModalOpen(true);
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await register({ ...formData });
      localStorage.setItem("token", res.data.token);
      notifyAuthTokenChanged();
      navigate("/profile");
    } catch (err) {
      setFormError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.registerContainer}>
        <div className={styles.decorativeBackground} aria-hidden="true">
          <div className={`${styles.testimonialBubble} ${styles.testimonialOne}`}>
            <p>"We adopted Luna in just 4 days. Best decision ever."</p>
            <span>- Maya & Luna</span>
          </div>
          <div className={`${styles.testimonialBubble} ${styles.testimonialTwo}`}>
            <p>"The process felt safe and super clear from day one."</p>
            <span>- Daniel, volunteer</span>
          </div>

          <div className={`${styles.statCard} ${styles.statCardOne}`}>
            <p className={styles.statValue}>{petStats.availableNow}</p>
            <p className={styles.statLabel}>Available now</p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardTwo}`}>
            <p className={styles.statValue}>{petStats.newThisWeek}</p>
            <p className={styles.statLabel}>New this week</p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardThree}`}>
            <p className={styles.statValue}>{petStats.happyTails}+</p>
            <p className={styles.statLabel}>Happy tails</p>
          </div>

          {showcaseImages[0] && (
            <div className={`${styles.animalChip} ${styles.animalChipOne}`}>
              <img
                key={`${showcaseImages[0]}-${imageSwapTick}-1`}
                src={showcaseImages[0]}
                alt=""
                loading="lazy"
                className={styles.animalChipImage}
              />
            </div>
          )}
          {showcaseImages[1] && (
            <div className={`${styles.animalChip} ${styles.animalChipTwo}`}>
              <img
                key={`${showcaseImages[1]}-${imageSwapTick}-2`}
                src={showcaseImages[1]}
                alt=""
                loading="lazy"
                className={styles.animalChipImage}
              />
            </div>
          )}
          {showcaseImages[2] && (
            <div className={`${styles.animalChip} ${styles.animalChipThree}`}>
              <img
                key={`${showcaseImages[2]}-${imageSwapTick}-3`}
                src={showcaseImages[2]}
                alt=""
                loading="lazy"
                className={styles.animalChipImage}
              />
            </div>
          )}
          {showcaseImages[3] && (
            <div className={`${styles.animalChip} ${styles.animalChipFour}`}>
              <img
                key={`${showcaseImages[3]}-${imageSwapTick}-4`}
                src={showcaseImages[3]}
                alt=""
                loading="lazy"
                className={styles.animalChipImage}
              />
            </div>
          )}
        </div>

        <div className={styles.registerCard}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <PawIcon className={styles.pawIcon} />
            </div>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>
              Join our community and help pets find a home
            </p>
            <p className={styles.headerHint}>
              It only takes a minute to start helping paws in need.
            </p>
          </div>

          <div className={styles.formContent}>
            <div className={styles.formTopRow}>
              <p className={styles.formSectionLabel}>Account details</p>
              <p className={styles.formRequiredHint}>* required fields</p>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>First Name *</label>
                <input
                  type="text"
                  className={inputClass("firstName")}
                  placeholder="Your first name"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  onBlur={handleBlur("firstName")}
                  required
                />
                {fieldErrors.firstName && (
                  <p className={styles.fieldError}>{fieldErrors.firstName}</p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Last Name *</label>
                <input
                  type="text"
                  className={inputClass("lastName")}
                  placeholder="Your last name"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  onBlur={handleBlur("lastName")}
                  required
                />
                {fieldErrors.lastName && (
                  <p className={styles.fieldError}>{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Username *</label>
              <input
                type="text"
                className={inputClass("username")}
                placeholder="CatOwner123"
                value={formData.username}
                onChange={handleChange("username")}
                onBlur={handleBlur("username")}
                required
              />
              {fieldErrors.username && (
                <p className={styles.fieldError}>{fieldErrors.username}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email *</label>
              <input
                type="email"
                className={inputClass("email")}
                placeholder="CatOwner123@gmail.com"
                value={formData.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                required
              />
              {fieldErrors.email && (
                <p className={styles.fieldError}>{fieldErrors.email}</p>
              )}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Password *</label>
                <input
                  type="password"
                  className={inputClass("password")}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange("password")}
                  onBlur={handleBlur("password")}
                  required
                />
                {fieldErrors.password && (
                  <p className={styles.fieldError}>{fieldErrors.password}</p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Confirm Password *</label>
                <input
                  type="password"
                  className={inputClass("confirmPassword")}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  required
                />
                {fieldErrors.confirmPassword && (
                  <p className={styles.fieldError}>
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
            <div className={styles.passwordHelperCard}>
              <p className={styles.passwordHint}>
                Use at least 6 characters, including letters and numbers.
              </p>
              <div className={styles.passwordChecks}>
                <span
                  className={`${styles.passwordCheck} ${
                    passwordLengthOk ? styles.passwordCheckOk : ""
                  }`}
                >
                  {passwordLengthOk ? "✓" : "•"} 6+ characters
                </span>
                <span
                  className={`${styles.passwordCheck} ${
                    passwordHasLetter ? styles.passwordCheckOk : ""
                  }`}
                >
                  {passwordHasLetter ? "✓" : "•"} Letter
                </span>
                <span
                  className={`${styles.passwordCheck} ${
                    passwordHasNumber ? styles.passwordCheckOk : ""
                  }`}
                >
                  {passwordHasNumber ? "✓" : "•"} Number
                </span>
                <span
                  className={`${styles.passwordCheck} ${
                    passwordsMatch ? styles.passwordCheckOk : ""
                  }`}
                >
                  {passwordsMatch ? "✓" : "•"} Passwords match
                </span>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Phone Number</label>
                <input
                  type="tel"
                  className={inputClass("phoneNumber")}
                  placeholder="+972 50-000-0000"
                  value={formData.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                  onBlur={handleBlur("phoneNumber")}
                />
                {fieldErrors.phoneNumber && (
                  <p className={styles.fieldError}>{fieldErrors.phoneNumber}</p>
                )}
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

            {formError && <p className={styles.formError}>{formError}</p>}

            <button
              className={styles.registerBtn}
              onClick={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.btnSpinner} aria-hidden="true"></span>
                  <span>Creating your account...</span>
                </>
              ) : (
                <>
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
                </>
              )}
            </button>

            <p className={styles.loginLink}>
              Already have an account?{" "}
              <button
                type="button"
                className={styles.loginLinkText}
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.joinedStrip}>
        <div className={styles.joinedAvatars} aria-hidden="true">
          <span className={styles.joinedAvatar}>M</span>
          <span className={styles.joinedAvatar}>A</span>
          <span className={styles.joinedAvatar}>R</span>
          <span className={styles.joinedAvatar}>L</span>
          <span className={styles.joinedAvatar}>K</span>
        </div>
        <p className={styles.joinedText}>
          <strong>+142 adopters</strong> joined this week
        </p>
      </div>
      <div className={styles.trustStrip}>
        <span>Verified shelters</span>
        <span>Safe adoption</span>
        <span>Community support</span>
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
