import Navbar from "../Components/layout/Navbar";
import styles from "../styles/about.module.css";
import Footer from "../Components/layout/Footer";

function About() {
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
              that last a lifetime. Our mission is simple: no pet left behind.
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
          <div className={styles.heroImageWrapper}>
            <div className={styles.heroImageCard}>
              <img
                src="https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=600&h=700&fit=crop"
                alt="Happy pets waiting for adoption"
              />
              <div className={styles.imageBadge}>
                <span className={styles.badgeIcon}>❤️</span>
                <span>Waiting for you</span>
              </div>
            </div>
            <div className={styles.floatingCard + ' ' + styles.card1}>
              <span className={styles.cardEmoji}>🐕</span>
              <span className={styles.cardText}>Dogs</span>
              <span className={styles.cardCount}>450+</span>
            </div>
            <div className={styles.floatingCard + ' ' + styles.card2}>
              <span className={styles.cardEmoji}>🐈</span>
              <span className={styles.cardText}>Cats</span>
              <span className={styles.cardCount}>380+</span>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className={styles.aboutMission}>
          <div className={styles.missionHeader}>
            <span className={styles.sectionBadge}>Our Mission</span>
            <h2 className={styles.sectionTitle}>Why We Do What We Do</h2>
          </div>
          <div className={styles.missionGrid}>
            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3>Rescue with Love</h3>
              <p>
                We partner with shelters across the country to rescue pets from
                difficult situations and give them a second chance at happiness.
              </p>
            </div>
            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Perfect Matches</h3>
              <p>
                Our careful matching process ensures every pet finds the right
                family, considering lifestyle, space, and personality
                compatibility.
              </p>
            </div>
            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Lifetime Support</h3>
              <p>
                Adoption is just the beginning. We provide ongoing resources,
                training tips, and veterinary support for all our adopters.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className={styles.aboutStory}>
          <div className={styles.storyImage}>
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=500&fit=crop"
              alt="Our team helping pets"
            />
            <div className={styles.storyBadge}>Since 2018</div>
          </div>
          <div className={styles.storyContent}>
            <span className={styles.sectionBadge}>Our Story</span>
            <h2 className={styles.sectionTitle}>
              From a Small Idea to a Big Movement
            </h2>
            <p className={styles.storyText}>
              What started as a weekend volunteer project has grown into a
              thriving community of pet lovers, dedicated volunteers, and happy
              families. We believe that every animal deserves love, care, and a
              safe place to call home.
            </p>
            <p className={styles.storyText}>
              Today, we work with over 50 partner shelters, have a network of
              150+ active volunteers, and have successfully placed more than
              1,200 pets in loving homes.
            </p>
            <div className={styles.storyFeatures}>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Verified shelters only</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Full health screening</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Post-adoption support</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Community events</span>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className={styles.aboutTeam}>
          <div className={styles.teamHeader}>
            <span className={styles.sectionBadge}>Our Team</span>
            <h2 className={styles.sectionTitle}>Meet the People Behind PetAdopt</h2>
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
