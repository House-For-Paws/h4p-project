/**
 * Contact page — simple support form that opens user's email client via mailto.
 */
import { useState } from "react";
import styles from "../styles/contact.module.css";
import Navbar from "../Components/layout/Navbar";
import { FaPaw } from "react-icons/fa";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
import Footer from "../Components/layout/Footer";


function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /** Build mailto URL and reset local form state. */
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    window.location.href = `mailto:support@pawhome.com?subject=${encodeURIComponent(
      `Message from ${name}`,
    )}&body=${encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`)}`;
    setIsSubmitting(false);
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <>
    <Navbar />
    <div className={styles.contactPage}>
      <div className={styles.contactContainer}>
        {/* Left Side - Info */}
        <div className={styles.contactInfo}>
          <span className={styles.contactBadge}>Get in Touch</span>
          <h1>
            Contact Us
            <FaPaw className={styles.contactPawIcon} />
          </h1>

          <p className={styles.contactSubtitle}>
            Have questions or want to adopt a pet? We&apos;d love to hear from you!
          </p>

          <div className={styles.infoCards}>
            <a href="mailto:support@pawhome.com" className={styles.infoCard}>
              <span className={styles.infoIcon}>📧</span>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>houseforpaws.info@gmail.com</span>
              </div>
            </a>

            <a href="tel:+972501234567" className={styles.infoCard}>
              <span className={styles.infoIcon}>📞</span>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>+972-544883203</span>
              </div>
            </a>

            <a href="https://wa.me/972501234567" target="_blank" rel="noopener noreferrer" className={styles.infoCard}>
              <span className={styles.infoIcon}>💬</span>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>WhatsApp</span>
                <span className={styles.infoValue}>+972-544883203</span>
              </div>
            </a>
          </div>

          <div className={styles.contactHours}>
            <h3>Working Hours</h3>
            <p>Sunday - Thursday: 9:00 AM - 6:00 PM</p>
            <p>Friday: 9:00 AM - 2:00 PM</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className={styles.contactFormWrapper}>
          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <h2>Send us a message</h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                placeholder="How can we help you?"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className={styles.btnLoading}>
                  <span className={styles.spinner}></span>
                  Sending...
                </span>
              ) : submitted ? (
                <span className={styles.btnSuccess}>Message Sent!</span>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </div>
      </div>
    <Footer />
    </div>
    
    </>
  );
}

export default Contact;
