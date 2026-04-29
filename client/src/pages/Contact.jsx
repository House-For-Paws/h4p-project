import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import "./contact.css";
import { FaPaw } from "react-icons/fa";

function Contact() {
  // state לשדות
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // שליחה (כרגע רק הדפסה)
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({ name, email, message });

    alert("Message sent!");
  };

  return (
    <>
      <Navbar />
    
      <div className="contact-container">
        {/* צד שמאל */}
        <div className="contact-info">
          <h1>Contact Us <FaPaw className="paw-icon" /></h1>

          <p>
            Have questions or want to adopt a pet? We’d love to hear from you!
          </p>

          <div className="info-box">
            <p>📧 Email: support@pawhome.com</p>
            <p>📞 Phone: +972-50-123-4567</p>
            <p>💬 WhatsApp: +972-50-123-4567</p>
          </div>
        </div>

        {/* צד ימין */}
        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your name"
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <textarea
              placeholder="Your message..."
              rows="5"
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Contact;
