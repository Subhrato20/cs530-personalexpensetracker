import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import loginImage from "./assets/signin.jpg";
import Logo from "./components/Logo";

const Auth = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("loggedInUser", formData.username);
        navigate("/home");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Logo />
        <h2>Welcome Back!</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <button type="submit">Log In</button>
        </form>

        {message && <p className="error-message">{message}</p>}

        <p>
          Don't have an account?{" "}
          <button className="link-btn" onClick={() => navigate("/signup")}>Sign Up</button>
        </p>
      </div>

      <div className="auth-image-container">
        <img src={loginImage} alt="Finance Illustration" className="auth-image" />
      </div>
    </div>
  );
};

export default Auth;
