import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import logo from "./assets/logo.png"; // Logo at the top
import signupImage from "./assets/signup.jpg"; // The right-side image

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const payload = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        navigate("/signin");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signup-page">
      {/* Left Side: Signup Form */}
      <div className="signup-container">
        {/* Updated Header Section */}
        <div className="logo-container">
          <img
            src={logo}
            alt="PennyWise Logo"
            className="logo-icon"
            onClick={() => navigate("/")} // Redirect to Landing Page when clicked
            style={{ cursor: "pointer" }}
          />
          <h1 className="logo-text">PennyWise</h1>
        </div>

        <h2>Ready to Start Your Money Saving Journey</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          <button type="submit">Sign Up</button>
        </form>

        {message && <p className="error-message">{message}</p>}

        <p>
          Already have an account?{" "}
          <button className="link-btn" onClick={() => navigate("/signin")}>
            Sign In
          </button>
        </p>
      </div>

      {/* Right Side: Image */}
      <div className="signup-image-container">
        <img src={signupImage} alt="Finance Illustration" className="signup-image" />
      </div>
    </div>
  );
};

export default Signup;
