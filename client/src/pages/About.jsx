import Navbar from "../Components/layout/Navbar";
import "./about.css";
import Footer from "../Components/layout/Footer";

function About() {
  return (
    <>
      <Navbar />
      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-content">
            <span className="hero-badge">About Us</span>
            <h1 className="hero-title">
              Every Pet Deserves a{" "}
              <span className="highlight">Loving Home</span>
            </h1>
            <p className="hero-subtitle">
              We connect compassionate people with pets in need, creating bonds
              that last a lifetime. Our mission is simple: no pet left behind.
            </p>
            <div className="hero-stats-inline">
              <div className="stat-item">
                <span className="stat-number">1,200+</span>
                <span className="stat-label">Pets Adopted</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">800+</span>
                <span className="stat-label">Happy Families</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">150+</span>
                <span className="stat-label">Volunteers</span>
              </div>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=600&h=700&fit=crop"
                alt="Happy pets waiting for adoption"
              />
              <div className="image-badge">
                <span className="badge-icon">❤️</span>
                <span>Waiting for you</span>
              </div>
            </div>
            <div className="floating-card card-1">
              <span className="card-emoji">🐕</span>
              <span className="card-text">Dogs</span>
              <span className="card-count">450+</span>
            </div>
            <div className="floating-card card-2">
              <span className="card-emoji">🐈</span>
              <span className="card-text">Cats</span>
              <span className="card-count">380+</span>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-mission">
          <div className="mission-header">
            <span className="section-badge">Our Mission</span>
            <h2 className="section-title">Why We Do What We Do</h2>
          </div>
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">
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
            <div className="mission-card">
              <div className="mission-icon">
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
            <div className="mission-card">
              <div className="mission-icon">
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
        <section className="about-story">
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=500&fit=crop"
              alt="Our team helping pets"
            />
            <div className="story-badge">Since 2018</div>
          </div>
          <div className="story-content">
            <span className="section-badge">Our Story</span>
            <h2 className="section-title">
              From a Small Idea to a Big Movement
            </h2>
            <p className="story-text">
              What started as a weekend volunteer project has grown into a
              thriving community of pet lovers, dedicated volunteers, and happy
              families. We believe that every animal deserves love, care, and a
              safe place to call home.
            </p>
            <p className="story-text">
              Today, we work with over 50 partner shelters, have a network of
              150+ active volunteers, and have successfully placed more than
              1,200 pets in loving homes.
            </p>
            <div className="story-features">
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span>Verified shelters only</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span>Full health screening</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span>Post-adoption support</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span>Community events</span>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-team">
          <div className="team-header">
            <span className="section-badge">Our Team</span>
            <h2 className="section-title">Meet the People Behind PetAdopt</h2>
            <p className="team-subtitle">
              Passionate individuals dedicated to making a difference in the
              lives of pets and people alike.
            </p>
          </div>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-image">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="David"
                />
                <div className="team-socials">
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
              <div className="team-info">
                <h4>David Martinez</h4>
                <p className="team-role">Founder & CEO</p>
                <p className="team-bio">
                  Started PetAdopt after rescuing his first dog, Max.
                </p>
              </div>
            </div>
            <div className="team-card">
              <div className="team-image">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Sara"
                />
                <div className="team-socials">
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
              <div className="team-info">
                <h4>Sara Johnson</h4>
                <p className="team-role">Adoption Coordinator</p>
                <p className="team-bio">
                  Matches families with their perfect furry companions.
                </p>
              </div>
            </div>
            <div className="team-card">
              <div className="team-image">
                <img
                  src="https://randomuser.me/api/portraits/men/50.jpg"
                  alt="Daniel"
                />
                <div className="team-socials">
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
              <div className="team-info">
                <h4>Daniel Chen</h4>
                <p className="team-role">Volunteer Lead</p>
                <p className="team-bio">
                  Coordinates our amazing community of volunteers.
                </p>
              </div>
            </div>
            <div className="team-card">
              <div className="team-image">
                <img
                  src="https://randomuser.me/api/portraits/women/68.jpg"
                  alt="Emma"
                />
                <div className="team-socials">
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
              <div className="team-info">
                <h4>Emma Wilson</h4>
                <p className="team-role">Veterinary Advisor</p>
                <p className="team-bio">
                  Ensures all pets are healthy before adoption.
                </p>
              </div>
            </div>
          </div>
        </section>

      
      </div>
      <Footer />
    </>
  );
}

export default About;
