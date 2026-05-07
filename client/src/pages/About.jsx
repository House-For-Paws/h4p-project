import { useEffect, useState } from "react";
import Navbar from "../Components/layout/Navbar";
import styles from "../styles/about.module.css";
import Footer from "../Components/layout/Footer";

const heroImages = [
  "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=700&fit=crop",
];

function About() {
  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(true);

useEffect(() => {
  const interval = setInterval(() => {
    setFade(false);

    setTimeout(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
      setFade(true);
    }, 500);
  }, 5000);

  return () => clearInterval(interval);
}, []);

  return (
    <>
      <Navbar />

      <div className={styles.aboutPage}>
        {/* Hero Section */}
        <section className={styles.aboutHero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>About Us</span>

            <h1 className={styles.heroTitle}>
              Every Pet Deserves a{" "}
              <span className={styles.highlight}>Loving Home</span>
            </h1>

            <p className={styles.heroSubtitle}>
              We connect compassionate people with pets in need, creating bonds
              that last a lifetime. Our mission is simple no pet left behind.
            </p>

            <div className={styles.heroStatsInline}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>1,200+</span>
                <span className={styles.statLabel}>Pets Adopted</span>
              </div>

              <div className={styles.statDivider}></div>

              <div className={styles.statItem}>
                <span className={styles.statNumber}>800+</span>
                <span className={styles.statLabel}>Happy Families</span>
              </div>

              <div className={styles.statDivider}></div>

              <div className={styles.statItem}>
                <span className={styles.statNumber}>150+</span>
                <span className={styles.statLabel}>Volunteers</span>
              </div>
            </div>
          </div>

          {/* HERO IMAGE */}
          <div className={styles.heroImageWrapper}>
            <div className={styles.heroImageCard}>
              <img
                src={heroImages[currentImage]}
                alt="Happy pets waiting for adoption"
                className={`${styles.heroImage} ${
                  fade ? styles.fadeIn : styles.fadeOut
                }`}
              />

              <div className={styles.imageBadge}>
                <span className={styles.badgeIcon}>❤️</span>
                <span>Waiting for you</span>
              </div>
            </div>

            <div className={`${styles.floatingCard} ${styles.card1}`}>
              <span className={styles.cardEmoji}>🐕</span>
              <span className={styles.cardText}>Dogs</span>
              <span className={styles.cardCount}>450+</span>
            </div>

            <div className={`${styles.floatingCard} ${styles.card2}`}>
              <span className={styles.cardEmoji}>🐈</span>
              <span className={styles.cardText}>Cats</span>
              <span className={styles.cardCount}>380+</span>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className={styles.aboutMission}>
          <div className={styles.missionHeader}>
            <span className={styles.sectionBadge}>Our Mission</span>

            <h2 className={styles.sectionTitle}>Building Forever Families</h2>
          </div>

          <div className={styles.missionGrid}>
            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>❤️</div>

              <h3>Rescue with Love</h3>

              <p>
                Our plan to the future is to partner with shelters across the
                country to rescue pets from difficult situations and give them a
                second chance at happiness.
              </p>
            </div>

            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>👨‍👩‍👧</div>

              <h3>Perfect Matches</h3>

              <p>
                Our careful matching process ensures every pet finds the right
                family and loving environment.
              </p>
            </div>

            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>🛡️</div>

              <h3>Trusted Community</h3>

              <p>
                Our plan is to build a caring community of pet lovers,
                volunteers, and adopters who believe every animal deserves a
                safe and loving home. Together, we create trusted connections
                that help pets find families they can truly belong to.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className={styles.aboutStory}>
          <div className={styles.storyImage}>
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=500&fit=crop"
              alt="Our team helping pets"
            />

            <div className={styles.storyBadge}>Since 2026</div>
          </div>

          <div className={styles.storyContent}>
            <span className={styles.sectionBadge}>Our Story</span>

            <h2 className={styles.sectionTitle}>
              From a Small Idea to a Big Movement
            </h2>

            <p className={styles.storyText}>
              What started as adopters struggling with platforms that weren’t
              truly built for pets and animal lovers soon became a bigger idea.
              We wanted to create a place designed with care, trust, and
              simplicity — a platform where finding a loving home for a pet
              feels natural, safe, and personal.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className={styles.aboutTeam}>
          <div className={styles.teamHeader}>
            <span className={styles.sectionBadge}>Our Team</span>
            <h2 className={styles.sectionTitle}>
              Meet the People Behind PetAdopt
            </h2>
            <p className={styles.teamSubtitle}>
              Passionate individuals dedicated to making a difference in the
              lives of pets and people alike.
            </p>
          </div>
          <div className={styles.teamGrid}>
            <div className={styles.teamCard}>
              <div className={styles.teamImage}>
                <img src="../../src/assets/CEO-pic.jpg" alt="David" />
                <div className={styles.teamSocials}>
                  <a href="#" aria-label="Twitter">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className={styles.teamInfo}>
                <h4>Amit Nosyav</h4>
                <p className={styles.teamRole}>Founder & CEO</p>
                <p className={styles.teamBio}>
                  Started House For Paws after rescuing his first cat, Mia.
                </p>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.teamImage}>
                <img src="../../src/assets/San-pic.png" alt="Sara" />
                <div className={styles.teamSocials}>
                  <a href="#" aria-label="Twitter">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className={styles.teamInfo}>
                <h4>Sandra Isakov</h4>
                <p className={styles.teamRole}>Adoption Coordinator</p>
                <p className={styles.teamBio}>
                  Matches families with their perfect furry companions.
                </p>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.teamImage}>
                <img
                  src="https://randomuser.me/api/portraits/men/50.jpg"
                  alt="Daniel"
                />
                <div className={styles.teamSocials}>
                  <a href="#" aria-label="Twitter">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className={styles.teamInfo}>
                <h4>Daniel Chen</h4>
                <p className={styles.teamRole}>Volunteer Lead</p>
                <p className={styles.teamBio}>
                  Coordinates our amazing community of volunteers.
                </p>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.teamImage}>
                <img
                  src="https://randomuser.me/api/portraits/women/68.jpg"
                  alt="Emma"
                />
                <div className={styles.teamSocials}>
                  <a href="#" aria-label="Twitter">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className={styles.teamInfo}>
                <h4>Emma Wilson</h4>
                <p className={styles.teamRole}>Veterinary Advisor</p>
                <p className={styles.teamBio}>
                  Ensures all pets are healthy before adoption.
                </p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
}

export default About;
