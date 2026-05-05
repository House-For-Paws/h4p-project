import { useState, useEffect } from "react";
import styles from "../styles/howitworks.module.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

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
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    number: "02",
    title: "Post a Pet",
    description: "Add a pet with details and photos for adoption.",
    icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    number: "03",
    title: "Connect",
    description: "People can contact you via phone or WhatsApp.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    number: "04",
    title: "Find a Home",
    description: "Help pets find a safe and loving forever home.",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
];

export default function HowItWorks() {
  const [currentImage, setCurrentImage] = useState(0);
  const [activeStep, setActiveStep] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToImage = (index) => {
    setCurrentImage(index);
  };

  return (
    <>
      <Navbar />
      <div className={styles.hiwPage}>
        {/* Hero Section */}
        <section className={styles.hiwHero}>
          <div className={styles.hiwHeroContent}>
            <span className={styles.hiwBadge}>Simple Process</span>
            <h1 className={styles.hiwTitle}>How It Works</h1>
            <p className={styles.hiwSubtitle}>
              Helping pets find loving homes in just a few simple steps
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className={styles.hiwMain}>
          <div className={styles.hiwContainer}>
            {/* Carousel */}
            <div className={styles.hiwCarousel}>
              <div className={styles.hiwCarouselInner}>
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Pet ${idx + 1}`}
                    className={`${styles.hiwCarouselImage} ${idx === currentImage ? styles.active : ""}`}
                  />
                ))}
                <div className={styles.hiwCarouselOverlay} />
              </div>

              {/* Dots */}
              <div className={styles.hiwCarouselDots}>
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`${styles.hiwDot} ${idx === currentImage ? styles.active : ""}`}
                    onClick={() => goToImage(idx)}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className={styles.hiwSteps}>
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`${styles.hiwStepCard} ${activeStep === idx ? styles.active : ""}`}
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={step.icon} />
                    </svg>
                  </div>
                  <h3 className={styles.hiwStepTitle}>{step.title}</h3>
                  <p className={styles.hiwStepDescription}>{step.description}</p>
                  <div className={styles.hiwStepConnector} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.hiwCta}>
          <div className={styles.hiwCtaContent}>
            <h2>Ready to Get Started?</h2>
            <p>
              Join thousands of happy pet owners and help animals find their
              forever homes.
            </p>
            <div className={styles.hiwCtaButtons}>
              <a href="/pets" className={styles.hiwBtnPrimary}>
                Browse Pets
              </a>
              <a href="/contact" className={styles.hiwBtnSecondary}>
                Contact Us
              </a>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
}
