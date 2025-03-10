import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import featureIcon1 from "./assets/feature1.png";
import featureIcon2 from "./assets/feature2.png";
import featureIcon3 from "./assets/feature3.png";
import review1 from "./assets/review.jpg";
import review2 from "./assets/review2.jpg";
import review3 from "./assets/review3.jpg";
import review4 from "./assets/review4.png";
import Logo from "./components/Logo";

const reviews = [
  { name: "Sarah Johnson", image: review1, text: "★★★★★ This app changed how I track my expenses!" },
  { name: "Michael Brown", image: review2, text: "★★★★★ A must-have for budgeting. Easy and efficient!" },
  { name: "Emily Davis", image: review3, text: "★★★★☆ Great features! Just wish there were more customization options." },
  { name: "James Wilson", image: review4, text: "★★★★★ Finally, an expense tracker that makes sense!" }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className="landing-container">
      <header className="landing-header">
        <Logo />
        <div className="auth-buttons">
          <button onClick={() => navigate("/signin")} className="btn">Sign In</button>
          <button onClick={() => navigate("/signup")} className="btn">Sign Up</button>
        </div>
      </header>

      <main className="main-content">
        <h2 className="tagline">The only expense tracker you will ever need!!!</h2>
        <p className="subtext">Welcome to PennyWise, where we do it all.</p>

        <div className="features-section">
          <div className="feature"><img src={featureIcon1} alt="Total Spending" /><p>Total Spending</p></div>
          <div className="feature"><img src={featureIcon2} alt="Monthly Alerts" /><p>Monthly Alerts</p></div>
          <div className="feature"><img src={featureIcon3} alt="OCR" /><p>Receipt to Text</p></div>
        </div>

        <div className="reviews-section">
          <h3>See What Others Are Saying</h3>
          <div className="review-carousel">
            <button className="arrow left" onClick={prevReview}>&lt;</button>
            <div className="review">
              <img src={reviews[currentIndex].image} alt="User" className="review-image" />
              <p className="review-name">{reviews[currentIndex].name}</p>
              <p>{reviews[currentIndex].text}</p>
            </div>
            <button className="arrow right" onClick={nextReview}>&gt;</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
