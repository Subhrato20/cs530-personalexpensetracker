import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Threshold.css"; 
import logo from "./assets/logo.png"; // Ensure correct path

const Threshold = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [threshold, setThreshold] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchThreshold();
  }, []);

  const fetchThreshold = async () => {
    const username = localStorage.getItem("loggedInUser");
    if (!username) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/get_threshold?username=${username}`);
      const data = await response.json();
      if (data.success) {
        setThreshold(data.threshold);
      }
    } catch (error) {
      console.error("Error fetching threshold:", error);
    }
  };

  const handleSave = async () => {
    const username = localStorage.getItem("loggedInUser");
    if (!username || !threshold) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/api/set_threshold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, amount: parseFloat(threshold) }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error setting threshold:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  return (
    <div className="threshold-page">
      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
        <h2>PennyWise</h2>
        <ul>
          <li onClick={() => navigate("/home")}>Home</li>
          <li onClick={() => navigate("/profile")}>Profile</li>
          <li>Set Alerts</li> {/* Current Page */}
          <li onClick={() => {
              sessionStorage.setItem("openUploadModal", "true");
              navigate("/home");
            }}>Upload Receipt
          </li>
          <li>Link Bank (Coming Soon)</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Header Section */}
      <div className="header">
        <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
        <div className="logo-container">
          <img src={logo} alt="PennyWise Logo" className="logo" />
          <h2>PennyWise</h2>
        </div>
      </div>

      {/* Threshold Settings Section */}
      <div className="threshold-container">
        <h2>Set Monthly Spending Limit</h2>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="Enter threshold amount"
          className="threshold-input"
        />
        <div className="threshold-buttons">
          <button className="save-threshold-btn" onClick={handleSave}>Save</button>
          <button className="cancel-threshold-btn" onClick={() => navigate("/home")}>Cancel</button>
        </div>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Threshold;
