import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import "./howItWorks.css";
import { FaPaw } from "react-icons/fa";

function HowItWorks() {
  const images = [
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
    "https://images.unsplash.com/photo-1560807707-8cc77767d783",
    "https://images.unsplash.com/photo-1518717758536-85ae29035b6d",
    "https://images.unsplash.com/photo-1574158622682-e40e69881006",
    "https://images.unsplash.com/photo-1543852786-1cf6624b9987",
    "https://images.unsplash.com/photo-1534361960057-19889db9621e",
    "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb",
    "https://images.unsplash.com/photo-1507149833265-60c372daea22",
    "https://images.unsplash.com/photo-1598137263129-bc7f5a13b1ef",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const next = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Navbar />

      <div className="how-container">
        {/* header */}
        <div className="how-header">
          <h1>
            How does it Work <FaPaw className="HIW-paw-icon" />
          </h1>
          <p>Helping pets find loving homes in just a few simple steps</p>
        </div>

        {/* 🔥 carousel */}
        <div className="carousel">
          {/* 🔥 תמונה חייבת להיות ראשונה */}
          <img src={images[index]} alt="pet" />

          {/* 🔥 overlay */}
          <div className="carousel-overlay"></div>

          {/* 🔥 steps מעל */}
          <div className="steps">
            <div className="step-card">
              <div className="icon">📝</div>
              <h3>Create an Account</h3>
              <p>Sign up and join our community of animal lovers.</p>
            </div>

            <div className="step-card">
              <div className="icon">📸</div>
              <h3>Post a Pet</h3>
              <p>Add a pet with details and photos for adoption.</p>
            </div>

            <div className="step-card">
              <div className="icon">💬</div>
              <h3>Connect</h3>
              <p>People can contact you via phone or WhatsApp.</p>
            </div>

            <div className="step-card">
              <div className="icon">🏠</div>
              <h3>Find a Home</h3>
              <p>Help pets find a safe and loving forever home.</p>
            </div>
          </div>

          
          
        </div>
      </div>
    </>
  );
}

export default HowItWorks;
