import React, { useState, useEffect } from "react";
import "./Auth.css";
import Home from "./Home"; // Import Home Component

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ username: "", name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem("loggedInUser") || null); // Retrieve from localStorage

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("loggedInUser", loggedInUser); // Store user in localStorage
    }
  }, [loggedInUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const url = isSignup ? "http://127.0.0.1:5000/api/signup" : "http://127.0.0.1:5000/api/signin";
    const payload = isSignup
      ? { username: formData.username, name: formData.name, email: formData.email, password: formData.password }
      : { username: formData.username, email: formData.email, password: formData.password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        setLoggedInUser(formData.username); // Store logged-in user
        localStorage.setItem("loggedInUser", formData.username); // Save in localStorage
        setMessage(""); // Clear success message after login
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("loggedInUser"); // Clear localStorage
    setMessage(""); // Clear messages
    setFormData({ username: "", name: "", email: "", password: "" }); // Reset form
  };

  if (loggedInUser) {
    return <Home username={loggedInUser} onLogout={handleLogout} />;
  }

  return (
    <div className="auth-container">
      <h2>{isSignup ? "Sign Up" : "Log In"}</h2>
      <form onSubmit={handleSubmit}>
        {isSignup && <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />}
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        {isSignup && <input type="email" name="email" placeholder="Email" onChange={handleChange} required />}
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">{isSignup ? "Sign Up" : "Log In"}</button>
      </form>

      <p>
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button className="toggle-btn" onClick={() => { setIsSignup(!isSignup); setMessage(""); }}>
          {isSignup ? "Log In" : "Sign Up"}
        </button>
      </p>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Auth;
