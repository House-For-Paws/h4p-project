import { useState } from "react";
import "./contact.css";
import Navbar from "../components/layout/Navbar";
import { FaPaw } from "react-icons/fa";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
import Footer from "../components/layout/Footer";


function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      console.log({ name, email, message });
      setIsSubmitting(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      
      setTimeout(() => setSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <>
    <Navbar />
    <div className="contact-page">
      <div className="contact-container">
        {/* Left Side - Info */}
        <div className="contact-info">
          <span className="contact-badge">Get in Touch</span>
          <h1>
            Contact Us
            <svg className="paw-icon" viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
              <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </h1>

          <p className="contact-subtitle">
            Have questions or want to adopt a pet? We&apos;d love to hear from you!
          </p>

          <div className="info-cards">
            <a href="mailto:support@pawhome.com" className="info-card">
              <span className="info-icon">📧</span>
              <div className="info-content">
                <span className="info-label">Email</span>
                <span className="info-value">support@pawhome.com</span>
              </div>
            </a>

            <a href="tel:+972501234567" className="info-card">
              <span className="info-icon">📞</span>
              <div className="info-content">
                <span className="info-label">Phone</span>
                <span className="info-value">+972-50-123-4567</span>
              </div>
            </a>

            <a href="https://wa.me/972501234567" target="_blank" rel="noopener noreferrer" className="info-card">
              <span className="info-icon">💬</span>
              <div className="info-content">
                <span className="info-label">WhatsApp</span>
                <span className="info-value">+972-50-123-4567</span>
              </div>
            </a>
          </div>

          <div className="contact-hours">
            <h3>Working Hours</h3>
            <p>Sunday - Thursday: 9:00 AM - 6:00 PM</p>
            <p>Friday: 9:00 AM - 2:00 PM</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="contact-form-wrapper">
          <form onSubmit={handleSubmit} className="contact-form">
            <h2>Send us a message</h2>
            
            <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-group">
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
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Sending...
                </span>
              ) : submitted ? (
                <span className="btn-success">Message Sent!</span>
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