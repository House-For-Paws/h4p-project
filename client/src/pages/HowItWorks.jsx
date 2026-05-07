import { useState, useEffect } from "react";
import styles from "../styles/howitworks.module.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

const images = [
  "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&q=80",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&q=80",
  "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=1200&q=80",
  "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1200&q=80",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&q=80",
];

const steps = [
  {
    number: "01",
    title: "Create an Account",
    description: "Sign up and join our community of animal lovers.",
    route: "/register",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    number: "02",
    title: "Post a Pet",
    description: "Add a pet with details and photos for adoption.",
    route: "/create-post",
    icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    number: "03",
    title: "Connect",
    description: "People can contact you via phone or WhatsApp.",
    route: "/contact",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    number: "04",
    title: "Find a Home",
    description: "Help pets find a safe and loving forever home.",
    route: "/",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();

  const [currentImage, setCurrentImage] = useState(0);
  const [activeStep, setActiveStep] = useState(null);

  const [showPopup, setShowPopup] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToImage = (index) => {
    setCurrentImage(index);
  };

  const closePopup = () => {
    setShowPopup(false);
    setLoginError("");
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      const res = await login({ email: username, username, password });
      localStorage.setItem("token", res.data.token);
      setShowPopup(false);
      setUsername("");
      setPassword("");
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <>
      <Navbar />

      <div className={styles.hiwPage}>
        <section className={styles.hiwHero}>
          <div className={styles.hiwHeroContent}>
            <span className={styles.hiwBadge}>Simple Process</span>

            <h1 className={styles.hiwTitle}>Your Adoption Journey</h1>

            <p className={styles.hiwSubtitle}>
              Helping pets find loving homes in just a few simple steps
            </p>
          </div>
        </section>

        <section className={styles.hiwMain}>
          <div className={styles.hiwContainer}>
            <div className={styles.hiwCarousel}>
              <div className={styles.hiwCarouselInner}>
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Pet ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className={`${styles.hiwCarouselImage} ${
                      idx === currentImage ? styles.active : ""
                    }`}
                  />
                ))}

                <div className={styles.hiwCarouselOverlay} />
              </div>

              <div className={styles.hiwCarouselDots}>
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`${styles.hiwDot} ${
                      idx === currentImage ? styles.active : ""
                    }`}
                    onClick={() => goToImage(idx)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.hiwSteps}>
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`${styles.hiwStepCard} ${
                    activeStep === idx ? styles.active : ""
                  }`}
                  onClick={() => {
                    if (
                      step.title === "Post a Pet" &&
                      !localStorage.getItem("token")
                    ) {
                      setShowPopup(true);
                      return;
                    }

                    navigate(step.route);
                  }}
                  onMouseEnter={() => setActiveStep(idx)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  <div className={styles.hiwStepNumber}>{step.number}</div>

                  <div className={styles.hiwStepIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d={step.icon} />
                    </svg>
                  </div>

                  <h3 className={styles.hiwStepTitle}>{step.title}</h3>

                  <p className={styles.hiwStepDescription}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.hiwCta}>
          <div className={styles.hiwCtaContent}>
            <h2>Ready to Get Started?</h2>

            <p>
              Join thousands of happy pet owners and help animals find their
              forever homes.
            </p>

            <div className={styles.hiwCtaButtons}>
              <a href="/" className={styles.hiwBtnPrimary}>
                Browse Pets
              </a>

              <a href="/contact" className={styles.hiwBtnSecondary}>
                Contact Us
              </a>
            </div>
          </div>
        </section>

        {showPopup && (
          <div className={styles.popupOverlay} onClick={closePopup}>
            <div
              className={`${styles.popupBox} ${styles.popupAdopt}`}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={styles.closePopup} onClick={closePopup}>
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
              </span>

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
                <h2>Welcome Back</h2>
                <p>Sign in to adopt your new best friend</p>
              </div>

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

              <div className={styles.popupFooter}>
                <p>
                  {"Don't have an account? "}
                  <a href="/register">Create one</a>
                </p>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}
