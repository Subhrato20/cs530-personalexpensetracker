import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Ensure the path is correct
import "./Logo.css";

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div className="logo-container" onClick={() => navigate("/")}>
      <img src={logo} alt="PennyWise Logo" className="logo-icon" />
      <h1 className="logo-text">PennyWise</h1>
    </div>
  );
};

export default Logo;
